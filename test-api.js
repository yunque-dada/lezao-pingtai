const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testScratchProjectCreation() {
  console.log('测试登录...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: 'admin', password: '123456' }),
  });

  const loginData = await loginResponse.json();
  console.log('登录响应:', loginData);

  if (!loginData.success || !loginData.data || !loginData.data.token) {
    console.error('登录失败');
    return;
  }

  const token = loginData.data.token;
  console.log('登录成功，获取到令牌:', token.substring(0, 20) + '...');

  console.log('\n测试创建Scratch项目...');
  const createProjectResponse = await fetch(`${API_BASE_URL}/scratch/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: '新建作品',
      description: '',
      projectData: JSON.stringify({ targets: [] }),
      isPublic: false,
      tags: [],
    }),
  });

  const createProjectData = await createProjectResponse.json();
  console.log('创建项目响应:', createProjectData);

  if (createProjectData.success) {
    console.log('创建项目成功!');
  } else {
    console.error('创建项目失败:', createProjectData.message);
  }
}

testScratchProjectCreation().catch(console.error);
