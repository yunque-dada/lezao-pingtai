import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  submitProject,
  reviewProject,
  toggleFeatured,
  likeProject
} from '../controllers/projectController';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';
import asyncHandler from '../middleware/asyncHandler';

const router = Router();

router.get('/', auth, asyncHandler(getAllProjects));
router.get('/:id', auth, asyncHandler(getProjectById));
router.post('/', auth, asyncHandler(createProject));
router.put('/:id', auth, asyncHandler(updateProject));
router.delete('/:id', auth, asyncHandler(deleteProject));
router.post('/:id/submit', auth, asyncHandler(submitProject));
router.post('/:id/review', auth, authorize('teacher', 'admin'), asyncHandler(reviewProject));
router.post('/:id/toggle-featured', auth, authorize('teacher', 'admin'), asyncHandler(toggleFeatured));
router.post('/:id/like', auth, asyncHandler(likeProject));

export default router;
