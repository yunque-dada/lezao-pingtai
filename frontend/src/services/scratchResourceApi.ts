import api from './api';

export interface Costume {
  assetId: string;
  name: string;
  bitmapResolution: number;
  md5ext: string;
  dataFormat: string;
  rotationCenterX: number;
  rotationCenterY: number;
}

export interface Sound {
  assetId: string;
  name: string;
  dataFormat: string;
  format?: string;
  rate: number;
  sampleCount: number;
  md5ext: string;
}

export interface Sprite {
  _id: string;
  name: string;
  tags: string[];
  isStage: boolean;
  costumes: Costume[];
  sounds: Sound[];
  blocks?: any;
  variables?: any;
  lists?: any;
  broadcasts?: any;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Backdrop {
  _id: string;
  name: string;
  tags: string[];
  assetId: string;
  bitmapResolution: number;
  dataFormat: string;
  md5ext: string;
  rotationCenterX: number;
  rotationCenterY: number;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SoundResource {
  _id: string;
  name: string;
  tags: string[];
  assetId: string;
  dataFormat: string;
  format?: string;
  rate: number;
  sampleCount: number;
  md5ext: string;
  duration?: number;
  thumbnailUrl?: string;
  downloadCount: number;
  createdBy?: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpriteFilter {
  tags?: string[];
  search?: string;
  isOfficial?: boolean;
  page?: number;
  limit?: number;
}

export const scratchResourceApi = {
  // 角色库管理
  getAllSprites: async (filter?: SpriteFilter): Promise<{ sprites: Sprite[]; total: number; page: number; limit: number }> => {
    const params: Record<string, any> = {};
    if (filter) {
      if (filter.search) params.search = filter.search;
      // 将标签数组作为多个同名参数发送，后端可以用 tags[] 接收
      if (filter.tags && filter.tags.length > 0) {
        params.tags = filter.tags;
      }
      if (filter.isOfficial !== undefined) params.isOfficial = filter.isOfficial;
      if (filter.page) params.page = filter.page;
      if (filter.limit) params.limit = filter.limit;
    }
    const response = await api.get<{ sprites: Sprite[]; total: number; page: number; limit: number }>('/scratch/resources/sprites', params);
    return response.data || { sprites: [], total: 0, page: 1, limit: 10 };
  },

  getSpriteById: async (id: string): Promise<Sprite> => {
    const response = await api.get<Sprite>(`/scratch/resources/sprites/${id}`);
    return response.data as Sprite;
  },

  createSprite: async (data: Partial<Sprite>): Promise<Sprite> => {
    const response = await api.post<Sprite>('/scratch/resources/sprites', data);
    return response.data as Sprite;
  },

  updateSprite: async (id: string, data: Partial<Sprite>): Promise<Sprite> => {
    const response = await api.put<Sprite>(`/scratch/resources/sprites/${id}`, data);
    return response.data as Sprite;
  },

  deleteSprite: async (id: string): Promise<void> => {
    await api.delete(`/scratch/resources/sprites/${id}`);
  },

  // 背景库管理
  getAllBackdrops: async (filter?: SpriteFilter): Promise<{ backdrops: Backdrop[]; total: number; page: number; limit: number }> => {
    const params: Record<string, any> = {};
    if (filter) {
      if (filter.search) params.search = filter.search;
      if (filter.tags && filter.tags.length > 0) params.tags = filter.tags.join(',');
      if (filter.isOfficial !== undefined) params.isOfficial = filter.isOfficial;
      if (filter.page) params.page = filter.page;
      if (filter.limit) params.limit = filter.limit;
    }
    const response = await api.get<{ backdrops: Backdrop[]; total: number; page: number; limit: number }>('/scratch/resources/backdrops', params);
    return response.data || { backdrops: [], total: 0, page: 1, limit: 10 };
  },

  getBackdropById: async (id: string): Promise<Backdrop> => {
    const response = await api.get<Backdrop>(`/scratch/resources/backdrops/${id}`);
    return response.data as Backdrop;
  },

  createBackdrop: async (data: Partial<Backdrop>): Promise<Backdrop> => {
    const response = await api.post<Backdrop>('/scratch/resources/backdrops', data);
    return response.data as Backdrop;
  },

  updateBackdrop: async (id: string, data: Partial<Backdrop>): Promise<Backdrop> => {
    const response = await api.put<Backdrop>(`/scratch/resources/backdrops/${id}`, data);
    return response.data as Backdrop;
  },

  deleteBackdrop: async (id: string): Promise<void> => {
    await api.delete(`/scratch/resources/backdrops/${id}`);
  },

  // 音乐库管理
  getAllSounds: async (filter?: SpriteFilter): Promise<{ sounds: SoundResource[]; total: number; page: number; limit: number }> => {
    const params: Record<string, any> = {};
    if (filter) {
      if (filter.search) params.search = filter.search;
      if (filter.tags && filter.tags.length > 0) params.tags = filter.tags.join(',');
      if (filter.isOfficial !== undefined) params.isOfficial = filter.isOfficial;
      if (filter.page) params.page = filter.page;
      if (filter.limit) params.limit = filter.limit;
    }
    const response = await api.get<{ sounds: SoundResource[]; total: number; page: number; limit: number }>('/scratch/resources/sounds', params);
    return response.data || { sounds: [], total: 0, page: 1, limit: 10 };
  },

  getSoundById: async (id: string): Promise<SoundResource> => {
    const response = await api.get<SoundResource>(`/scratch/resources/sounds/${id}`);
    return response.data as SoundResource;
  },

  createSound: async (data: Partial<SoundResource>): Promise<SoundResource> => {
    const response = await api.post<SoundResource>('/scratch/resources/sounds', data);
    return response.data as SoundResource;
  },

  updateSound: async (id: string, data: Partial<SoundResource>): Promise<SoundResource> => {
    const response = await api.put<SoundResource>(`/scratch/resources/sounds/${id}`, data);
    return response.data as SoundResource;
  },

  deleteSound: async (id: string): Promise<void> => {
    await api.delete(`/scratch/resources/sounds/${id}`);
  },

  // 文件上传
  uploadFile: async (file: File, type: 'sprite' | 'backdrop' | 'sound'): Promise<{ url: string; assetId: string; md5ext: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/scratch-resources/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    const data = await response.json();
    return data.data || data;
  },

  // 获取所有标签
  getAllTags: async (): Promise<{ spriteTags: string[]; backdropTags: string[]; soundTags: string[] }> => {
    const response = await api.get<{ spriteTags: string[]; backdropTags: string[]; soundTags: string[] }>('/scratch/resources/tags');
    return response.data || { spriteTags: [], backdropTags: [], soundTags: [] };
  },

  // 从图片创建角色
  createSpriteFromImage: async (file: File, name: string, tags?: string[]): Promise<Sprite> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/scratch/resources/sprites/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '上传失败');
    }
    return data.data;
  },


};

export default scratchResourceApi;
