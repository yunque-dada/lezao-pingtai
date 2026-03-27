import apiService from './api';
import { Project, ProjectFilter, ProjectFormData, ReviewData, PaginationInfo } from '../types/project';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

export const projectApi = {
  async getProjects(params?: ProjectFilter & { page?: number; limit?: number }): Promise<ApiResponse<{ projects: Project[] }>> {
    return apiService.get('/projects', params);
  },

  async getProjectById(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiService.get(`/projects/${id}`);
  },

  async createProject(data: ProjectFormData): Promise<ApiResponse<{ project: Project }>> {
    return apiService.post('/projects', data);
  },

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<ApiResponse<{ project: Project }>> {
    return apiService.put(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<ApiResponse> {
    return apiService.delete(`/projects/${id}`);
  },

  async submitProject(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiService.post(`/projects/${id}/submit`);
  },

  async reviewProject(id: string, data: ReviewData): Promise<ApiResponse<{ project: Project }>> {
    return apiService.post(`/projects/${id}/review`, data);
  },

  async toggleFeatured(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiService.post(`/projects/${id}/toggle-featured`);
  },

  async likeProject(id: string): Promise<ApiResponse<{ likes: number }>> {
    return apiService.post(`/projects/${id}/like`);
  }
};
