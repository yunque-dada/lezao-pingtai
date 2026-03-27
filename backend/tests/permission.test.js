const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('权限控制测试', () => {
  let adminToken;
  let teacherToken;
  let studentToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scratch-platform');

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'teacher1', password: 'teacher123' });
    teacherToken = teacherLogin.body.data.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'test123456' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/users', () => {
    test('管理员应该能查看用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('老师应该能查看用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('学生不应该能查看用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('没有权限执行此操作');
    });
  });

  describe('POST /api/users', () => {
    test('管理员应该能创建用户', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          password: 'password123',
          email: 'newuser@test.com',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('创建用户成功');
    });

    test('老师不应该能创建用户', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          username: 'newuser2',
          password: 'password123',
          email: 'newuser2@test.com',
          role: 'student'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('学生不应该能创建用户', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          username: 'newuser3',
          password: 'password123',
          email: 'newuser3@test.com',
          role: 'student'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    let userId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'deletetest',
          password: 'password123',
          email: 'delete@test.com',
          role: 'student'
        });
      userId = createResponse.body.data.user.id;
    });

    test('管理员应该能删除用户', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('老师不应该能删除用户', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('未认证访问', () => {
    test('不带token访问受保护路由应该返回401', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('无效token访问受保护路由应该返回401', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
