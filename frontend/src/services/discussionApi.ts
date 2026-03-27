import api from './api';

export interface Reply {
  _id: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
}

export interface Discussion {
  _id: string;
  course: string;
  lesson?: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'teacher' | 'admin';
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  views: number;
  likes: number;
  likedBy: string[];
  replies: Reply[];
  replyCount: number;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionListItem {
  _id: string;
  course: string;
  lesson?: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'teacher' | 'admin';
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  views: number;
  likes: number;
  replyCount: number;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  tags?: string[];
  lessonId?: string;
}

export interface DiscussionFilter {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  sortBy?: 'latest' | 'hot' | 'unresolved';
}

export const discussionApi = {
  // 获取讨论列表
  getDiscussions: async (
    courseId: string,
    filter?: DiscussionFilter
  ): Promise<{
    discussions: DiscussionListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `/courses/${courseId}/discussions?${params.toString()}`
    );
    return response.data as unknown as {
      discussions: DiscussionListItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },

  // 获取讨论详情
  getDiscussionById: async (courseId: string, id: string): Promise<Discussion> => {
    const response = await api.get(`/courses/${courseId}/discussions/${id}`);
    return (response.data as any).discussion as Discussion;
  },

  // 创建讨论
  createDiscussion: async (
    courseId: string,
    data: CreateDiscussionData
  ): Promise<Discussion> => {
    const response = await api.post(`/courses/${courseId}/discussions`, data);
    return (response.data as any).discussion as Discussion;
  },

  // 更新讨论
  updateDiscussion: async (
    courseId: string,
    id: string,
    data: Partial<CreateDiscussionData>
  ): Promise<Discussion> => {
    const response = await api.put(`/courses/${courseId}/discussions/${id}`, data);
    return (response.data as any).discussion as Discussion;
  },

  // 删除讨论
  deleteDiscussion: async (courseId: string, id: string): Promise<void> => {
    await api.delete(`/courses/${courseId}/discussions/${id}`);
  },

  // 添加回复
  addReply: async (
    courseId: string,
    id: string,
    content: string
  ): Promise<Reply> => {
    const response = await api.post(`/courses/${courseId}/discussions/${id}/replies`, {
      content,
    });
    return (response.data as any).reply as Reply;
  },

  // 删除回复
  deleteReply: async (
    courseId: string,
    discussionId: string,
    replyId: string
  ): Promise<void> => {
    await api.delete(`/courses/${courseId}/discussions/${discussionId}/replies/${replyId}`);
  },

  // 点赞讨论
  likeDiscussion: async (courseId: string, id: string): Promise<number> => {
    const response = await api.post(`/courses/${courseId}/discussions/${id}/like`);
    return (response.data as any).likes;
  },

  // 取消点赞讨论
  unlikeDiscussion: async (courseId: string, id: string): Promise<number> => {
    const response = await api.post(`/courses/${courseId}/discussions/${id}/unlike`);
    return (response.data as any).likes;
  },

  // 点赞回复
  likeReply: async (
    courseId: string,
    discussionId: string,
    replyId: string
  ): Promise<number> => {
    const response = await api.post(
      `/courses/${courseId}/discussions/${discussionId}/replies/${replyId}/like`
    );
    return (response.data as any).likes;
  },

  // 标记讨论为已解决
  markAsResolved: async (
    courseId: string,
    id: string
  ): Promise<boolean> => {
    const response = await api.post(`/courses/${courseId}/discussions/${id}/resolve`);
    return (response.data as any).isResolved;
  },

  // 置顶/取消置顶讨论
  togglePin: async (courseId: string, id: string): Promise<boolean> => {
    const response = await api.post(`/courses/${courseId}/discussions/${id}/pin`);
    return (response.data as any).isPinned;
  },
};

export default discussionApi;
