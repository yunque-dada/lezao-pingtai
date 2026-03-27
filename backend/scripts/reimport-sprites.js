const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// 使用编译后的模型
const Sprite = require('../dist/models/Sprite').default;

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

async function cleanAndImportSprites() {
  console.log('\n🧹 清理现有角色数据...');
  
  // 删除所有现有角色
  const deleteResult = await Sprite.deleteMany({});
  console.log(`✅ 已删除 ${deleteResult.deletedCount} 个角色`);
  
  console.log('\n📦 开始导入正确的角色库...');
  
  const spritesPath = path.join(__dirname, '../../scratch3-master/static/json_index/sprites.json');
  
  if (!fs.existsSync(spritesPath)) {
    console.log('❌ 角色库文件不存在:', spritesPath);
    return;
  }

  const spritesData = JSON.parse(fs.readFileSync(spritesPath, 'utf8'));
  console.log(`找到 ${spritesData.length} 个角色`);

  let importedCount = 0;
  let failedCount = 0;

  for (const spriteData of spritesData) {
    try {
      // 只导入真正的角色，跳过字母角色
      if (spriteData.name.startsWith('Story-')) {
        console.log(`⏭️  跳过字母角色: ${spriteData.name}`);
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
      failedCount++;
    }
  }

  console.log(`\n📊 角色导入完成: ${importedCount} 个成功, ${failedCount} 个失败`);
}

async function main() {
  console.log('🚀 开始重新导入Scratch 3.0角色库');
  console.log('='.repeat(50));

  await connectDB();

  try {
    await cleanAndImportSprites();
  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ 数据库连接已关闭');
    console.log('🎉 角色重新导入完成!');
  }
}

main();
