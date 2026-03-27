import express from 'express';
import multer from 'multer';
import {
  getAllSprites,
  getSpriteById,
  createSprite,
  updateSprite,
  deleteSprite,
  getAllBackdrops,
  getBackdropById,
  createBackdrop,
  updateBackdrop,
  deleteBackdrop,
  getAllSounds,
  getSoundById,
  createSound,
  updateSound,
  deleteSound,
  getAllTags,
  getSpriteLibraryJson,
  getBackdropLibraryJson,
  getSoundLibraryJson,
} from '../controllers/scratchResourceController';
import {
  createSpriteFromImage,
} from '../controllers/spriteUploadController';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';

const router = express.Router();

// 配置multer - 使用内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedMimes = ['image/png', 'image/svg+xml', 'image/jpeg'];
    const allowedExts = ['.png', '.svg', '.jpg', '.jpeg'];
    
    const ext = file.originalname.toLowerCase();
    const isAllowedExt = allowedExts.some(e => ext.endsWith(e));
    const isAllowedMime = allowedMimes.includes(file.mimetype);
    
    if (isAllowedExt || isAllowedMime) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 PNG、SVG、JPG 格式的图片'));
    }
  },
});

// 供Scratch编辑器使用的JSON接口（无需认证，允许跨域）
// 注意：这些路由必须放在 /:id 路由之前，否则会被误认为是ID
router.route('/sprites/json')
  .get(getSpriteLibraryJson);

router.route('/backdrops/json')
  .get(getBackdropLibraryJson);

router.route('/sounds/json')
  .get(getSoundLibraryJson);

router.route('/sprites')
  .get(getAllSprites)
  .post(auth, authorize('admin'), createSprite);

router.route('/sprites/:id')
  .get(getSpriteById)
  .put(auth, authorize('admin'), updateSprite)
  .delete(auth, authorize('admin'), deleteSprite);

router.route('/backdrops')
  .get(getAllBackdrops)
  .post(auth, authorize('admin'), createBackdrop);

router.route('/backdrops/:id')
  .get(getBackdropById)
  .put(auth, authorize('admin'), updateBackdrop)
  .delete(auth, authorize('admin'), deleteBackdrop);

router.route('/sounds')
  .get(getAllSounds)
  .post(auth, authorize('admin'), createSound);

router.route('/sounds/:id')
  .get(getSoundById)
  .put(auth, authorize('admin'), updateSound)
  .delete(auth, authorize('admin'), deleteSound);

// 获取所有标签
router.route('/tags')
  .get(getAllTags);

// 图片上传创建角色
router.route('/sprites/upload')
  .post(auth, authorize('admin'), upload.single('image'), createSpriteFromImage);

export default router;
