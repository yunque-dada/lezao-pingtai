import User from '../models/User';
import bcrypt from 'bcryptjs';

const createInitialData = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('初始数据已存在，跳过创建');
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      email: 'admin@scratch-platform.com',
      realName: '系统管理员',
      status: 'active'
    });

    console.log('管理员账户创建成功:', admin.username);

    const teacher = await User.create({
      username: 'teacher1',
      password: hashedPassword,
      role: 'teacher',
      email: 'teacher1@scratch-platform.com',
      realName: '张老师',
      status: 'active'
    });

    console.log('教师账户创建成功:', teacher.username);

    const teacher2 = await User.create({
      username: 'teacher2',
      password: hashedPassword,
      role: 'teacher',
      email: 'teacher2@scratch-platform.com',
      realName: '李老师',
      status: 'active'
    });

    console.log('教师账户创建成功:', teacher2.username);

    const student = await User.create({
      username: 'student1',
      password: hashedPassword,
      role: 'student',
      email: 'student1@scratch-platform.com',
      realName: '小明',
      status: 'active'
    });

    console.log('学生账户创建成功:', student.username);

    const student2 = await User.create({
      username: 'student2',
      password: hashedPassword,
      role: 'student',
      email: 'student2@scratch-platform.com',
      realName: '小红',
      status: 'active'
    });

    console.log('学生账户创建成功:', student2.username);

    console.log('初始数据创建完成！');
    console.log('-----------------------------------');
    console.log('所有账户密码: 123456');
    console.log('管理员: admin');
    console.log('老师: teacher1 / teacher2');
    console.log('学生: student1 / student2');
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('创建初始数据失败:', error);
  }
};

export default createInitialData;
