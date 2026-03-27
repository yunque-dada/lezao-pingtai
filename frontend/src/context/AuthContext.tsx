import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; message: string }>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && savedUser) {
        setUser(savedUser);
        
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            setUser(response.data.user);
            try {
              localStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (error) {
              console.warn('localStorage不可用，无法更新用户信息:', error);
            }
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          authService.logout();
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    console.log('AuthContext login开始，用户名:', username);
    const response = await authService.login({ username, password });
    console.log('AuthContext login响应:', response);
    
    if (response.success && response.data) {
      console.log('登录成功，用户信息:', response.data.user);
      setUser(response.data.user);
    } else {
      // 创建一个带有 response 属性的错误对象
      const error: any = new Error(response.message || '登录失败');
      error.response = {
        data: {
          message: response.message || '登录失败',
        },
        status: 401,
      };
      console.error('登录失败，错误信息:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    
    return {
      success: response.success,
      message: response.message,
    };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const response = await authService.updateProfile(data);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      try {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.warn('localStorage不可用，无法更新用户信息:', error);
      }
    }
    
    return {
      success: response.success,
      message: response.message,
    };
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    return await authService.changePassword(data);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
