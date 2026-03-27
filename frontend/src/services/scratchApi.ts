import api from './api';
import {
  ScratchProject,
  ScratchProjectFormData,
  ScratchProjectFilter,
  ScratchProjectListResponse,
} from '../types/scratch';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const scratchApi = {
  getAllProjects: async (filter?: ScratchProjectFilter): Promise<ScratchProjectListResponse> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    const response = await api.get(`/scratch/projects?${params.toString()}`);
    return response.data as ScratchProjectListResponse;
  },

  getProjectById: async (id: string): Promise<ScratchProject> => {
    const response = await api.get(`/scratch/projects/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || '获取项目失败');
    }
    return response.data as ScratchProject;
  },

  createProject: async (data: ScratchProjectFormData): Promise<ScratchProject> => {
    const response = await api.post('/scratch/projects', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || '创建项目失败');
    }
    return response.data as ScratchProject;
  },

  updateProject: async (id: string, data: Partial<ScratchProjectFormData>): Promise<ScratchProject> => {
    const response = await api.put(`/scratch/projects/${id}`, data);
    return response.data as ScratchProject;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/scratch/projects/${id}`);
  },

  likeProject: async (id: string): Promise<ScratchProject> => {
    const response = await api.post(`/scratch/projects/${id}/like`);
    return response.data as ScratchProject;
  },

  unlikeProject: async (id: string): Promise<ScratchProject> => {
    const response = await api.post(`/scratch/projects/${id}/unlike`);
    return response.data as ScratchProject;
  },

  incrementViews: async (id: string): Promise<ScratchProject> => {
    const response = await api.post(`/scratch/projects/${id}/view`);
    return response.data as ScratchProject;
  },

  toggleFeatured: async (id: string): Promise<ScratchProject> => {
    const response = await api.post(`/scratch/projects/${id}/featured`);
    return response.data as ScratchProject;
  },

  getMyProjects: async (filter?: Omit<ScratchProjectFilter, 'author'>): Promise<ScratchProjectListResponse> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    const response = await api.get(`/scratch/projects/my?${params.toString()}`);
    return response.data as ScratchProjectListResponse;
  },

  /**
   * 获取当前用户文件系统中的项目列表
   * 直接从文件系统读取sb3文件
   */
  getMyFileProjects: async (): Promise<ScratchProjectListResponse> => {
    const response = await api.get('/scratch/projects/my-files');
    return response.data as ScratchProjectListResponse;
  },

  /**
   * 获取所有用户文件系统中的项目列表（仅管理员和老师）
   * 遍历所有用户目录读取sb3文件
   */
  getAllFileProjects: async (): Promise<ScratchProjectListResponse> => {
    const response = await api.get('/scratch/projects/all-files');
    return response.data as ScratchProjectListResponse;
  },

  /**
   * 保存项目（创建或更新）
   * 统一接口，根据是否有projectId决定是创建还是更新
   * @param data 项目数据，包含projectId（可选）
   * @returns 保存后的项目
   */
  saveProject: async (data: ScratchProjectFormData & { projectId?: string }): Promise<ScratchProject> => {
    const response = await api.post('/scratch/projects/save', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || '保存项目失败');
    }
    return response.data as ScratchProject;
  },

  /**
   * 从sb3文件导入项目
   * @param file sb3文件
   * @returns 导入的项目数据
   */
  importFromSb3: async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          // 这里可以添加解析sb3文件的逻辑
          // 暂时返回原始数据
          resolve(arrayBuffer);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * 下载项目为sb3文件
   * @param projectId 项目ID
   */
  downloadProject: async (projectId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/scratch/projects/${projectId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('下载项目失败');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectId}.sb3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 导出项目为sb3文件（从编辑器直接导出）
   * @param projectId 项目ID
   * @returns sb3文件Blob
   */
  exportToSb3: async (projectId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/scratch/projects/${projectId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('导出项目失败');
    }
    
    const blob = await response.blob();
    return blob;
  },
};

export default scratchApi;
