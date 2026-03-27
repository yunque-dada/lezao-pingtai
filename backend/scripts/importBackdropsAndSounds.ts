import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Backdrop from '../src/models/Backdrop';
import Sound from '../src/models/Sound';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scratch-course-platform';

interface BackdropData {
  name: string;
  tags?: string[];
  assetId?: string;
  md5ext?: string;
  dataFormat?: string;
  rotationCenterX?: number;
  rotationCenterY?: number;
}

interface SoundData {
  name: string;
  tags?: string[];
  assetId?: string;
  md5ext?: string;
  dataFormat?: string;
  rate?: number;
  sampleCount?: number;
}

async function importBackdrops() {
  try {
    console.log('开始导入背景库资源...');

    const backdropsPath = path.join(__dirname, '../../scratch3-master/static/json_index/backdrops.json');
    const backdropsData: BackdropData[] = JSON.parse(fs.readFileSync(backdropsPath, 'utf-8'));

    console.log(`从JSON文件读取了 ${backdropsData.length} 个背景`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const backdropData of backdropsData) {
      try {
        // 检查是否已存在
        const existingBackdrop = await Backdrop.findOne({ name: backdropData.name });
        if (existingBackdrop) {
          skippedCount++;
          continue;
        }

        // 创建背景记录
        const backdrop = new Backdrop({
          name: backdropData.name,
          tags: backdropData.tags || [],
          assetId: backdropData.assetId || backdropData.md5ext?.split('.')[0] || '',
          md5ext: backdropData.md5ext || '',
          dataFormat: backdropData.dataFormat || 'png',
          rotationCenterX: backdropData.rotationCenterX || 0,
          rotationCenterY: backdropData.rotationCenterY || 0,
        });

        await backdrop.save();
        importedCount++;

        if (importedCount % 10 === 0) {
          console.log(`已导入 ${importedCount} 个背景...`);
        }
      } catch (err) {
        console.error(`导入背景 "${backdropData.name}" 失败:`, err);
      }
    }

    console.log(`背景库导入完成！成功: ${importedCount}, 跳过: ${skippedCount}`);
    return { imported: importedCount, skipped: skippedCount };
  } catch (error) {
    console.error('导入背景库失败:', error);
    throw error;
  }
}

async function importSounds() {
  try {
    console.log('开始导入音乐库资源...');

    const soundsPath = path.join(__dirname, '../../scratch3-master/static/json_index/sounds.json');
    const soundsData: SoundData[] = JSON.parse(fs.readFileSync(soundsPath, 'utf-8'));

    console.log(`从JSON文件读取了 ${soundsData.length} 个音乐`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const soundData of soundsData) {
      try {
        // 检查是否已存在
        const existingSound = await Sound.findOne({ name: soundData.name });
        if (existingSound) {
          skippedCount++;
          continue;
        }

        // 创建音乐记录
        const sound = new Sound({
          name: soundData.name,
          tags: soundData.tags || [],
          assetId: soundData.assetId || soundData.md5ext?.split('.')[0] || '',
          md5ext: soundData.md5ext || '',
          dataFormat: soundData.dataFormat || 'wav',
          rate: soundData.rate || 44100,
          sampleCount: soundData.sampleCount || 0,
        });

        await sound.save();
        importedCount++;

        if (importedCount % 20 === 0) {
          console.log(`已导入 ${importedCount} 个音乐...`);
        }
      } catch (err) {
        console.error(`导入音乐 "${soundData.name}" 失败:`, err);
      }
    }

    console.log(`音乐库导入完成！成功: ${importedCount}, 跳过: ${skippedCount}`);
    return { imported: importedCount, skipped: skippedCount };
  } catch (error) {
    console.error('导入音乐库失败:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 导入背景库
    const backdropResult = await importBackdrops();

    // 导入音乐库
    const soundResult = await importSounds();

    console.log('\n========== 导入总结 ==========');
    console.log(`背景库: 成功导入 ${backdropResult.imported} 个, 跳过 ${backdropResult.skipped} 个`);
    console.log(`音乐库: 成功导入 ${soundResult.imported} 个, 跳过 ${soundResult.skipped} 个`);
    console.log('==============================\n');

    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('导入过程出错:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
