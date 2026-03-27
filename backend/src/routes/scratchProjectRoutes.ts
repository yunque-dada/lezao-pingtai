import express from 'express';
import multer from 'multer';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  unlikeProject,
  incrementViews,
  toggleFeatured,
  getMyProjects,
  getMyFileProjects,
  getAllFileProjects,
  saveProject,
  downloadProject,
  downloadProjectByFilename,
} from '../controllers/scratchProjectController';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';

const router = express.Router();

// 配置multer，使用内存存储
const upload = multer({ storage: multer.memoryStorage() });

// 获取所有项目列表
router.route('/')
  .get(auth, getAllProjects)
  .post(auth, createProject);

// 保存项目（创建或更新）- 统一接口，支持文件上传
router.route('/save')
  .post(auth, upload.single('file'), saveProject);

// 获取当前用户的项目列表
router.route('/my')
  .get(auth, getMyProjects);

// 根据文件名下载项目
router.route('/file/:filename')
  .get(auth, downloadProjectByFilename);

// 获取当前用户文件系统中的项目列表
router.route('/my-files')
  .get(auth, getMyFileProjects);

// 获取所有用户文件系统中的项目列表（仅管理员和老师）
router.route('/all-files')
  .get(auth, getAllFileProjects);

// 项目详情操作
router.route('/:id')
  .get(getProjectById)
  .put(auth, updateProject)
  .delete(auth, deleteProject);

// 下载项目
router.route('/:id/download')
  .get(auth, downloadProject);

// 点赞/取消点赞
router.route('/:id/like')
  .post(auth, likeProject);

router.route('/:id/unlike')
  .post(auth, unlikeProject);

// 增加浏览量
router.route('/:id/view')
  .post(incrementViews);

// 切换推荐状态（仅管理员）
router.route('/:id/featured')
  .post(auth, authorize('admin'), toggleFeatured);

export default router;
