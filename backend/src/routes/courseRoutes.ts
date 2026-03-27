import { Router } from 'express';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  enrollCourse,
  getMyCourses,
  getCourseStats
} from '../controllers/courseController';

const router = Router();

router.get('/', getCourses);

router.get('/my-courses', auth, getMyCourses);

router.get('/:id', getCourseById);

router.post('/', auth, authorize('teacher', 'admin'), createCourse);

router.put('/:id', auth, updateCourse);

router.delete('/:id', auth, deleteCourse);

router.patch('/:id/publish', auth, authorize('teacher', 'admin'), publishCourse);

router.patch('/:id/archive', auth, authorize('teacher', 'admin'), archiveCourse);

router.post('/:id/enroll', auth, authorize('student'), enrollCourse);

router.get('/:id/stats', auth, authorize('teacher', 'admin'), getCourseStats);

export default router;
