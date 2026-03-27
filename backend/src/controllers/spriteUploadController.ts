import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import Sprite from '../models/Sprite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * 从图片文件创建角色
 * 自动处理：
 * 1. 计算MD5作为assetId
 * 2. 获取图片尺寸
 * 3. 保存到静态目录
 * 4. 创建数据库记录
 */
export const createSpriteFromImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请上传图片文件',
    });
  }

  const { name, tags } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: '请输入角色名称',
    });
  }

  try {
    // 1. 读取上传的图片文件
    const imageBuffer = req.file.buffer;
    
    // 2. 计算MD5
    const md5 = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    // 3. 确定文件格式
    const ext = path.extname(req.file.originalname).toLowerCase();
    const dataFormat = ext === '.svg' ? 'svg' : ext === '.png' ? 'png' : 'png';
    const md5ext = `${md5}.${dataFormat}`;
    
    // 4. 获取图片尺寸（简单实现，实际可用 sharp 库）
    // 这里使用默认尺寸，实际项目中应该使用图片处理库
    let width = 100;
    let height = 100;
    
    // 尝试从PNG/JPG读取尺寸
    if (dataFormat === 'png') {
      const dimensions = getPngDimensions(imageBuffer);
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }
    } else if (dataFormat === 'svg') {
      const dimensions = getSvgDimensions(imageBuffer.toString());
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }
    }
    
    // 5. 计算旋转中心（图片中心点）
    const rotationCenterX = width / 2;
    const rotationCenterY = height / 2;
    
    // 6. 确定分辨率
    const bitmapResolution = dataFormat === 'svg' ? 1 : 2;
    
    // 7. 保存图片到静态目录
    const assetDir = path.join(__dirname, '../../../scratch3-master/static/internalapi/asset');
    await ensureDir(assetDir);
    const assetPath = path.join(assetDir, md5ext);
    await writeFile(assetPath, imageBuffer);
    
    // 8. 创建角色数据
    const spriteData = {
      name: name.trim(),
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      isStage: false,
      assetId: md5,
      costumes: [{
        assetId: md5,
        name: name.trim(),
        bitmapResolution,
        md5ext,
        dataFormat,
        rotationCenterX,
        rotationCenterY,
      }],
      sounds: [],
      blocks: {},
      variables: {},
      isOfficial: false,
      createdBy: req.user?._id,
    };
    
    // 9. 保存到数据库
    const sprite = new Sprite(spriteData);
    await sprite.save();
    
    res.status(201).json({
      success: true,
      message: '角色创建成功',
      data: sprite,
    });
  } catch (error) {
    console.error('创建角色失败:', error);
    res.status(500).json({
      success: false,
      message: '创建角色失败',
    });
  }
});

// 辅助函数：确保目录存在
async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // 目录已存在
  }
}

// 辅助函数：从PNG读取尺寸
function getPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    // PNG文件格式：前8字节是签名，然后是IHDR块
    // IHDR块从第16字节开始，包含宽度和高度（各4字节）
    if (buffer.length < 24) return null;
    
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    
    return { width, height };
  } catch {
    return null;
  }
}

// 辅助函数：从SVG读取尺寸
function getSvgDimensions(svgString: string): { width: number; height: number } | null {
  try {
    // 尝试从viewBox获取
    const viewBoxMatch = svgString.match(/viewBox="([\d\s.-]+)"/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].split(/\s+/);
      if (parts.length >= 4) {
        const width = parseFloat(parts[2]);
        const height = parseFloat(parts[3]);
        if (!isNaN(width) && !isNaN(height)) {
          return { width, height };
        }
      }
    }
    
    // 尝试从width/height属性获取
    const widthMatch = svgString.match(/width="([\d.]+)"/);
    const heightMatch = svgString.match(/height="([\d.]+)"/);
    
    if (widthMatch && heightMatch) {
      const width = parseFloat(widthMatch[1]);
      const height = parseFloat(heightMatch[1]);
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}
