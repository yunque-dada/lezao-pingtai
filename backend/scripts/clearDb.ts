import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao-pingtai';
    await mongoose.connect(mongoUri);

    console.log('数据库连接成功');

    // 删除所有用户
    const User = mongoose.models.User || (await import('../src/models/User')).default;
    const Course = mongoose.models.Course || (await import('../src/models/Course')).default;
    const Lesson = mongoose.models.Lesson || (await import('../src/models/Lesson')).default;

    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    console.log('数据库清理完成！');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('清理数据库失败:', error);
    process.exit(1);
  }
};

clearDatabase();
