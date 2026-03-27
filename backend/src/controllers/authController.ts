import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { successResponse } from '../utils/response';
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  DuplicateEntryError 
} from '../utils/errors';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, email, role, realName, phone, gender, birthday, bio } = req.body;

  if (!username || !password || !email) {
    throw new ValidationError('请填写所有必填字段');
  }

  if (password.length < 6) {
    throw new ValidationError('密码长度至少为6位');
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new DuplicateEntryError('用户名或邮箱已存在');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    password: hashedPassword,
    email,
    role: role || 'student',
    realName,
    phone,
    gender,
    birthday,
    bio,
  });

  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
    username: user.username,
  });

  successResponse(res, '注册成功', {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      realName: user.realName,
    },
  }, 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ValidationError('请输入用户名和密码');
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  }).select('+password');

  if (!user) {
    throw new AuthenticationError('用户名不存在');
  }

  if (user.status !== 'active') {
    throw new AuthenticationError('账户已被禁用');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AuthenticationError('密码错误');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
    username: user.username,
  });

  successResponse(res, '登录成功', {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      realName: user.realName,
    },
  });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  successResponse(res, '获取用户信息成功', {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      realName: user.realName,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      bio: user.bio,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
  });
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  const { realName, phone, gender, birthday, bio, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      realName,
      phone,
      gender,
      birthday,
      bio,
      avatar,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  successResponse(res, '更新成功', {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      realName: user.realName,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      bio: user.bio,
    },
  });
};

export const changePassword = async (req: any, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ValidationError('请输入原密码和新密码');
  }

  if (newPassword.length < 6) {
    throw new ValidationError('新密码长度至少为6位');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new AuthenticationError('原密码错误');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  successResponse(res, '密码修改成功', {});
};
