export interface ScratchProject {
  _id: string;
  title: string;
  description?: string;
  projectData: string;
  thumbnail?: string;
  author: string;
  authorName: string;
  isPublic: boolean;
  isFeatured: boolean;
  likes: number;
  views: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScratchProjectFormData {
  title: string;
  description?: string;
  projectData: string;
  thumbnail?: string;
  isPublic: boolean;
  tags: string[];
}

export interface ScratchProjectFilter {
  author?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ScratchProjectListResponse {
  projects: ScratchProject[];
  total: number;
  page: number;
  limit: number;
}
