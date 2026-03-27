export interface Sprite {
  _id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  imageUrl: string;
  svgUrl?: string;
  assetId: string;
  md5ext: string;
  dataFormat: string;
  rotationCenterX?: number;
  rotationCenterY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Backdrop {
  _id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  imageUrl: string;
  svgUrl?: string;
  assetId: string;
  md5ext: string;
  dataFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sound {
  _id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  soundUrl: string;
  assetId: string;
  md5ext: string;
  dataFormat: string;
  sampleCount?: number;
  rate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceFilter {
  category?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResourceListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
