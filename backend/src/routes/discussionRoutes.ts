import express from 'express';
import {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReply,
  deleteReply,
  likeDiscussion,
  unlikeDiscussion,
  likeReply,
  markAsResolved,
  togglePin,
} from '../controllers/discussionController';
import auth from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// 获取课程的讨论列表
router.get('/', auth, getDiscussions);

// 创建讨论
router.post('/', auth, createDiscussion);

// 获取讨论详情
router.get('/:id', auth, getDiscussionById);

// 更新讨论
router.put('/:id', auth, updateDiscussion);

// 删除讨论
router.delete('/:id', auth, deleteDiscussion);

// 添加回复
router.post('/:id/replies', auth, addReply);

// 删除回复
router.delete('/:id/replies/:replyId', auth, deleteReply);

// 点赞讨论
router.post('/:id/like', auth, likeDiscussion);

// 取消点赞讨论
router.post('/:id/unlike', auth, unlikeDiscussion);

// 点赞回复
router.post('/:id/replies/:replyId/like', auth, likeReply);

// 标记讨论为已解决
router.post('/:id/resolve', auth, markAsResolved);

// 置顶/取消置顶讨论
router.post('/:id/pin', auth, togglePin);

export default router;
