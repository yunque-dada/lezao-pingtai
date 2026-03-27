require('dotenv').config();
const mongoose = require('mongoose');

async function dropEmailIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao-platform');
    console.log('MongoDB连接成功');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const userCollection = collections.find(c => c.name === 'users');

    if (userCollection) {
      const indexes = await db.collection('users').indexes();
      console.log('当前索引:', indexes.map(i => i.name));

      try {
        await db.collection('users').dropIndex('email_1');
        console.log('已删除 email_1 索引');
      } catch (err) {
        console.log('email_1 索引不存在或删除失败:', err.message);
      }
    }

    await mongoose.disconnect();
    console.log('完成');
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

dropEmailIndex();
