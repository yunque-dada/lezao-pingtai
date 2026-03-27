const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// 使用编译后的模型
const Sprite = require('../dist/models/Sprite').default;
const Backdrop = require('../dist/models/Backdrop').default;
const Sound = require('../dist/models/Sound').default;

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao-pingtai';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

async function importSprites() {
  console.log('\n📦 开始导入角色库...');
  
  const spritesPath = path.join(__dirname, '../../scratch3-master/static/json_index/sprites.json');
  
  if (!fs.existsSync(spritesPath)) {
    console.log('❌ 角色库文件不存在:', spritesPath);
    return;
  }

  const spritesData = JSON.parse(fs.readFileSync(spritesPath, 'utf8'));
  console.log(`找到 ${spritesData.length} 个角色`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const spriteData of spritesData) {
    try {
      // 检查是否已存在
      const existing = await Sprite.findOne({ name: spriteData.name });
      if (existing) {
        console.log(`⏭️  跳过已存在的角色: ${spriteData.name}`);
        skippedCount++;
        continue;
      }

      const sprite = new Sprite({
        name: spriteData.name,
        tags: spriteData.tags || [],
        isStage: spriteData.isStage || false,
        costumes: (spriteData.costumes || []).map(costume => ({
          assetId: costume.assetId,
          name: costume.name,
          bitmapResolution: costume.bitmapResolution || 1,
          md5ext: costume.md5ext,
          dataFormat: costume.dataFormat,
          rotationCenterX: costume.rotationCenterX || 0,
          rotationCenterY: costume.rotationCenterY || 0,
        })),
        sounds: (spriteData.sounds || []).map(sound => ({
          assetId: sound.assetId,
          name: sound.name,
          dataFormat: sound.dataFormat,
          format: sound.format || '',
          rate: sound.rate || 44100,
          sampleCount: sound.sampleCount || 0,
          md5ext: sound.md5ext,
        })),
        blocks: spriteData.blocks || {},
        variables: spriteData.variables || {},
        lists: spriteData.lists || {},
        broadcasts: spriteData.broadcasts || {},
        isOfficial: true,
        downloadCount: 0,
      });

      await sprite.save();
      console.log(`✅ 导入角色: ${spriteData.name}`);
      importedCount++;
    } catch (error) {
      console.error(`❌ 导入角色失败 ${spriteData.name}:`, error.message);
    }
  }

  console.log(`\n📊 角色导入完成: ${importedCount} 个新角色, ${skippedCount} 个跳过`);
}

async function importBackdrops() {
  console.log('\n🖼️ 开始导入背景库...');
  
  const backdropsPath = path.join(__dirname, '../../scratch3-master/static/json_index/backdrops.json');
  
  if (!fs.existsSync(backdropsPath)) {
    console.log('❌ 背景库文件不存在:', backdropsPath);
    return;
  }

  const backdropsData = JSON.parse(fs.readFileSync(backdropsPath, 'utf8'));
  console.log(`找到 ${backdropsData.length} 个背景`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const backdropData of backdropsData) {
    try {
      // 检查是否已存在
      const existing = await Backdrop.findOne({ name: backdropData.name });
      if (existing) {
        console.log(`⏭️  跳过已存在的背景: ${backdropData.name}`);
        skippedCount++;
        continue;
      }

      const backdrop = new Backdrop({
        name: backdropData.name,
        tags: backdropData.tags || [],
        assetId: backdropData.assetId,
        bitmapResolution: backdropData.bitmapResolution || 1,
        dataFormat: backdropData.dataFormat,
        md5ext: backdropData.md5ext,
        rotationCenterX: backdropData.rotationCenterX || 240,
        rotationCenterY: backdropData.rotationCenterY || 180,
        isOfficial: true,
        downloadCount: 0,
      });

      await backdrop.save();
      console.log(`✅ 导入背景: ${backdropData.name}`);
      importedCount++;
    } catch (error) {
      console.error(`❌ 导入背景失败 ${backdropData.name}:`, error.message);
    }
  }

  console.log(`\n📊 背景导入完成: ${importedCount} 个新背景, ${skippedCount} 个跳过`);
}

async function importSounds() {
  console.log('\n🔊 开始导入音乐库...');
  
  const soundsPath = path.join(__dirname, '../../scratch3-master/static/json_index/sounds.json');
  
  if (!fs.existsSync(soundsPath)) {
    console.log('❌ 音乐库文件不存在:', soundsPath);
    return;
  }

  const soundsData = JSON.parse(fs.readFileSync(soundsPath, 'utf8'));
  console.log(`找到 ${soundsData.length} 个声音`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const soundData of soundsData) {
    try {
      // 检查是否已存在
      const existing = await Sound.findOne({ name: soundData.name });
      if (existing) {
        console.log(`⏭️  跳过已存在的声音: ${soundData.name}`);
        skippedCount++;
        continue;
      }

      const sound = new Sound({
        name: soundData.name,
        tags: soundData.tags || [],
        assetId: soundData.assetId,
        dataFormat: soundData.dataFormat,
        format: soundData.format || '',
        rate: soundData.rate || 44100,
        sampleCount: soundData.sampleCount || 0,
        md5ext: soundData.md5ext,
        duration: soundData.sampleCount ? soundData.sampleCount / soundData.rate : 0,
        isOfficial: true,
        downloadCount: 0,
      });

      await sound.save();
      console.log(`✅ 导入声音: ${soundData.name}`);
      importedCount++;
    } catch (error) {
      console.error(`❌ 导入声音失败 ${soundData.name}:`, error.message);
    }
  }

  console.log(`\n📊 声音导入完成: ${importedCount} 个新声音, ${skippedCount} 个跳过`);
}

async function main() {
  console.log('🚀 开始导入Scratch 3.0资源库');
  console.log('='.repeat(50));

  await connectDB();

  try {
    await importSprites();
    await importBackdrops();
    await importSounds();
  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ 数据库连接已关闭');
    console.log('🎉 资源导入完成!');
  }
}

main();
