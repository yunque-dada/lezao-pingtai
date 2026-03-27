import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Course from '../models/Course';
import LessonProgress from '../models/LessonProgress';
import Project from '../models/Project';
import ScratchProject from '../models/ScratchProject';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, AuthorizationError } from '../utils/errors';

// 获取用户统计数据
export const getUserStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  // 检查权限
  if (req.user?.role !== 'admin') {
    throw new AuthorizationError('无权访问统计数据');
  }

  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate as string) : new Date();

  // 用户总数
  const totalUsers = await User.countDocuments();
  
  // 按角色统计
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // 新增用户趋势（按天）
  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 活跃用户统计（最近7天有登录）
  const activeUsers = await User.countDocuments({
    lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      userGrowth,
      activeUsers,
      period: { start, end }
    }
  });
});

// 获取课程统计数据
export const getCourseStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
    throw new AuthorizationError('无权访问统计数据');
  }

  // 课程总数
  const totalCourses = await Course.countDocuments();
  
  // 已发布课程数
  const publishedCourses = await Course.countDocuments({ status: 'published' });

  // 课程报名统计
  const courseEnrollments = await Course.aggregate([
    {
      $project: {
        title: 1,
        enrollmentCount: { $size: { $ifNull: ['$students', []] } }
      }
    },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 10 }
  ]);

  // 课程完成率统计
  const courseCompletionRates = await LessonProgress.aggregate([
    {
      $group: {
        _id: '$course',
        totalStudents: { $addToSet: '$student' },
        completedStudents: {
          $addToSet: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$student', null]
          }
        }
      }
    },
    {
      $project: {
        totalStudents: { $size: '$totalStudents' },
        completedStudents: {
          $size: {
            $filter: {
              input: '$completedStudents',
              as: 'student',
              cond: { $ne: ['$$student', null] }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    { $unwind: '$courseInfo' },
    {
      $project: {
        courseTitle: '$courseInfo.title',
        totalStudents: 1,
        completedStudents: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedStudents', { $max: ['$totalStudents', 1] }] },
            100
          ]
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalCourses,
      publishedCourses,
      courseEnrollments,
      courseCompletionRates
    }
  });
});

// 获取学习统计数据
export const getLearningStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    throw new AuthorizationError('无权访问统计数据');
  }

  // 总学习时长
  const totalLearningTime = await LessonProgress.aggregate([
    {
      $group: {
        _id: null,
        totalTime: { $sum: '$timeSpent' }
      }
    }
  ]);

  // 学习进度分布
  const progressDistribution = await LessonProgress.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // 每日学习活跃度
  const dailyActivity = await LessonProgress.aggregate([
    {
      $match: {
        lastAccessAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastAccessAt' } },
        activeUsers: { $addToSet: '$student' },
        totalTime: { $sum: '$timeSpent' }
      }
    },
    {
      $project: {
        activeUsers: { $size: '$activeUsers' },
        totalTime: 1
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalLearningTime: totalLearningTime[0]?.totalTime || 0,
      progressDistribution: progressDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      dailyActivity
    }
  });
});

// 获取作品统计数据
export const getProjectStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    throw new AuthorizationError('无权访问统计数据');
  }

  // Scratch作品统计
  const scratchStats = await ScratchProject.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        publicCount: {
          $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
        },
        featuredCount: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' }
      }
    }
  ]);

  // 作品创作趋势
  const creationTrend = await ScratchProject.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 热门作品Top10
  const topProjects = await ScratchProject.find()
    .sort({ views: -1, likes: -1 })
    .limit(10)
    .select('title authorName views likes createdAt');

  res.json({
    success: true,
    data: {
      scratchStats: scratchStats[0] || {
        total: 0,
        publicCount: 0,
        featuredCount: 0,
        totalViews: 0,
        totalLikes: 0
      },
      creationTrend,
      topProjects
    }
  });
});

// 获取仪表盘概览数据
export const getDashboardOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    throw new AuthorizationError('无权访问仪表盘');
  }

  // 并行获取各项统计数据
  const [
    totalUsers,
    totalCourses,
    totalProjects,
    totalLearningTime,
    recentUsers,
    recentProjects
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    ScratchProject.countDocuments(),
    LessonProgress.aggregate([
      { $group: { _id: null, total: { $sum: '$timeSpent' } } }
    ]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username role createdAt'),
    ScratchProject.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title authorName createdAt')
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalCourses,
        totalProjects,
        totalLearningTime: totalLearningTime[0]?.total || 0
      },
      recentUsers,
      recentProjects
    }
  });
});
