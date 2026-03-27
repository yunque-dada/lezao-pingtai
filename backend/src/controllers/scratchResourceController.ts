import { Request, Response } from 'express';
import Sprite from '../models/Sprite';
import Backdrop from '../models/Backdrop';
import Sound from '../models/Sound';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';

export const getAllSprites = asyncHandler(async (req: Request, res: Response) => {
  const { category, tags, search, page = 1, limit = 20 } = req.query;

  const query: any = {};

  if (category) {
    query.category = category;
  }
  if (tags) {
    // 处理多种可能的标签格式：
    // 1. 数组: tags[]=animal&tags[]=bird
    // 2. 逗号分隔字符串: tags=animal,bird
    // 3. 单个字符串: tags=animal
    let tagsArray: string[] = [];
    if (Array.isArray(tags)) {
      tagsArray = tags as string[];
    } else if (typeof tags === 'string') {
      // 检查是否包含逗号，如果是则分割
      if (tags.includes(',')) {
        tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      } else {
        tagsArray = [tags];
      }
    }
    if (tagsArray.length > 0) {
      query.tags = { $in: tagsArray };
    }
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [sprites, total] = await Promise.all([
    Sprite.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Sprite.countDocuments(query),
  ]);

  res.json({
    sprites,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

export const getSpriteById = asyncHandler(async (req: Request, res: Response) => {
  const sprite = await Sprite.findById(req.params.id);
  if (!sprite) {
    throw new NotFoundError('Sprite not found');
  }
  res.json(sprite);
});

export const createSprite = asyncHandler(async (req: Request, res: Response) => {
  const sprite = await Sprite.create(req.body);
  res.status(201).json(sprite);
});

export const updateSprite = asyncHandler(async (req: Request, res: Response) => {
  const sprite = await Sprite.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!sprite) {
    throw new NotFoundError('Sprite not found');
  }

  res.json(sprite);
});

export const deleteSprite = asyncHandler(async (req: Request, res: Response) => {
  const sprite = await Sprite.findByIdAndDelete(req.params.id);
  
  if (!sprite) {
    throw new NotFoundError('Sprite not found');
  }

  res.json({ message: 'Sprite deleted successfully' });
});

export const getAllBackdrops = asyncHandler(async (req: Request, res: Response) => {
  const { category, tags, search, page = 1, limit = 20 } = req.query;

  const query: any = {};

  if (category) {
    query.category = category;
  }
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagsArray };
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [backdrops, total] = await Promise.all([
    Backdrop.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Backdrop.countDocuments(query),
  ]);

  res.json({
    backdrops,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

export const getBackdropById = asyncHandler(async (req: Request, res: Response) => {
  const backdrop = await Backdrop.findById(req.params.id);
  if (!backdrop) {
    throw new NotFoundError('Backdrop not found');
  }
  res.json(backdrop);
});

export const createBackdrop = asyncHandler(async (req: Request, res: Response) => {
  const backdrop = await Backdrop.create(req.body);
  res.status(201).json(backdrop);
});

export const updateBackdrop = asyncHandler(async (req: Request, res: Response) => {
  const backdrop = await Backdrop.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!backdrop) {
    throw new NotFoundError('Backdrop not found');
  }

  res.json(backdrop);
});

export const deleteBackdrop = asyncHandler(async (req: Request, res: Response) => {
  const backdrop = await Backdrop.findByIdAndDelete(req.params.id);
  
  if (!backdrop) {
    throw new NotFoundError('Backdrop not found');
  }

  res.json({ message: 'Backdrop deleted successfully' });
});

export const getAllSounds = asyncHandler(async (req: Request, res: Response) => {
  const { category, tags, search, page = 1, limit = 20 } = req.query;

  const query: any = {};

  if (category) {
    query.category = category;
  }
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagsArray };
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [sounds, total] = await Promise.all([
    Sound.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Sound.countDocuments(query),
  ]);

  res.json({
    sounds,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

export const getSoundById = asyncHandler(async (req: Request, res: Response) => {
  const sound = await Sound.findById(req.params.id);
  if (!sound) {
    throw new NotFoundError('Sound not found');
  }
  res.json(sound);
});

export const createSound = asyncHandler(async (req: Request, res: Response) => {
  const sound = await Sound.create(req.body);
  res.status(201).json(sound);
});

export const updateSound = asyncHandler(async (req: Request, res: Response) => {
  const sound = await Sound.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!sound) {
    throw new NotFoundError('Sound not found');
  }

  res.json(sound);
});

export const deleteSound = asyncHandler(async (req: Request, res: Response) => {
  const sound = await Sound.findByIdAndDelete(req.params.id);
  
  if (!sound) {
    throw new NotFoundError('Sound not found');
  }

  res.json({ message: 'Sound deleted successfully' });
});

/**
 * 获取所有标签
 */
export const getAllTags = asyncHandler(async (req: Request, res: Response) => {
  const [sprites, backdrops, sounds] = await Promise.all([
    Sprite.find().select('tags'),
    Backdrop.find().select('tags'),
    Sound.find().select('tags'),
  ]);

  const spriteTags = new Set<string>();
  const backdropTags = new Set<string>();
  const soundTags = new Set<string>();

  sprites.forEach(sprite => {
    sprite.tags.forEach(tag => spriteTags.add(tag));
  });

  backdrops.forEach(backdrop => {
    backdrop.tags.forEach(tag => backdropTags.add(tag));
  });

  sounds.forEach(sound => {
    sound.tags.forEach(tag => soundTags.add(tag));
  });

  res.json({
    spriteTags: Array.from(spriteTags).sort(),
    backdropTags: Array.from(backdropTags).sort(),
    soundTags: Array.from(soundTags).sort(),
  });
});

/**
 * 获取角色库JSON（供Scratch编辑器使用）
 * 返回格式与 sprites.json 完全一致
 */
export const getSpriteLibraryJson = asyncHandler(async (req: Request, res: Response) => {
  // 从数据库获取所有角色
  const sprites = await Sprite.find().sort({ name: 1 });

  // 转换为Scratch编辑器需要的格式
  const libraryData = sprites.map(sprite => ({
    name: sprite.name,
    tags: sprite.tags || [],
    isStage: sprite.isStage || false,
    variables: sprite.variables || {},
    costumes: (sprite.costumes || []).map((costume: any) => ({
      assetId: costume.assetId,
      name: costume.name,
      bitmapResolution: costume.bitmapResolution || 1,
      md5ext: costume.md5ext,
      dataFormat: costume.dataFormat || 'svg',
      rotationCenterX: costume.rotationCenterX || 0,
      rotationCenterY: costume.rotationCenterY || 0,
    })),
    sounds: (sprite.sounds || []).map((sound: any) => ({
      assetId: sound.assetId,
      name: sound.name,
      md5ext: sound.md5ext,
      dataFormat: sound.dataFormat || 'wav',
      rate: sound.rate || 44100,
      sampleCount: sound.sampleCount || 0,
    })),
    blocks: sprite.blocks || {},
  }));

  // 设置响应头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // 返回JSON数据
  res.json(libraryData);
});

/**
 * 获取背景库JSON（供Scratch编辑器使用）
 */
export const getBackdropLibraryJson = asyncHandler(async (req: Request, res: Response) => {
  const backdrops = await Backdrop.find().sort({ name: 1 });

  const libraryData = backdrops.map(backdrop => ({
    name: backdrop.name,
    tags: backdrop.tags || [],
    assetId: backdrop.assetId,
    md5ext: backdrop.md5ext,
    dataFormat: backdrop.dataFormat || 'png',
    rotationCenterX: backdrop.rotationCenterX || 240,
    rotationCenterY: backdrop.rotationCenterY || 180,
  }));

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.json(libraryData);
});

/**
 * 获取声音库JSON（供Scratch编辑器使用）
 */
export const getSoundLibraryJson = asyncHandler(async (req: Request, res: Response) => {
  const sounds = await Sound.find().sort({ name: 1 });

  const libraryData = sounds.map(sound => ({
    name: sound.name,
    tags: sound.tags || [],
    assetId: sound.assetId,
    md5ext: sound.md5ext,
    dataFormat: sound.dataFormat || 'wav',
    rate: sound.rate || 44100,
    sampleCount: sound.sampleCount || 0,
  }));

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.json(libraryData);
});
