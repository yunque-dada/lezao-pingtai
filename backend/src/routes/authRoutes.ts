import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController';
import auth from '../middleware/auth';
import asyncHandler from '../middleware/asyncHandler';
import { loginLimiter, createAccountLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', createAccountLimiter, asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.get('/me', auth, asyncHandler(getMe));
router.put('/profile', auth, asyncHandler(updateProfile));
router.put('/password', auth, asyncHandler(changePassword));

export default router;
