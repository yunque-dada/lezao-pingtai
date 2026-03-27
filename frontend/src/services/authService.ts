import apiService from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '../types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('authService login开始，数据:', data);
    const response = await apiService.post<AuthResponse['data']>('/auth/login', data);
    console.log('authService login响应:', response);
    
    if (response.success && response.data) {
      console.log('登录成功，token:', response.data.token);
      try {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('localStorage存储成功');
      } catch (error) {
        console.warn('localStorage不可用，无法存储登录信息:', error);
      }
    }
    
    return {
      success: response.success,
      message: response.message,
      data: response.data as { token: string; user: User }
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse['data']>('/auth/register', data);
    
    if (response.success && response.data) {
      try {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.warn('localStorage不可用，无法存储登录信息:', error);
      }
    }
    
    return response as AuthResponse;
  },

  async getMe(): Promise<{ success: boolean; message: string; data?: { user: User } }> {
    return apiService.get('/auth/me');
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; message: string; data?: { user: User } }> {
    const response = await apiService.put<{ user: User }>('/auth/profile', data);
    
    if (response.success && response.data) {
      try {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.warn('localStorage不可用，无法更新用户信息:', error);
      }
    }
    
    return response;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiService.put('/auth/password', data);
  },

  logout(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('localStorage不可用，无法清除登录信息:', error);
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('localStorage不可用，无法获取token:', error);
      return null;
    }
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.warn('localStorage不可用，无法获取用户信息:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
