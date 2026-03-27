import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao-pingtai';

interface IUserDoc {
  _id: mongoose.Types.ObjectId;
  username: string;
  role: string;
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const users = await User.insertMany([
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@lezao.com',
        role: 'admin',
        realName: '系统管理员',
        status: 'active',
      },
      {
        username: 'teacher1',
        password: hashedPassword,
        email: 'teacher1@lezao.com',
        role: 'teacher',
        realName: '张老师',
        bio: '资深Scratch编程教师，10年教学经验',
        status: 'active',
      },
      {
        username: 'teacher2',
        password: hashedPassword,
        email: 'teacher2@lezao.com',
        role: 'teacher',
        realName: '李老师',
        bio: '专注少儿编程启蒙教育',
        status: 'active',
      },
      {
        username: 'student1',
        password: hashedPassword,
        email: 'student1@lezao.com',
        role: 'student',
        realName: '小明',
        status: 'active',
      },
      {
        username: 'student2',
        password: hashedPassword,
        email: 'student2@lezao.com',
        role: 'student',
        realName: '小红',
        status: 'active',
      },
    ]) as IUserDoc[];
    console.log('Created users');

    const teacher1 = users.find((u: IUserDoc) => u.username === 'teacher1')!;
    const teacher2 = users.find((u: IUserDoc) => u.username === 'teacher2')!;

    const tempCourseId = new mongoose.Types.ObjectId();

    const lessons = await Lesson.insertMany([
      {
        title: '认识Scratch界面',
        description: '了解Scratch的各个组成部分',
        course: tempCourseId,
        type: 'video',
        duration: 15,
        order: 1,
        content: 'https://example.com/video1.mp4',
      },
      {
        title: '创建第一个角色',
        description: '学习如何添加和编辑角色',
        course: tempCourseId,
        type: 'scratch',
        duration: 20,
        order: 2,
        content: JSON.stringify({ blocks: [] }),
      },
      {
        title: '让角色动起来',
        description: '学习运动积木的使用',
        course: tempCourseId,
        type: 'scratch',
        duration: 25,
        order: 3,
        content: JSON.stringify({ blocks: [] }),
      },
      {
        title: '条件判断入门',
        description: '学习if-else语句的使用',
        course: tempCourseId,
        type: 'scratch',
        duration: 30,
        order: 1,
        content: JSON.stringify({ blocks: [] }),
      },
      {
        title: '循环结构',
        description: '学习重复执行积木',
        course: tempCourseId,
        type: 'scratch',
        duration: 25,
        order: 2,
        content: JSON.stringify({ blocks: [] }),
      },
    ]);
    console.log('Created lessons');

    const courses = await Course.insertMany([
      {
        title: 'Scratch编程入门',
        description: '本课程专为编程零基础的孩子设计，通过有趣的项目和游戏，让孩子轻松掌握Scratch编程的基础知识，培养编程思维和创造力。',
        teacher: teacher1._id,
        category: 'Scratch基础',
        difficulty: 'beginner',
        status: 'published',
        duration: 60,
        lessons: [lessons[0]._id, lessons[1]._id, lessons[2]._id],
        tags: ['Scratch', '入门', '编程基础'],
        prerequisites: ['会使用电脑基本操作'],
        objectives: ['了解Scratch界面', '学会创建角色', '掌握基本运动编程'],
        enrolledCount: 15,
        rating: 4.8,
        ratingCount: 10,
        publishedAt: new Date(),
      },
      {
        title: 'Scratch进阶：游戏开发',
        description: '在掌握基础知识后，本课程将带领孩子开发完整的游戏项目，包括飞机大战、贪吃蛇等经典游戏，提升编程能力。',
        teacher: teacher1._id,
        category: '游戏开发',
        difficulty: 'intermediate',
        status: 'published',
        duration: 90,
        lessons: [lessons[3]._id, lessons[4]._id],
        tags: ['Scratch', '游戏开发', '进阶'],
        prerequisites: ['完成Scratch入门课程', '掌握基本编程概念'],
        objectives: ['独立开发小游戏', '理解游戏逻辑', '提升编程思维'],
        enrolledCount: 8,
        rating: 4.5,
        ratingCount: 5,
        publishedAt: new Date(),
      },
      {
        title: '创意动画制作',
        description: '学习使用Scratch制作精美的动画作品，让孩子的想象力得到充分发挥。',
        teacher: teacher2._id,
        category: '动画制作',
        difficulty: 'beginner',
        status: 'draft',
        duration: 45,
        lessons: [],
        tags: ['Scratch', '动画', '创意'],
        prerequisites: ['Scratch基础知识'],
        objectives: ['制作动画故事', '掌握角色造型切换', '学习音效添加'],
        enrolledCount: 0,
        rating: 0,
        ratingCount: 0,
      },
    ]);
    console.log('Created courses');

    await Lesson.updateMany(
      { _id: { $in: [lessons[0]._id, lessons[1]._id, lessons[2]._id] } },
      { course: courses[0]._id }
    );
    await Lesson.updateMany(
      { _id: { $in: [lessons[3]._id, lessons[4]._id] } },
      { course: courses[1]._id }
    );
    console.log('Updated lesson references');

    console.log('\n=== Seed completed! ===');
    console.log('\nTest accounts (password: 123456):');
    console.log('  Admin: admin');
    console.log('  Teacher: teacher1, teacher2');
    console.log('  Student: student1, student2');
    console.log('\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
