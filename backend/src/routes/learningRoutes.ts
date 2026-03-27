import express from 'express';
import {
  getStudentProgress,
  updateLessonProgress,
  getAllCoursesProgress,
  recordVideoProgress,
  completeLesson,
} from '../controllers/learningController';
import auth from '../middleware/auth';

const router = express.Router();

// 获取所有课程的学习进度
router.get('/progress', auth, getAllCoursesProgress);

// 获取特定课程的学习进度
router.get('/progress/:courseId', auth, getStudentProgress);

// 更新课时学习进度
router.put('/progress/:lessonId', auth, updateLessonProgress);

// 记录视频播放进度
router.post('/progress/:lessonId/video', auth, recordVideoProgress);

// 标记课时为已完成
router.post('/progress/:lessonId/complete', auth, completeLesson);

export default router;
