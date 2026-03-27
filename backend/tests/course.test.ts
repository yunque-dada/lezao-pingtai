import '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import Course from '../src/models/Course';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

let teacherToken: string;
let studentToken: string;
let adminToken: string;
let teacherId: string;
let studentId: string;
let testCourseId: string;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao-pingtai-test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  await User.deleteMany({});
  await Course.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('test123456', salt);

  const teacher = await User.create({
    username: 'testteacher',
    password: hashedPassword,
    email: 'testteacher@lezao.com',
    role: 'teacher',
    realName: '测试老师',
    status: 'active',
  });
  teacherId = teacher._id.toString();

  const student = await User.create({
    username: 'teststudent',
    password: hashedPassword,
    email: 'teststudent@lezao.com',
    role: 'student',
    realName: '测试学生',
    status: 'active',
  });
  studentId = student._id.toString();

  await User.create({
    username: 'testadmin',
    password: hashedPassword,
    email: 'testadmin@lezao.com',
    role: 'admin',
    realName: '测试管理员',
    status: 'active',
  });

  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testteacher', password: 'test123456' });
  teacherToken = teacherLogin.body.data.token;

  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teststudent', password: 'test123456' });
  studentToken = studentLogin.body.data.token;

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testadmin', password: 'test123456' });
  adminToken = adminLogin.body.data.token;

  const course = await Course.create({
    title: '初始测试课程',
    description: '这是一个初始测试课程',
    teacher: teacherId,
    category: 'Scratch基础',
    difficulty: 'beginner',
    status: 'draft',
  });
  testCourseId = course._id.toString();
});

afterAll(async () => {
  await User.deleteMany({});
  await Course.deleteMany({});
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

describe('课程管理测试', () => {
  describe('创建课程', () => {
    it('老师可以创建课程', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: '新测试课程',
          description: '这是一个新测试课程',
          category: 'Scratch基础',
          difficulty: 'beginner',
          tags: ['测试', '入门'],
          duration: 60,
          prerequisites: ['无'],
          objectives: ['学习基础编程'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('新测试课程');
      expect(response.body.data.status).toBe('draft');
    });

    it('学生不能创建课程', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '学生课程',
          description: '学生尝试创建课程',
          category: 'Scratch基础',
          difficulty: 'beginner',
        });

      expect(response.status).toBe(403);
    });

    it('未登录用户不能创建课程', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send({
          title: '未授权课程',
          description: '未登录用户尝试创建',
          category: 'Scratch基础',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('获取课程列表', () => {
    it('可以获取公开课程列表', async () => {
      const response = await request(app)
        .get('/api/courses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('可以按分类筛选课程', async () => {
      const response = await request(app)
        .get('/api/courses?category=Scratch基础');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('可以搜索课程', async () => {
      const response = await request(app)
        .get('/api/courses?search=测试');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('获取课程详情', () => {
    it('可以获取课程详情', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('初始测试课程');
    });

    it('获取不存在的课程返回404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/courses/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('更新课程', () => {
    it('老师可以更新自己的课程', async () => {
      const response = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: '更新后的测试课程',
          description: '更新后的描述',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('更新后的测试课程');
    });

    it('学生不能更新课程', async () => {
      const response = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: '学生尝试更新',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('获取我的课程', () => {
    it('老师可以获取自己创建的课程', async () => {
      const response = await request(app)
        .get('/api/courses/my-courses?role=teacher')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('学生可以获取自己报名的课程', async () => {
      const response = await request(app)
        .get('/api/courses/my-courses?role=student')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('获取课程统计', () => {
    it('老师可以查看自己课程的统计', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('enrolledCount');
      expect(response.body.data).toHaveProperty('lessonCount');
    });

    it('学生不能查看课程统计', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/stats`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('删除课程', () => {
    it('学生不能删除课程', async () => {
      const response = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });

    it('老师可以删除自己的课程', async () => {
      const response = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
