import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from '../controllers/userController';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';
import asyncHandler from '../middleware/asyncHandler';

const router = Router();

router.get('/', auth, authorize('admin', 'teacher'), asyncHandler(getUsers));
router.get('/:id', auth, authorize('admin', 'teacher'), asyncHandler(getUserById));
router.post('/', auth, authorize('admin'), asyncHandler(createUser));
router.put('/:id', auth, authorize('admin'), asyncHandler(updateUser));
router.delete('/:id', auth, authorize('admin'), asyncHandler(deleteUser));
router.post('/:id/reset-password', auth, authorize('admin'), asyncHandler(resetPassword));

export default router;
