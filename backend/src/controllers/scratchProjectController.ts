import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import ScratchProject from '../models/ScratchProject';
import Teacher from '../models/Teacher';
import Student from '../models/Student';
import User from '../models/User';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { successResponse, createdResponse, unauthorizedResponse } from '../utils/response';
import fileService from '../services/fileService';

/**
 * 检查用户是否有权限操作作品
 * 权限规则：
 * - 管理员：可以编辑删除全部账号作品
 * - 老师：可以编辑删除全部学生账号作品
 * - 学生：只能编辑自己账号作品（不能删除）
 */
const checkProjectPermission = async (req: AuthRequest, project: any, requireDelete: boolean = false): Promise<boolean> => {
  if (!req.user) return false;
  
  const userRole = req.user.role;
  const userId = req.user._id.toString();
  const projectAuthorId = project.author.toString();

  // 管理员可以做任何操作
  if (userRole === 'admin') {
    return true;
  }

  // 学生只能编辑自己的作品，不能删除
  if (userRole === 'student') {
    if (requireDelete) return false;
    return projectAuthorId === userId;
  }

  // 老师可以编辑删除所有学生的作品
  if (userRole === 'teacher') {
    // 检查作品作者是否是学生
    const authorUser = await User.findById(projectAuthorId);
    if (!authorUser) return false;
    
    if (authorUser.role === 'student') {
      return true;
    }
    
    // 老师不能操作其他老师或管理员的作品
    return false;
  }

  return false;
};

/**
 * 获取所有项目列表
 * 支持分页、筛选和搜索
 * 根据用户角色显示不同的项目列表
 */
export const getAllProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    author, isPublic, isFeatured, tags, search, page = 1, limit = 10 } = req.query;

  const query: any = {};

  // 根据用户角色过滤项目
  if (req.user) {
    if (req.user.role === 'teacher') {
      // 老师可以看到所有学生的作品
      const studentUsers = await User.find({ role: 'student' }).select('_id');
      const studentIds = studentUsers.map(u => u._id);
      query.author = { $in: studentIds };
    } else if (req.user.role === 'student') {
      // 学生只能看到自己的作品
      query.author = req.user._id;
    }
    // 管理员可以看到所有作品，不需要过滤
  }

  if (author) {
    query.author = author;
  }
  if (isPublic !== undefined) {
    query.isPublic = isPublic === 'true';
  }
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagsArray };
  }
  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    ScratchProject.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ScratchProject.countDocuments(query),
  ]);

  successResponse(res, '获取Scratch项目列表成功', {
    projects,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

/**
 * 根据ID获取项目详情
 * 支持两种返回格式：
 * 1. API请求：返回完整项目数据（JSON格式）
 * 2. Scratch编辑器请求：返回解析后的projectData（原始JSON）
 */
export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await ScratchProject.findById(req.params.id);
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  // 增加浏览量（异步执行，不阻塞响应）
  ScratchProject.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
  
  // Check if the request is from Scratch 3.0 editor (it doesn't send accept header with application/json)
  if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
    // Return full project data for API requests
    successResponse(res, '获取Scratch项目详情成功', project);
  } else {
    // Return parsed projectData as raw JSON for Scratch 3.0 editor
    try {
      // First unescape HTML entities, then parse as JSON
      if (project.projectData) {
        const unescapedProjectData = project.projectData
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        const parsedProjectData = JSON.parse(unescapedProjectData);
        res.json(parsedProjectData);
      } else {
        // If projectData is undefined, return a default Scratch 3.0 project
        const defaultProject = {
          meta: {
            semver: "3.0.0",
            vm: "0.2.0-prerelease",
            agent: "Scratch Editor"
          },
          targets: [
            {
              isStage: true,
              name: "Stage",
              variables: {},
              lists: {},
              broadcasts: {},
              blocks: {},
              comments: {},
              currentCostume: 0,
              costumes: [
                {
                  assetId: "09dc12d931324406972b7b980f4b98ae",
                  name: "backdrop1",
                  md5ext: "09dc12d931324406972b7b980f4b98ae.svg",
                  dataFormat: "svg",
                  rotationCenterX: 480,
                  rotationCenterY: 360
                }
              ],
              sounds: [],
              volume: 100,
              layerOrder: 0,
              tempo: 60,
              videoTransparency: 50,
              videoState: "on",
              textToSpeechLanguage: null
            }
          ],
          monitors: []
        };
        res.json(defaultProject);
      }
    } catch (error) {
      console.error('解析项目数据失败:', error);
      // If parsing fails, return a default Scratch 3.0 project
      const defaultProject = {
        meta: {
          semver: "3.0.0",
          vm: "0.2.0-prerelease",
          agent: "Scratch Editor"
        },
        targets: [
          {
            isStage: true,
            name: "Stage",
            variables: {},
            lists: {},
            broadcasts: {},
            blocks: {},
            comments: {},
            currentCostume: 0,
            costumes: [
              {
                assetId: "09dc12d931324406972b7b980f4b98ae",
                name: "backdrop1",
                md5ext: "09dc12d931324406972b7b980f4b98ae.svg",
                dataFormat: "svg",
                rotationCenterX: 480,
                rotationCenterY: 360
              }
            ],
            sounds: [],
            volume: 100,
            layerOrder: 0,
            tempo: 60,
            videoTransparency: 50,
            videoState: "on",
            textToSpeechLanguage: null
          }
        ],
        monitors: []
      };
      res.json(defaultProject);
    }
  }
});

