export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  realName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  bio?: string;
  status?: 'active' | 'inactive' | 'banned';
  lastLoginAt?: Date;
  createdAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role?: 'admin' | 'teacher' | 'student';
  realName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface UpdateProfileRequest {
  realName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
