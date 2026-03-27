export interface Course {
  _id: string;
  title: string;
  description: string;
  teacher: {
    _id: string;
    username: string;
    realName?: string;
    avatar?: string;
    bio?: string;
  };
  students: string[];
  coverImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  duration: number;
  lessons: Lesson[];
  enrolledCount: number;
  completedCount: number;
  rating: number;
  ratingCount: number;
  prerequisites: string[];
  objectives: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  type: 'video' | 'scratch' | 'quiz' | 'document';
  content?: string;
}

export interface CourseFilter {
  category?: string;
  difficulty?: string;
  status?: string;
  search?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  duration: number;
  prerequisites: string[];
  objectives: string[];
  coverImage?: string;
}

export interface CourseStats {
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  rating: number;
  ratingCount: number;
  lessonCount: number;
  totalDuration: number;
}

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '入门级', color: '#52c41a' },
  { value: 'intermediate', label: '中级', color: '#faad14' },
  { value: 'advanced', label: '高级', color: '#f5222d' },
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: '#8c8c8c' },
  { value: 'published', label: '已发布', color: '#52c41a' },
  { value: 'archived', label: '已归档', color: '#bfbfbf' },
];

export const CATEGORY_OPTIONS = [
  'Scratch基础',
  'Scratch进阶',
  '游戏开发',
  '动画制作',
  '人工智能',
  '算法思维',
  '创意编程',
  '竞赛辅导',
];
