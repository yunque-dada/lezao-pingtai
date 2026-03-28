import apiService, { ApiResponse } from './api';
import { User, UserFilter, UserFormData } from '../types/user';

export const userApi = {
  async getUsers(params?: UserFilter & { page?: number; limit?: number }): Promise<ApiResponse<{ users: User[] }>> {
    return apiService.get('/users', params);
  },

  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    return apiService.get(`/users/${id}`);
  },

  async createUser(data: UserFormData): Promise<ApiResponse<{ user: User }>> {
    return apiService.post('/users', data);
  },

  async updateUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<{ user: User }>> {
    return apiService.put(`/users/${id}`, data);
  },

  async deleteUser(id: string): Promise<ApiResponse> {
    return apiService.delete(`/users/${id}`);
  },

  async resetPassword(id: string, newPassword: string): Promise<ApiResponse> {
    return apiService.post(`/users/${id}/reset-password`, { newPassword });
  }
};
