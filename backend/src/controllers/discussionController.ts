import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Discussion from '../models/Discussion';
import Course from '../models/Course';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';

// 获取课程的讨论列表
export const getDiscussions = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, search, tag, sortBy = 'latest' } = req.query;

  // 验证课程存在
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  const query: any = { course: courseId };

  if (search) {
    query.$text = { $search: search as string };
  }

  if (tag) {
    query.tags = { $in: [tag] };
  }

  let sortOption: any = {};
  switch (sortBy) {
    case 'latest':
      sortOption = { isPinned: -1, lastReplyAt: -1, createdAt: -1 };
      break;
    case 'hot':
      sortOption = { isPinned: -1, views: -1, replyCount: -1 };
      break;
    case 'unresolved':
      query.isResolved = false;
      sortOption = { isPinned: -1, createdAt: -1 };
      break;
    default:
      sortOption = { isPinned: -1, createdAt: -1 };
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [discussions, total] = await Promise.all([
    Discussion.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-replies'), // 不返回回复详情，减少数据量
    Discussion.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      discussions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// 获取讨论详情
export const getDiscussionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  // 增加浏览量
  discussion.views += 1;
  await discussion.save();

  res.json({
    success: true,
    data: {
      discussion,
    },
  });
});

// 创建讨论
export const createDiscussion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const { title, content, tags, lessonId } = req.body;

  if (!title || !content) {
    throw new ValidationError('标题和内容不能为空');
  }

  // 验证课程存在
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  const discussion = await Discussion.create({
    course: new mongoose.Types.ObjectId(courseId as string),
    lesson: lessonId ? new mongoose.Types.ObjectId(lessonId as string) : undefined,
    author: req.user?._id,
    authorName: req.user?.username,
    authorAvatar: req.user?.avatar,
    authorRole: req.user?.role,
    title,
    content,
    tags: tags || [],
  });

  res.status(201).json({
    success: true,
    message: '讨论创建成功',
    data: {
      discussion,
    },
  });
});

// 更新讨论
export const updateDiscussion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  // 检查权限
  if (discussion.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
    throw new AuthorizationError('无权修改此讨论');
  }

  discussion.title = title || discussion.title;
  discussion.content = content || discussion.content;
  discussion.tags = tags || discussion.tags;

  await discussion.save();

  res.json({
    success: true,
    message: '讨论更新成功',
    data: {
      discussion,
    },
  });
});

// 删除讨论
export const deleteDiscussion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  // 检查权限
  if (discussion.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
    throw new AuthorizationError('无权删除此讨论');
  }

  await Discussion.findByIdAndDelete(id);

  res.json({
    success: true,
    message: '讨论删除成功',
  });
});

// 添加回复
export const addReply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ValidationError('回复内容不能为空');
  }

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  const reply = {
    _id: new mongoose.Types.ObjectId(),
    author: req.user?._id,
    authorName: req.user?.username,
    authorAvatar: req.user?.avatar,
    content,
    likes: 0,
    likedBy: [],
    createdAt: new Date(),
  };

  discussion.replies.push(reply as any);
  discussion.replyCount = discussion.replies.length;
  discussion.lastReplyAt = new Date();

  await discussion.save();

  res.status(201).json({
    success: true,
    message: '回复添加成功',
    data: {
      reply,
    },
  });
});

// 删除回复
export const deleteReply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, replyId } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  const reply = discussion.replies.find(r => r._id?.toString() === replyId);
  if (!reply) {
    throw new NotFoundError('回复不存在');
  }

  // 检查权限
  if (reply.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
    throw new AuthorizationError('无权删除此回复');
  }

  discussion.replies = discussion.replies.filter(r => r._id?.toString() !== replyId);
  discussion.replyCount = discussion.replies.length;

  await discussion.save();

  res.json({
    success: true,
    message: '回复删除成功',
  });
});

// 点赞讨论
export const likeDiscussion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  if (discussion.likedBy.includes(req.user?._id)) {
    throw new ValidationError('已经点赞过了');
  }

  discussion.likedBy.push(req.user?._id);
  discussion.likes = discussion.likedBy.length;
  await discussion.save();

  res.json({
    success: true,
    message: '点赞成功',
    data: {
      likes: discussion.likes,
    },
  });
});

// 取消点赞讨论
export const unlikeDiscussion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  discussion.likedBy = discussion.likedBy.filter(
    (userId) => userId.toString() !== req.user?._id.toString()
  );
  discussion.likes = discussion.likedBy.length;
  await discussion.save();

  res.json({
    success: true,
    message: '取消点赞成功',
    data: {
      likes: discussion.likes,
    },
  });
});

// 点赞回复
export const likeReply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, replyId } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  const reply = discussion.replies.find(r => r._id?.toString() === replyId);
  if (!reply) {
    throw new NotFoundError('回复不存在');
  }

  if (reply.likedBy.includes(req.user?._id)) {
    throw new ValidationError('已经点赞过了');
  }

  reply.likedBy.push(req.user?._id);
  reply.likes = reply.likedBy.length;
  await discussion.save();

  res.json({
    success: true,
    message: '点赞成功',
    data: {
      likes: reply.likes,
    },
  });
});

// 标记讨论为已解决
export const markAsResolved = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  // 检查权限
  if (discussion.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
    throw new AuthorizationError('无权标记此讨论');
  }

  discussion.isResolved = !discussion.isResolved;
  await discussion.save();

  res.json({
    success: true,
    message: discussion.isResolved ? '已标记为已解决' : '已取消解决标记',
    data: {
      isResolved: discussion.isResolved,
    },
  });
});

// 置顶/取消置顶讨论
export const togglePin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
    throw new AuthorizationError('无权置顶讨论');
  }

  const discussion = await Discussion.findById(id);
  if (!discussion) {
    throw new NotFoundError('讨论不存在');
  }

  discussion.isPinned = !discussion.isPinned;
  await discussion.save();

  res.json({
    success: true,
    message: discussion.isPinned ? '已置顶' : '已取消置顶',
    data: {
      isPinned: discussion.isPinned,
    },
  });
});