/**
 * 创建新项目
 * 需要登录权限
 */
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, projectData, thumbnail, isPublic, tags } = req.body;

    if (!req.user) {
      return unauthorizedResponse(res, '请先登录');
    }

    // 验证必填字段
    if (!title) {
      return successResponse(res, '项目标题不能为空', null, 400);
    }

    if (!projectData) {
      return successResponse(res, '项目数据不能为空', null, 400);
    }

    // 解码Base64数据
    const fileBuffer = Buffer.from(projectData, 'base64');

    // 保存文件
    const filepath = await fileService.saveProjectFile(req.user._id.toString(), fileBuffer, title || '未命名作品');

    const project = await ScratchProject.create({
      title: title || '未命名作品',
      description: description || '',
      path: filepath,
      size: fileBuffer.length,
      thumbnail: thumbnail || '',
      author: req.user._id,
      authorName: req.user.username,
      isPublic: isPublic || false,
      tags: tags || [],
    });

    createdResponse(res, '创建Scratch项目成功', project);
  } catch (error: any) {
    console.error('创建项目失败:', error);
    successResponse(res, `创建项目失败: ${error.message}`, null, 500);
  }
});

/**
 * 更新项目
 * 根据角色权限控制更新
 */
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const project = await ScratchProject.findById(req.params.id);
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // 权限检查
    const hasPermission = await checkProjectPermission(req, project, false);
    if (!hasPermission) {
      throw new AuthorizationError('Not authorized to update this project');
    }

    const { title, description, projectData, thumbnail, isPublic, tags } = req.body;

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = tags;

    // 处理项目数据更新
    if (projectData !== undefined) {
      // 解码Base64数据
      const fileBuffer = Buffer.from(projectData, 'base64');
      
      // 删除旧文件
      if (project.path) {
        await fileService.deleteProjectFile(project.path);
      }
      
      // 保存新文件
      const newPath = await fileService.saveProjectFile(req.user!._id.toString(), fileBuffer, title || project.title);
      
      updateData.path = newPath;
      updateData.size = fileBuffer.length;
    }

    const updatedProject = await ScratchProject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    successResponse(res, '更新Scratch项目成功', updatedProject);
  } catch (error: any) {
    console.error('更新项目失败:', error);
    successResponse(res, `更新项目失败: ${error.message}`, null, 500);
  }
});

