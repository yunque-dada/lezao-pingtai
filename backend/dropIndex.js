const mongoose = require('mongoose');
const ScratchProject = require('./src/models/ScratchProject').default;

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/lezao-pingtai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB连接成功');
  
  // 获取当前索引
  const indexes = await ScratchProject.collection.getIndexes();
  console.log('当前索引:', indexes);
  
  // 查找并删除包含tags字段的文本索引
  for (const [name, index] of Object.entries(indexes)) {
    if (index.key && index.key.title === 'text' && index.key.description === 'text' && index.key.tags) {
      console.log(`删除索引: ${name}`);
      await ScratchProject.collection.dropIndex(name);
      console.log(`索引 ${name} 删除成功`);
    }
  }
  
  // 再次获取索引，确认删除成功
  const newIndexes = await ScratchProject.collection.getIndexes();
  console.log('删除后的索引:', newIndexes);
  
  mongoose.disconnect();
  console.log('MongoDB连接已关闭');
})
.catch(error => {
  console.error('连接MongoDB失败:', error);
  mongoose.disconnect();
});