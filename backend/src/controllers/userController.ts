import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { successResponse, createdResponse } from '../utils/response';
import { ValidationError, NotFoundError } from '../utils/errors';

// 获取用户列表
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, role, status, search } = req.query;

  const query: any = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { realName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  successResponse(res, '获取用户列表成功', {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// 获取单个用户
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  successResponse(res, '获取用户信息成功', { user });
};

// 创建用户
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, realName, phone, status } = req.body;

  // 检查用户是否已存在（只检查用户名）
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ValidationError('用户名已存在');
  }

  // 加密密码
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 创建用户
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || 'student',
    realName,
    phone,
    status: status || 'active',
  });

  createdResponse(res, '创建用户成功', {
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

// 更新用户
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { realName, phone, avatar, status, role, password } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  // 更新字段
  if (realName !== undefined) user.realName = realName;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (status !== undefined) user.status = status;
  if (role !== undefined) user.role = role;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  successResponse(res, '更新用户成功', {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      realName: user.realName,
      status: user.status,
    },
  });
};

// 删除用户
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  await user.deleteOne();

  successResponse(res, '删除用户成功', {});
};

// 重置密码
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ValidationError('新密码长度至少为6位');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  successResponse(res, '重置密码成功', {});
};