/**
 * 删除项目
 * 根据角色权限控制删除
 */
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await ScratchProject.findById(req.params.id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // 权限检查
  const hasPermission = await checkProjectPermission(req, project, true);
  if (!hasPermission) {
    throw new AuthorizationError('Not authorized to delete this project');
  }

  // 删除文件系统中的文件
  if (project.path) {
    await fileService.deleteProjectFile(project.path);
  }

  await ScratchProject.findByIdAndDelete(req.params.id);
  successResponse(res, '删除Scratch项目成功', {});
});

/**
 * 点赞项目
 */
export const likeProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await ScratchProject.findById(req.params.id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.likedBy.includes(req.user?._id)) {
    throw new Error('Already liked this project');
  }

  project.likedBy.push(req.user?._id);
  project.likes = project.likedBy.length;
  
  await project.save();
  
  successResponse(res, '点赞Scratch项目成功', project);
});

/**
 * 取消点赞
 */
export const unlikeProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await ScratchProject.findById(req.params.id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  project.likedBy = project.likedBy.filter(
    (id) => id.toString() !== req.user?._id.toString()
  );
  project.likes = project.likedBy.length;
  
  await project.save();
  
  successResponse(res, '取消点赞Scratch项目成功', project);
});

/**
 * 增加浏览量
 */
export const incrementViews = asyncHandler(async (req: Request, res: Response) => {
  const project = await ScratchProject.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  successResponse(res, '增加Scratch项目浏览量成功', project);
});

/**
 * 切换推荐状态（仅管理员）
 */
export const toggleFeatured = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    throw new AuthorizationError('Not authorized');
  }

  const project = await ScratchProject.findById(req.params.id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  project.isFeatured = !project.isFeatured;
  await project.save();
  
  successResponse(res, '切换Scratch项目推荐状态成功', project);
});

/**
 * 获取当前用户的项目列表
 */
export const getMyProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isPublic, isFeatured, tags, search, page = 1, limit = 10 } = req.query;

  const query: any = { author: req.user?._id };

  if (isPublic !== undefined) {
    query.isPublic = isPublic === 'true';
  }
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagsArray };
  }
  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    ScratchProject.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ScratchProject.countDocuments(query),
  ]);

  successResponse(res, '获取我的Scratch项目列表成功', {
    projects,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

/**
 * 获取当前用户文件系统中的项目列表
 * 直接从文件系统读取sb3文件
 */
export const getMyFileProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return unauthorizedResponse(res, '请先登录');
  }

  try {
    const fileProjects = await fileService.getProjectFilesWithDetails(req.user._id.toString());
    const userId = req.user._id.toString();
    
    successResponse(res, '获取文件系统项目列表成功', {
      projects: fileProjects.map(file => ({
        _id: file.filename,
        title: file.title,
        filename: file.filename,
        modifiedTime: file.modifiedTime,
        size: file.size,
        author: req.user?._id,
        authorName: req.user?.username,
      })),
      total: fileProjects.length,
    });
  } catch (error: any) {
    console.error('获取文件系统项目列表失败:', error);
    successResponse(res, `获取文件系统项目列表失败: ${error.message}`, null, 500);
  }
});

/**
 * 获取所有用户文件系统中的项目列表（仅管理员和老师）
 * 对于老师：返回老师自己的作品 + 所有学生的作品
 * 对于管理员：返回所有用户的作品
 */
