import api from './api';

export interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  lastAccessAt: string | null;
  completedAt: string | null;
  notes: string;
}

export interface LessonWithProgress {
  lesson: {
    _id: string;
    title: string;
    description: string;
    duration: number;
    order: number;
    videoUrl?: string;
    content?: string;
  };
  progress: LessonProgress;
}

export interface CourseProgress {
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  lessons: LessonWithProgress[];
}

export interface CourseProgressSummary {
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    description: string;
  };
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpent: number;
  progress: number;
  lastAccessAt: string;
}

export interface AllCoursesProgress {
  courses: CourseProgressSummary[];
  totalCourses: number;
  totalCompletedCourses: number;
  totalTimeSpent: number;
}

export const learningApi = {
  // 获取特定课程的学习进度
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await api.get(`/learning/progress/${courseId}`);
    return response.data as unknown as CourseProgress;
  },

  // 获取所有课程的学习进度
  getAllCoursesProgress: async (): Promise<AllCoursesProgress> => {
    const response = await api.get('/learning/progress');
    return response.data as unknown as AllCoursesProgress;
  },

  // 更新课时学习进度
  updateLessonProgress: async (
    lessonId: string,
    data: {
      progress?: number;
      timeSpent?: number;
      status?: 'not_started' | 'in_progress' | 'completed';
      notes?: string;
    }
  ): Promise<LessonProgress> => {
    const response = await api.put(`/learning/progress/${lessonId}`, data);
    return (response.data as any).progress as LessonProgress;
  },

  // 记录视频播放进度
  recordVideoProgress: async (
    lessonId: string,
    currentTime: number,
    duration: number
  ): Promise<{ progress: number; currentTime: number; duration: number }> => {
    const response = await api.post(`/learning/progress/${lessonId}/video`, {
      currentTime,
      duration,
    });
    return response.data as unknown as { progress: number; currentTime: number; duration: number };
  },

  // 标记课时为已完成
  completeLesson: async (lessonId: string): Promise<LessonProgress> => {
    const response = await api.post(`/learning/progress/${lessonId}/complete`);
    return (response.data as any).progress as LessonProgress;
  },
};

export default learningApi;
