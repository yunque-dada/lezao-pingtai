import { Request, Response, NextFunction } from 'express';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { createQueryBuilder } from '../utils/queryBuilder';

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sort, category, difficulty, status, search } = req.query;

  const queryBuilder = createQueryBuilder(Course);

  const filter: any = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (status) filter.status = status;

  queryBuilder.filter(filter);

  if (search) {
    queryBuilder.search(['title', 'description', 'tags'], search as string);
  }

  queryBuilder
    .sort(sort as string)
    .populate([
      { path: 'teacher', select: 'username realName avatar' },
      { path: 'lessons', select: 'title duration order' }
    ]);

  const result = await queryBuilder.paginate(Number(page), Number(limit));

  res.success({
    data: result.data,
    pagination: result.pagination
  }, '获取课程列表成功');
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate('teacher', 'username realName avatar bio')
    .populate('lessons', 'title description duration order type content');

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  res.success(course, '获取课程详情成功');
});

export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    category,
    difficulty,
    tags,
    duration,
    prerequisites,
    objectives,
    coverImage
  } = req.body;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.create({
    title,
    description,
    teacher: req.user._id,
    category,
    difficulty: difficulty || 'beginner',
    tags: tags || [],
    duration: duration || 0,
    prerequisites: prerequisites || [],
    objectives: objectives || [],
    coverImage: coverImage || '',
    status: 'draft'
  });

  res.success(course, '课程创建成功', 201);
});

export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AuthorizationError('无权修改此课程');
  }

  if (course.status === 'published' && updateData.status !== 'archived') {
    const allowedUpdates = ['description', 'coverImage', 'tags'];
    Object.keys(updateData).forEach(key => {
      if (!allowedUpdates.includes(key)) {
        delete updateData[key];
      }
    });
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    updateData,
    { returnDocument: 'after', runValidators: true }
  );

  res.success(updatedCourse, '课程更新成功');
});

export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AuthorizationError('无权删除此课程');
  }

  await Lesson.deleteMany({ course: id });
  await Course.findByIdAndDelete(id);

  res.success(null, '课程删除成功');
});

export const publishCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AuthorizationError('无权发布此课程');
  }

  if (course.lessons.length === 0) {
    throw new ValidationError('课程至少需要包含一个课时');
  }

  course.status = 'published';
  course.publishedAt = new Date();
  await course.save();

  res.success(course, '课程发布成功');
});

export const archiveCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AuthorizationError('无权归档此课程');
  }

  course.status = 'archived';
  await course.save();

  res.success(course, '课程已归档');
});

export const enrollCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.status !== 'published') {
    throw new ValidationError('课程未发布，无法报名');
  }

  const isEnrolled = course.students.includes(req.user._id);

  if (isEnrolled) {
    throw new ValidationError('已经报名此课程');
  }

  course.students.push(req.user._id);
  course.enrolledCount += 1;
  await course.save();

  res.success(course, '报名成功');
});

export const getMyCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const { page = 1, limit = 10, role } = req.query;

  let filter: any = {};

  if (role === 'teacher') {
    filter.teacher = req.user._id;
  } else {
    filter.students = req.user._id;
  }

  const queryBuilder = createQueryBuilder(Course);
  queryBuilder
    .filter(filter)
    .sort('-createdAt')
    .populate([
      { path: 'teacher', select: 'username realName avatar' },
      { path: 'lessons', select: 'title duration' }
    ]);

  const result = await queryBuilder.paginate(Number(page), Number(limit));

  res.success({
    data: result.data,
    pagination: result.pagination
  }, '获取我的课程成功');
});

export const getCourseStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AuthorizationError('请先登录');
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AuthorizationError('无权查看此课程统计');
  }

  const stats = {
    enrolledCount: course.enrolledCount,
    completedCount: course.completedCount,
    completionRate: course.enrolledCount > 0
      ? Math.round((course.completedCount / course.enrolledCount) * 100)
      : 0,
    rating: course.rating,
    ratingCount: course.ratingCount,
    lessonCount: course.lessons.length,
    totalDuration: course.duration
  };

  res.success(stats, '获取课程统计成功');
});
