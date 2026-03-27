import api from './api';

export interface UserStatistics {
  totalUsers: number;
  usersByRole: Record<string, number>;
  userGrowth: Array<{ _id: string; count: number }>;
  activeUsers: number;
  period: { start: string; end: string };
}

export interface CourseStatistics {
  totalCourses: number;
  publishedCourses: number;
  courseEnrollments: Array<{ _id: string; title: string; enrollmentCount: number }>;
  courseCompletionRates: Array<{
    _id: string;
    courseTitle: string;
    totalStudents: number;
    completedStudents: number;
    completionRate: number;
  }>;
}

export interface LearningStatistics {
  totalLearningTime: number;
  progressDistribution: Record<string, number>;
  dailyActivity: Array<{
    _id: string;
    activeUsers: number;
    totalTime: number;
  }>;
}

export interface ProjectStatistics {
  scratchStats: {
    total: number;
    publicCount: number;
    featuredCount: number;
    totalViews: number;
    totalLikes: number;
  };
  creationTrend: Array<{ _id: string; count: number }>;
  topProjects: Array<{
    _id: string;
    title: string;
    authorName: string;
    views: number;
    likes: number;
    createdAt: string;
  }>;
}

export interface DashboardOverview {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalProjects: number;
    totalLearningTime: number;
  };
  recentUsers: Array<{
    _id: string;
    username: string;
    role: string;
    createdAt: string;
  }>;
  recentProjects: Array<{
    _id: string;
    title: string;
    authorName: string;
    createdAt: string;
  }>;
}

export const statisticsApi = {
  // 获取仪表盘概览
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get('/statistics/dashboard');
    return (response.data as any).data as DashboardOverview;
  },

  // 获取用户统计
  getUserStatistics: async (params?: { startDate?: string; endDate?: string }): Promise<UserStatistics> => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const response = await api.get(`/statistics/users?${query.toString()}`);
    return (response.data as any).data as UserStatistics;
  },

  // 获取课程统计
  getCourseStatistics: async (): Promise<CourseStatistics> => {
    const response = await api.get('/statistics/courses');
    return (response.data as any).data as CourseStatistics;
  },

  // 获取学习统计
  getLearningStatistics: async (): Promise<LearningStatistics> => {
    const response = await api.get('/statistics/learning');
    return (response.data as any).data as LearningStatistics;
  },

  // 获取作品统计
  getProjectStatistics: async (): Promise<ProjectStatistics> => {
    const response = await api.get('/statistics/projects');
    return (response.data as any).data as ProjectStatistics;
  },
};

export default statisticsApi;
