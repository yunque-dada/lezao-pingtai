// 确保API_BASE_URL是正确的相对路径
let API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // 在浏览器环境中防止URL重复的问题
    let cleanedBaseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      if (cleanedBaseUrl.includes('://') && cleanedBaseUrl.includes(window.location.hostname)) {
        cleanedBaseUrl = '/api';
      }
    }
    this.baseUrl = cleanedBaseUrl;
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.warn('localStorage不可用，无法获取token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // 确保endpoint以/开头
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      // 构建最终URL，确保不会重复
      let finalUrl: string;
      if (this.baseUrl.startsWith('http')) {
        // 如果baseUrl是完整URL
        finalUrl = `${this.baseUrl}${cleanEndpoint}`;
      } else {
        // 如果是相对路径，确保正确拼接
        finalUrl = `${this.baseUrl}${cleanEndpoint}`;
      }
      
      console.log('API请求URL:', finalUrl);
      
      const response = await fetch(finalUrl, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error?.message || '请求失败',
        };
      }

      // 检查后端返回的响应格式
      if (data && typeof data === 'object' && 'success' in data) {
        return {
          success: data.success,
          message: data.message || '请求成功',
          data: data.data,
          pagination: data.pagination,
        };
      }

      // 如果后端返回的格式不是预期的格式，直接返回数据
      return {
        success: true,
        message: '请求成功',
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '网络错误',
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiService = new ApiService(API_BASE_URL);

export default apiService;