export const getAllFileProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return unauthorizedResponse(res, '请先登录');
  }

  // 只有管理员和老师可以查看所有用户的文件
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return unauthorizedResponse(res, '无权查看所有作品');
  }

  try {
    const allProjects: any[] = [];
    
    // 获取所有用户（包括老师、学生、管理员）
    const allUsers = await User.find({}).select('_id username role');
    console.log('所有用户数量:', allUsers.length);
    
    // 遍历每个用户的文件
    for (const user of allUsers) {
      const userId = user._id.toString();
      const fileProjects = await fileService.getProjectFilesWithDetails(userId);
      
      fileProjects.forEach(file => {
        // 根据文件名中的 clientMark 智能识别是老师作品还是学生作品
        // clientMark: 1=老师端, 2=学生端, 3=管理端
        // 如果有 clientMark，优先使用 clientMark 判断
        // 如果没有 clientMark（旧文件），则根据用户角色判断
        let isTeacherWork = false;
        
        if (file.clientMark) {
          // 使用文件名标记判断
          isTeacherWork = file.clientMark === 1 || file.clientMark === 3; // 1=老师, 3=管理员
          console.log('  找到带标记的文件:', file.filename, 'clientMark:', file.clientMark, 'isTeacherWork:', isTeacherWork);
        } else {
          // 旧文件，根据用户角色判断
          isTeacherWork = user.role === 'teacher' || user.role === 'admin';
        }
        
        allProjects.push({
          _id: file.filename,
          title: file.title,
          filename: file.filename,
          modifiedTime: file.modifiedTime,
          size: file.size,
          author: user._id,
          authorName: user.username,
          userId: userId,
          isOwn: isTeacherWork,
          clientMark: file.clientMark, // 也返回 clientMark，方便前端使用
        });
      });
    }
    
    console.log('总作品数量:', allProjects.length);
    console.log('老师/管理员作品数量:', allProjects.filter(p => p.isOwn).length);
    console.log('学生作品数量:', allProjects.filter(p => !p.isOwn).length);
    
    // 按修改时间倒序排列
    allProjects.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime());
    
    successResponse(res, '获取所有文件系统项目列表成功', {
      projects: allProjects,
      total: allProjects.length,
    });
  } catch (error: any) {
    console.error('获取所有文件系统项目列表失败:', error);
    successResponse(res, `获取所有文件系统项目列表失败: ${error.message}`, null, 500);
  }
});

/**
 * 根据文件名下载项目
 * 用于从文件系统直接加载sb3文件
 * 支持通过userId参数让管理员/老师下载任意学生的文件
 */
export const downloadProjectByFilename = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return unauthorizedResponse(res, '请先登录');
  }

  try {
    const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
    if (!filename) {
      throw new Error('文件名不能为空');
    }
    // 解码文件名，因为前端使用了encodeURIComponent编码
    const decodedFilename = decodeURIComponent(filename);
    
    // 获取目标用户ID，优先使用查询参数中的userId（用于管理员/老师查看学生作品）
    // 如果没有提供，则使用当前登录用户的ID
    let targetUserId = req.query.userId as string;
    
    // 如果提供了userId且不是当前用户，检查权限
    if (targetUserId && targetUserId !== req.user._id.toString()) {
      // 只有管理员和老师可以查看其他用户的文件
      if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        throw new AuthorizationError('无权访问此文件');
      }
    } else {
      // 使用当前用户ID
      targetUserId = req.user._id.toString();
    }
    
    // 构建文件路径
    const scratchDir = path.join(__dirname, '../../uploads', 'users', `user_${targetUserId}`, 'scratch');
    const fullPath = path.join(scratchDir, decodedFilename);
    
    console.log('尝试加载文件:', decodedFilename);
    console.log('目标用户ID:', targetUserId);
    console.log('完整文件路径:', fullPath);
    
    // 直接读取文件
    const fileBuffer = await fs.promises.readFile(fullPath);
    console.log('读取的文件大小:', fileBuffer.length);
    console.log('文件前100字节:', fileBuffer.slice(0, 100));
    
    // 设置正确的Content-Type，sb3文件是ZIP格式
    res.setHeader('Content-Type', 'application/x.scratch.sb3');
    res.setHeader('Content-Length', fileBuffer.length);
    // 移除Content-Disposition，避免浏览器将其作为附件处理
    res.send(fileBuffer);
  } catch (error: any) {
    console.error('根据文件名下载项目失败:', error);
    successResponse(res, `下载项目失败: ${error.message}`, null, 500);
  }
});

