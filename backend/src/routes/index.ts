import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import courseRoutes from './courseRoutes';
import projectRoutes from './projectRoutes';
import scratchProjectRoutes from './scratchProjectRoutes';
import scratchResourceRoutes from './scratchResourceRoutes';
import learningRoutes from './learningRoutes';
import discussionRoutes from './discussionRoutes';
import statisticsRoutes from './statisticsRoutes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '少儿编程课程平台 API',
    version: '1.0.0',
    endpoints: {
      auth: {
        path: '/api/auth',
        description: '认证相关接口',
        endpoints: [
          'POST /login - 用户登录',
          'GET /me - 获取当前用户信息',
          'PUT /profile - 更新用户资料',
          'PUT /password - 修改密码',
        ],
      },
      users: {
        path: '/api/users',
        description: '用户管理接口',
        endpoints: [
          'GET / - 获取用户列表',
          'GET /:id - 获取用户详情',
          'PUT /:id - 更新用户信息',
          'DELETE /:id - 删除用户',
        ],
      },
      courses: {
        path: '/api/courses',
        description: '课程管理接口',
        endpoints: [
          'GET / - 获取课程列表',
          'GET /my-courses - 获取我的课程',
          'GET /:id - 获取课程详情',
          'POST / - 创建课程',
          'PUT /:id - 更新课程',
          'DELETE /:id - 删除课程',
          'PATCH /:id/publish - 发布课程',
          'PATCH /:id/archive - 归档课程',
          'POST /:id/enroll - 报名课程',
          'GET /:id/stats - 获取课程统计',
        ],
      },
      projects: {
        path: '/api/projects',
        description: '作品管理接口',
        endpoints: [
          'GET / - 获取作品列表',
          'GET /:id - 获取作品详情',
          'POST / - 创建作品',
          'PUT /:id - 更新作品',
          'DELETE /:id - 删除作品',
          'POST /:id/submit - 提交作品',
          'POST /:id/review - 审核作品',
          'POST /:id/toggle-featured - 切换推荐状态',
          'POST /:id/like - 点赞作品',
        ],
      },
      scratch: {
        path: '/api/scratch',
        description: 'Scratch项目管理接口',
        endpoints: [
          'GET /projects - 获取Scratch项目列表',
          'GET /projects/my - 获取我的Scratch项目',
          'GET /projects/:id - 获取Scratch项目详情',
          'POST /projects - 创建Scratch项目',
          'PUT /projects/:id - 更新Scratch项目',
          'DELETE /projects/:id - 删除Scratch项目',
          'POST /projects/:id/like - 点赞Scratch项目',
          'POST /projects/:id/unlike - 取消点赞Scratch项目',
          'POST /projects/:id/view - 增加浏览量',
          'POST /projects/:id/featured - 切换推荐状态（管理员）',
        ],
      },
      scratchResources: {
        path: '/api/scratch/resources',
        description: 'Scratch资源管理接口',
        endpoints: [
          'GET /sprites - 获取角色库列表',
          'GET /sprites/:id - 获取角色详情',
          'POST /sprites - 创建角色（管理员）',
          'PUT /sprites/:id - 更新角色（管理员）',
          'DELETE /sprites/:id - 删除角色（管理员）',
          'GET /backdrops - 获取背景库列表',
          'GET /backdrops/:id - 获取背景详情',
          'POST /backdrops - 创建背景（管理员）',
          'PUT /backdrops/:id - 更新背景（管理员）',
          'DELETE /backdrops/:id - 删除背景（管理员）',
          'GET /sounds - 获取音乐库列表',
          'GET /sounds/:id - 获取音乐详情',
          'POST /sounds - 创建音乐（管理员）',
          'PUT /sounds/:id - 更新音乐（管理员）',
          'DELETE /sounds/:id - 删除音乐（管理员）',
        ],
      },
      learning: {
        path: '/api/learning',
        description: '课程学习管理接口',
        endpoints: [
          'GET /progress - 获取所有课程的学习进度',
          'GET /progress/:courseId - 获取特定课程的学习进度',
          'PUT /progress/:lessonId - 更新课时学习进度',
          'POST /progress/:lessonId/video - 记录视频播放进度',
          'POST /progress/:lessonId/complete - 标记课时为已完成',
        ],
      },
      discussions: {
        path: '/api/courses/:courseId/discussions',
        description: '课程讨论接口',
        endpoints: [
          'GET / - 获取讨论列表',
          'POST / - 创建讨论',
          'GET /:id - 获取讨论详情',
          'PUT /:id - 更新讨论',
          'DELETE /:id - 删除讨论',
          'POST /:id/replies - 添加回复',
          'DELETE /:id/replies/:replyId - 删除回复',
          'POST /:id/like - 点赞讨论',
          'POST /:id/unlike - 取消点赞',
          'POST /:id/replies/:replyId/like - 点赞回复',
          'POST /:id/resolve - 标记为已解决',
          'POST /:id/pin - 置顶/取消置顶',
        ],
      },
      statistics: {
        path: '/api/statistics',
        description: '数据统计接口',
        endpoints: [
          'GET /dashboard - 仪表盘概览',
          'GET /users - 用户统计',
          'GET /courses - 课程统计',
          'GET /learning - 学习统计',
          'GET /projects - 作品统计',
        ],
      },
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/projects', projectRoutes);
router.use('/scratch/projects', scratchProjectRoutes);
router.use('/scratch/resources', scratchResourceRoutes);
router.use('/learning', learningRoutes);
router.use('/courses/:courseId/discussions', discussionRoutes);
router.use('/statistics', statisticsRoutes);

export default router;
