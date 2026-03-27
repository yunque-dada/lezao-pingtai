export interface User {
  _id: string;
  username: string;
  email?: string;
  role: 'admin' | 'teacher' | 'student';
  realName?: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  user: User;
  enrolledCourses: string[];
  completedCourses: string[];
  projects: string[];
  grade: string;
  school: string;
  parentName: string;
  parentPhone: string;
  points: number;
  level: number;
  achievements: string[];
  learningStreak: number;
  lastLearningDate?: string;
  totalLearningTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilter {
  role?: string;
  status?: string;
  search?: string;
}

export interface UserFormData {
  username: string;
  password?: string;
  email?: string;
  role: 'admin' | 'teacher' | 'student';
  realName?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  bio?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'banned';
}
