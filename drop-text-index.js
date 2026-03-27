const mongoose = require('mongoose');

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/scratch-platform');

// 定义ScratchProject模型
const ScratchProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  projectData: String,
  thumbnail: String,
  author: mongoose.Schema.Types.ObjectId,
  authorName: String,
  isPublic: Boolean,
  isFeatured: Boolean,
  likes: Number,
  likedBy: [mongoose.Schema.Types.ObjectId],
  views: Number,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
});

const ScratchProject = mongoose.model('ScratchProject', ScratchProjectSchema);

// 查看当前索引
async function checkIndexes() {
  try {
    const indexes = await ScratchProject.collection.getIndexes();
    console.log('当前索引:', indexes);
  } catch (error) {
    console.error('查看索引失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 删除文本索引
async function dropTextIndex() {
  try {
    // 查看当前索引
    const indexes = await ScratchProject.collection.getIndexes();
    console.log('删除前的索引:', indexes);
    
    // 直接删除包含tags的文本索引
    const textIndexName = 'title_text_description_text_tags_1';
    
    if (indexes[textIndexName]) {
      console.log('找到文本索引:', textIndexName);
      // 删除文本索引
      await ScratchProject.collection.dropIndex(textIndexName);
      console.log('文本索引删除成功');
      
      // 查看删除后的索引
      const newIndexes = await ScratchProject.collection.getIndexes();
      console.log('删除后的索引:', newIndexes);
    } else {
      console.log('未找到文本索引:', textIndexName);
    }
  } catch (error) {
    console.error('删除索引失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 运行函数
dropTextIndex();
