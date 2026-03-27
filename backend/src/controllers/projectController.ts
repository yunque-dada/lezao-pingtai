import { Request, Response } from 'express';
import Project from '../models/Project';
import { IProject } from '../models/Project';
import { AuthRequest } from '../middleware/auth';

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, course, author, search } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }
    if (course) {
      query.course = course;
    }
    if (author) {
      query.author = author;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .populate('author', 'username realName avatar')
      .populate('course', 'title')
      .populate('reviewedBy', 'username realName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: '获取作品列表失败'
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('author', 'username realName avatar email')
      .populate('course', 'title description')
      .populate('reviewedBy', 'username realName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    project.views += 1;
    await project.save();

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: '获取作品详情失败'
    });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, course, scratchData, thumbnail, tags } = req.body;

    const project = new Project({
      title,
      description,
      author: req.user?._id,
      course,
      scratchData,
      thumbnail,
      tags: tags || []
    });

    await project.save();

    const savedProject = await Project.findById(project._id)
      .populate('author', 'username realName avatar')
      .populate('course', 'title');

    res.status(201).json({
      success: true,
      message: '作品创建成功',
      data: { project: savedProject }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: '创建作品失败'
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, course, scratchData, thumbnail, tags, isPublic } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    if (project.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限修改此作品'
      });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (course !== undefined) project.course = course;
    if (scratchData !== undefined) project.scratchData = scratchData;
    if (thumbnail !== undefined) project.thumbnail = thumbnail;
    if (tags !== undefined) project.tags = tags;
    if (isPublic !== undefined) project.isPublic = isPublic;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('author', 'username realName avatar')
      .populate('course', 'title');

    res.json({
      success: true,
      message: '作品更新成功',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: '更新作品失败'
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    if (project.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限删除此作品'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: '删除作品失败'
    });
  }
};

export const submitProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    if (project.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权限提交此作品'
      });
    }

    if (project.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: '只能提交草稿状态的作品'
      });
    }

    project.status = 'submitted';
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('author', 'username realName avatar')
      .populate('course', 'title');

    res.json({
      success: true,
      message: '作品提交成功',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({
      success: false,
      message: '提交作品失败'
    });
  }
};

export const reviewProject = async (req: AuthRequest, res: Response) => {
  try {
    const { status, score, comment, isFeatured } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    if (project.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: '只能审核已提交的作品'
      });
    }

    if (status !== undefined) project.status = status;
    if (score !== undefined) project.score = score;
    if (comment !== undefined) project.comment = comment;
    if (isFeatured !== undefined) project.isFeatured = isFeatured;
    project.reviewedBy = req.user?._id;
    project.reviewedAt = new Date();

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('author', 'username realName avatar')
      .populate('course', 'title')
      .populate('reviewedBy', 'username realName');

    res.json({
      success: true,
      message: '作品审核成功',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Review project error:', error);
    res.status(500).json({
      success: false,
      message: '审核作品失败'
    });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    project.isFeatured = !project.isFeatured;
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('author', 'username realName avatar')
      .populate('course', 'title');

    res.json({
      success: true,
      message: project.isFeatured ? '作品已设为推荐' : '作品已取消推荐',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
};

export const likeProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    project.likes += 1;
    await project.save();

    res.json({
      success: true,
      data: { likes: project.likes }
    });
  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败'
    });
  }
};