/**
 * 下载项目
 * 支持下载sb3文件
 */
export const downloadProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await ScratchProject.findById(req.params.id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // 权限检查
  if (project.author.toString() !== req.user?._id.toString() && !project.isPublic && req.user?.role !== 'admin') {
    throw new AuthorizationError('Not authorized to access this project');
  }

  try {
    const fileBuffer = await fileService.readProjectFile(project.path);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(project.title)}.sb3"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (error) {
    console.error('下载项目失败:', error);
    throw new Error('下载项目失败');
  }
});

/**
 * 保存项目（创建或更新）
 * 统一接口，根据是否有projectId决定是创建还是更新
 * 支持直接上传sb3文件
 */
export const saveProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, title, isPublic, tags } = req.body;

    if (!req.user) {
      return unauthorizedResponse(res, '请先登录');
    }

    // 获取上传的文件
    const uploadedFile = (req as any).file;
    if (!uploadedFile) {
      return successResponse(res, '项目文件不能为空', null, 400);
    }

    console.log('接收到的文件大小:', uploadedFile.size);
    console.log('文件前100字节:', uploadedFile.buffer.slice(0, 100));

    // 使用上传的文件buffer
    const fileBuffer = uploadedFile.buffer;

    if (projectId) {
      // 更新现有项目
      const project = await ScratchProject.findById(projectId);
      if (!project) {
        return successResponse(res, '项目不存在', null, 404);
      }

      // 权限检查
      const hasPermission = await checkProjectPermission(req, project, false);
      if (!hasPermission) {
        return successResponse(res, '无权更新此项目', null, 403);
      }

      // 删除旧文件
      if (project.path) {
        await fileService.deleteProjectFile(project.path);
      }

      // 保存新文件
      // 根据用户角色设置客户端标记 (1=老师端, 2=学生端, 3=管理端)
      let clientMark: number | undefined;
      if (req.user.role === 'teacher') {
        clientMark = 1;
      } else if (req.user.role === 'student') {
        clientMark = 2;
      } else if (req.user.role === 'admin') {
        clientMark = 3;
      }
      
      const newPath = await fileService.saveProjectFile(req.user._id.toString(), fileBuffer, title || project.title, clientMark);

      const updatedProject = await ScratchProject.findByIdAndUpdate(
        projectId,
        {
          title: title || project.title,
          path: newPath,
          size: fileBuffer.length,
          isPublic: isPublic !== undefined ? isPublic : project.isPublic,
          tags: tags !== undefined ? tags : project.tags,
        },
        { new: true, runValidators: true }
      );

      return successResponse(res, '更新项目成功', updatedProject);
    } else {
      // 创建新项目
      // 根据用户角色设置客户端标记 (1=老师端, 2=学生端, 3=管理端)
      let clientMark: number | undefined;
      if (req.user.role === 'teacher') {
        clientMark = 1;
      } else if (req.user.role === 'student') {
        clientMark = 2;
      } else if (req.user.role === 'admin') {
        clientMark = 3;
      }
      
      const filepath = await fileService.saveProjectFile(req.user._id.toString(), fileBuffer, title || '未命名作品', clientMark);

      const project = await ScratchProject.create({
        title: title || '未命名作品',
        path: filepath,
        size: fileBuffer.length,
        author: req.user._id,
        authorName: req.user.username,
        isPublic: isPublic || false,
        tags: tags || [],
      });

      return createdResponse(res, '创建项目成功', project);
    }
  } catch (error: any) {
    console.error('保存项目失败:', error);
    return successResponse(res, `保存项目失败: ${error.message}`, null, 500);
  }
});
