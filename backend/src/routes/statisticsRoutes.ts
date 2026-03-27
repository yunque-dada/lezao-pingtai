import express from 'express';
import {
  getUserStatistics,
  getCourseStatistics,
  getLearningStatistics,
  getProjectStatistics,
  getDashboardOverview,
} from '../controllers/statisticsController';
import auth from '../middleware/auth';

const router = express.Router();

// 仪表盘概览
router.get('/dashboard', auth, getDashboardOverview);

// 用户统计
router.get('/users', auth, getUserStatistics);

// 课程统计
router.get('/courses', auth, getCourseStatistics);

// 学习统计
router.get('/learning', auth, getLearningStatistics);

// 作品统计
router.get('/projects', auth, getProjectStatistics);

export default router;
