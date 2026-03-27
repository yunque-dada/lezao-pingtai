import { User } from './user';
import { Course } from './course';

export interface Project {
  _id: string;
  title: string;
  description: string;
  author: User;
  course?: Course;
  scratchData: string;
  thumbnail?: string;
  isPublic: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  likes: number;
  views: number;
  score?: number;
  comment?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilter {
  status?: string;
  course?: string;
  author?: string;
  search?: string;
  isFeatured?: boolean;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  course?: string;
  scratchData: string;
  thumbnail?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ReviewData {
  status: 'approved' | 'rejected';
  score?: number;
  comment?: string;
  isFeatured?: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
