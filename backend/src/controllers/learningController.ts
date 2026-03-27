import { Request, Response } from 'express';
import mongoose from 'mongoose';
import LessonProgress from '../models/LessonProgress';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, ValidationError } from '../utils/errors';

// 获取学生的学习进度
export const getStudentProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?._id;

  // 获取课程信息
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('课程不存在');
  }

  // 获取课程的所有课时
  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

  // 获取学生的学习进度
  const progressRecords = await LessonProgress.find({
    student: studentId,
    course: courseId,
  }).populate('lesson');

  // 计算总体进度
  const completedLessons = progressRecords.filter(p => p.status === 'completed').length;
  const totalLessons = lessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // 合并课时和进度信息
  const lessonsWithProgress = lessons.map(lesson => {
    const progress = progressRecords.find(p => p.lesson.toString() === lesson._id.toString());
    return {
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        videoUrl: lesson.videoUrl,
        content: lesson.content,
      },
      progress: progress ? {
        status: progress.status,
        progress: progress.progress,
        timeSpent: progress.timeSpent,
        lastAccessAt: progress.lastAccessAt,
        completedAt: progress.completedAt,
        notes: progress.notes,
      } : {
        status: 'not_started',
        progress: 0,
        timeSpent: 0,
        lastAccessAt: null,
        completedAt: null,
        notes: '',
      },
    };
  });

  res.json({
    success: true,
    data: {
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: (course as any).coverImage,
      },
      overallProgress,
      completedLessons,
      totalLessons,
      lessons: lessonsWithProgress,
    },
  });
});

// 更新课时学习进度
export const updateLessonProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lessonId } = req.params;
  const { progress, timeSpent, status, notes } = req.body;
  const studentId = req.user?._id;

  // 获取课时信息
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new NotFoundError('课时不存在');
  }

  // 查找或创建学习进度记录
  let progressRecord = await LessonProgress.findOne({
    student: studentId,
    lesson: lessonId,
  });

  if (!progressRecord) {
    progressRecord = await LessonProgress.create({
      student: studentId as any,
      lesson: new mongoose.Types.ObjectId(lessonId as string),
      course: lesson.course,
      status: 'in_progress',
      progress: 0,
      timeSpent: 0,
      lastAccessAt: new Date(),
    });
  }

  // 更新进度信息
  if (progress !== undefined) {
    progressRecord.progress = Math.min(100, Math.max(0, progress));
  }
  if (timeSpent !== undefined) {
    progressRecord.timeSpent += timeSpent;
  }
  if (status) {
    progressRecord.status = status;
    if (status === 'completed' && !progressRecord.completedAt) {
      progressRecord.completedAt = new Date();
      progressRecord.progress = 100;
    }
  }
  if (notes !== undefined) {
    progressRecord.notes = notes;
  }
  progressRecord.lastAccessAt = new Date();

  await progressRecord.save();

  res.json({
    success: true,
    message: '学习进度已更新',
    data: {
      progress: progressRecord,
    },
  });
});

// 获取所有课程的学习进度（学生个人中心用）
export const getAllCoursesProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const studentId = req.user?._id;

  // 获取学生的所有学习进度
  const progressRecords = await LessonProgress.find({ student: studentId })
    .populate('course', 'title thumbnail description')
    .populate('lesson', 'title order');

  // 按课程分组统计
  const courseProgressMap = new Map();

  progressRecords.forEach(record => {
    const courseId = record.course._id.toString();
    if (!courseProgressMap.has(courseId)) {
      courseProgressMap.set(courseId, {
        course: record.course,
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        totalTimeSpent: 0,
        lastAccessAt: record.lastAccessAt,
      });
    }

    const courseData = courseProgressMap.get(courseId);
    courseData.totalLessons++;
    courseData.totalTimeSpent += record.timeSpent;
    
    if (record.status === 'completed') {
      courseData.completedLessons++;
    } else if (record.status === 'in_progress') {
      courseData.inProgressLessons++;
    }

    if (record.lastAccessAt > courseData.lastAccessAt) {
      courseData.lastAccessAt = record.lastAccessAt;
    }
  });

  // 计算每门课程的进度百分比
  const coursesProgress = Array.from(courseProgressMap.values()).map(data => ({
    ...data,
    progress: data.totalLessons > 0 
      ? Math.round((data.completedLessons / data.totalLessons) * 100) 
      : 0,
  }));

  // 按最后访问时间排序
  coursesProgress.sort((a, b) => b.lastAccessAt - a.lastAccessAt);

  res.json({
    success: true,
    data: {
      courses: coursesProgress,
      totalCourses: coursesProgress.length,
      totalCompletedCourses: coursesProgress.filter(c => c.progress === 100).length,
      totalTimeSpent: coursesProgress.reduce((sum, c) => sum + c.totalTimeSpent, 0),
    },
  });
});

// 记录视频播放进度
export const recordVideoProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lessonId } = req.params;
  const { currentTime, duration } = req.body;
  const studentId = req.user?._id;

  if (currentTime === undefined || duration === undefined) {
    throw new ValidationError('请提供当前播放时间和总时长');
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new NotFoundError('课时不存在');
  }

  // 计算学习进度百分比
  const progress = Math.min(100, Math.round((currentTime / duration) * 100));

  // 查找或创建学习进度记录
  let progressRecord = await LessonProgress.findOne({
    student: studentId,
    lesson: lessonId,
  });

  if (!progressRecord) {
    progressRecord = await LessonProgress.create({
      student: studentId as any,
      lesson: new mongoose.Types.ObjectId(lessonId as string),
      course: lesson.course,
      status: 'in_progress',
      progress,
      timeSpent: 0,
      lastAccessAt: new Date(),
    });
  } else {
    // 只更新更高的进度
    if (progress > progressRecord.progress) {
      progressRecord.progress = progress;
    }
    progressRecord.lastAccessAt = new Date();
    await progressRecord.save();
  }

  res.json({
    success: true,
    message: '视频播放进度已记录',
    data: {
      progress: progressRecord.progress,
      currentTime,
      duration,
    },
  });
});

// 标记课时为已完成
export const completeLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lessonId } = req.params;
  const studentId = req.user?._id;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new NotFoundError('课时不存在');
  }

  let progressRecord = await LessonProgress.findOne({
    student: studentId,
    lesson: lessonId,
  });

  if (!progressRecord) {
    progressRecord = await LessonProgress.create({
      student: studentId as any,
      lesson: new mongoose.Types.ObjectId(lessonId as string),
      course: lesson.course,
      status: 'completed',
      progress: 100,
      timeSpent: 0,
      completedAt: new Date(),
      lastAccessAt: new Date(),
    });
  } else {
    progressRecord.status = 'completed';
    progressRecord.progress = 100;
    progressRecord.completedAt = new Date();
    progressRecord.lastAccessAt = new Date();
    await progressRecord.save();
  }

  res.json({
    success: true,
    message: '课时已完成',
    data: {
      progress: progressRecord,
    },
  });
});
