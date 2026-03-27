import api from './api';
import { Course, CourseFormData, CourseStats, CourseFilter } from '../types/course';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const courseApi = {
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
  } & CourseFilter): Promise<ApiResponse<{ data: Course[]; pagination: any }>> => {
    const response = await api.get<{ data: Course[]; pagination: any }>('/courses', params);
    return response as ApiResponse<{ data: Course[]; pagination: any }>;
  },

  getCourseById: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await api.get<Course>(`/courses/${id}`);
    return response as ApiResponse<Course>;
  },

  createCourse: async (data: CourseFormData): Promise<ApiResponse<Course>> => {
    const response = await api.post<Course>('/courses', data);
    return response as ApiResponse<Course>;
  },

  updateCourse: async (id: string, data: Partial<CourseFormData>): Promise<ApiResponse<Course>> => {
    const response = await api.put<Course>(`/courses/${id}`, data);
    return response as ApiResponse<Course>;
  },

  deleteCourse: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<null>(`/courses/${id}`);
    return response as ApiResponse<null>;
  },

  publishCourse: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await api.patch<Course>(`/courses/${id}/publish`);
    return response as ApiResponse<Course>;
  },

  archiveCourse: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await api.patch<Course>(`/courses/${id}/archive`);
    return response as ApiResponse<Course>;
  },

  enrollCourse: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await api.post<Course>(`/courses/${id}/enroll`);
    return response as ApiResponse<Course>;
  },

  getMyCourses: async (params?: {
    page?: number;
    limit?: number;
    role?: 'teacher' | 'student';
  }): Promise<ApiResponse<{ data: Course[]; pagination: any }>> => {
    const response = await api.get<{ data: Course[]; pagination: any }>('/courses/my-courses', params);
    return response as ApiResponse<{ data: Course[]; pagination: any }>;
  },

  getCourseStats: async (id: string): Promise<ApiResponse<CourseStats>> => {
    const response = await api.get<CourseStats>(`/courses/${id}/stats`);
    return response as ApiResponse<CourseStats>;
  },
};
