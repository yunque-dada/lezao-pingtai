# LeZao 平台 1.0 版本 API 文档

## 1. 基础信息

### 1.1 基础 URL
- **开发环境**: `http://localhost:5000/api`
- **生产环境**: `https://api.lezao.com/api`

### 1.2 认证方式
- **认证类型**: JWT (JSON Web Token)
- **认证头部**: `Authorization: Bearer {token}`
- **令牌获取**: 登录接口返回

### 1.3 响应格式
```json
{
  "success": true,
  "data": { /* 响应数据 */ },
  "message": "操作成功"
}
```

### 1.4 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "错误详情"
}
```

## 2. Scratch 项目相关 API

### 2.1 项目管理

#### 2.1.1 获取所有项目
- **接口**: `GET /scratch/projects`
- **权限**: 所有角色
- **参数**:
  | 参数名 | 类型 | 说明 | 示例 |
  |--------|------|------|------|
  | page | number | 页码 | 1 |
  | limit | number | 每页数量 | 20 |
  | sort | string | 排序字段 | createdAt |
  | order | string | 排序方向 | desc |
  | status | string | 项目状态 | published |
  | tag | string | 标签 | game |

- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "_id": "60d7f8e9e8e9e9e9e9e9e9e9",
          "title": "我的第一个项目",
          "description": "这是一个测试项目",
          "author": "60d7f8e9e8e9e9e9e9e9e9e8",
          "authorName": "张三",
          "createdAt": "2026-03-27T00:00:00.000Z",
          "updatedAt": "2026-03-27T00:00:00.000Z",
          "likes": 10,
          "views": 100,
          "isFeatured": false
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
  ```

#### 2.1.2 获取单个项目
- **接口**: `GET /scratch/projects/{id}`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 项目详细信息

#### 2.1.3 创建项目
- **接口**: `POST /scratch/projects`
- **权限**: 所有角色
- **请求体**:
  ```json
  {
    "title": "新项目",
    "description": "项目描述",
    "tags": ["game", "education"]
  }
  ```
- **响应**: 创建的项目信息

#### 2.1.4 更新项目
- **接口**: `PUT /scratch/projects/{id}`
- **权限**: 项目作者或管理员
- **参数**: 路径参数 `id` (项目ID)
- **请求体**: 部分项目信息
- **响应**: 更新后的项目信息

#### 2.1.5 删除项目
- **接口**: `DELETE /scratch/projects/{id}`
- **权限**: 项目作者或管理员
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 成功消息

### 2.2 文件系统项目管理

#### 2.2.1 获取当前用户的文件系统项目
- **接口**: `GET /scratch/projects/my-files`
- **权限**: 所有角色
- **功能**: 读取用户目录下的 sb3 文件
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "_id": "1711545600000_1234_test_1.sb3",
          "title": "测试项目",
          "filename": "1711545600000_1234_test_1.sb3",
          "modifiedTime": "2026-03-27T00:00:00.000Z",
          "size": 10240,
          "author": "60d7f8e9e8e9e9e9e9e9e9e8",
          "authorName": "张三",
          "clientMark": 1
        }
      ]
    }
  }
  ```

#### 2.2.2 获取所有用户的文件系统项目
- **接口**: `GET /scratch/projects/all-files`
- **权限**: 老师或管理员
- **功能**: 遍历所有用户目录读取 sb3 文件
- **响应**: 所有用户的项目列表

#### 2.2.3 保存项目
- **接口**: `POST /scratch/projects/save`
- **权限**: 所有角色
- **请求体**:
  ```json
  {
    "title": "测试项目",
    "projectId": "可选，用于更新",
    "file": "base64编码的sb3文件内容"
  }
  ```
- **响应**: 保存后的项目信息

### 2.3 项目交互

#### 2.3.1 点赞项目
- **接口**: `POST /scratch/projects/{id}/like`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 更新后的项目信息

#### 2.3.2 取消点赞
- **接口**: `POST /scratch/projects/{id}/unlike`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 更新后的项目信息

#### 2.3.3 增加浏览量
- **接口**: `POST /scratch/projects/{id}/view`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 更新后的项目信息

#### 2.3.4 切换精选状态
- **接口**: `POST /scratch/projects/{id}/featured`
- **权限**: 管理员
- **参数**: 路径参数 `id` (项目ID)
- **响应**: 更新后的项目信息

#### 2.3.5 下载项目
- **接口**: `GET /scratch/projects/{id}/download`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (项目ID)
- **响应**: sb3 文件（二进制）

### 2.4 资源管理

#### 2.4.1 获取角色库
- **接口**: `GET /scratch/resources/sprites/json`
- **权限**: 所有角色
- **响应**: 角色库 JSON 数据

#### 2.4.2 获取背景库
- **接口**: `GET /scratch/resources/backdrops/json`
- **权限**: 所有角色
- **响应**: 背景库 JSON 数据

#### 2.4.3 获取声音库
- **接口**: `GET /scratch/resources/sounds/json`
- **权限**: 所有角色
- **响应**: 声音库 JSON 数据

## 3. 用户相关 API

### 3.1 认证

#### 3.1.1 登录
- **接口**: `POST /auth/login`
- **权限**: 无
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "token": "JWT令牌",
      "user": {
        "_id": "60d7f8e9e8e9e9e9e9e9e9e8",
        "name": "张三",
        "email": "user@example.com",
        "role": "student"
      }
    }
  }
  ```

#### 3.1.2 注册
- **接口**: `POST /auth/register`
- **权限**: 无
- **请求体**:
  ```json
  {
    "name": "张三",
    "email": "user@example.com",
    "password": "password123",
    "role": "student"
  }
  ```
- **响应**: 注册成功信息

#### 3.1.3 获取当前用户信息
- **接口**: `GET /auth/me`
- **权限**: 已登录用户
- **响应**: 当前用户信息

### 3.2 用户管理

#### 3.2.1 获取用户列表
- **接口**: `GET /users`
- **权限**: 管理员
- **参数**:
  | 参数名 | 类型 | 说明 | 示例 |
  |--------|------|------|------|
  | page | number | 页码 | 1 |
  | limit | number | 每页数量 | 20 |
  | role | string | 用户角色 | student |

- **响应**: 用户列表

#### 3.2.2 创建用户
- **接口**: `POST /users`
- **权限**: 管理员
- **请求体**: 用户信息
- **响应**: 创建的用户信息

#### 3.2.3 更新用户
- **接口**: `PUT /users/{id}`
- **权限**: 管理员或用户本人
- **参数**: 路径参数 `id` (用户ID)
- **请求体**: 部分用户信息
- **响应**: 更新后的用户信息

#### 3.2.4 删除用户
- **接口**: `DELETE /users/{id}`
- **权限**: 管理员
- **参数**: 路径参数 `id` (用户ID)
- **响应**: 成功消息

## 4. 课程相关 API

### 4.1 课程管理

#### 4.1.1 获取课程列表
- **接口**: `GET /courses`
- **权限**: 所有角色
- **参数**:
  | 参数名 | 类型 | 说明 | 示例 |
  |--------|------|------|------|
  | page | number | 页码 | 1 |
  | limit | number | 每页数量 | 20 |
  | category | string | 课程分类 | programming |

- **响应**: 课程列表

#### 4.1.2 获取课程详情
- **接口**: `GET /courses/{id}`
- **权限**: 所有角色
- **参数**: 路径参数 `id` (课程ID)
- **响应**: 课程详细信息

#### 4.1.3 创建课程
- **接口**: `POST /courses`
- **权限**: 老师或管理员
- **请求体**: 课程信息
- **响应**: 创建的课程信息

#### 4.1.4 更新课程
- **接口**: `PUT /courses/{id}`
- **权限**: 课程创建者或管理员
- **参数**: 路径参数 `id` (课程ID)
- **请求体**: 部分课程信息
- **响应**: 更新后的课程信息

#### 4.1.5 删除课程
- **接口**: `DELETE /courses/{id}`
- **权限**: 课程创建者或管理员
- **参数**: 路径参数 `id` (课程ID)
- **响应**: 成功消息

## 5. 错误码

| 错误码 | 描述 | 解决方法 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 登录获取有效令牌 |
| 403 | 权限不足 | 确认用户角色权限 |
| 404 | 资源不存在 | 检查资源ID是否正确 |
| 500 | 服务器内部错误 | 联系技术支持 |

## 6. 最佳实践

### 6.1 认证
- 每次请求都需要在头部携带 `Authorization: Bearer {token}`
- 令牌过期后需要重新登录获取

### 6.2 文件操作
- 上传 sb3 文件时建议使用 base64 编码
- 下载文件时处理二进制响应

### 6.3 错误处理
- 统一处理 API 错误响应
- 对关键操作添加错误重试机制

### 6.4 性能优化
- 使用分页获取大量数据
- 合理使用缓存减少重复请求

## 7. 示例代码

### 7.1 前端调用示例
```typescript
// 获取文件系统项目列表
async function getMyProjects() {
  try {
    const response = await fetch('http://localhost:5000/api/scratch/projects/my-files', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const data = await response.json();
    if (data.success) {
      return data.data.projects;
    }
  } catch (error) {
    console.error('获取项目失败:', error);
  }
}

// 保存项目
async function saveProject(title, fileContent) {
  try {
    const response = await fetch('http://localhost:5000/api/scratch/projects/save', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        file: btoa(fileContent)
      })
    });
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('保存项目失败:', error);
  }
}
```

### 7.2 后端调用示例
```typescript
// Node.js 示例
const axios = require('axios');

async function getProjects() {
  try {
    const response = await axios.get('http://localhost:5000/api/scratch/projects', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

## 8. 注意事项

1. **安全性**: 所有 API 调用都需要携带有效的 JWT 令牌
2. **文件大小**: 上传的 sb3 文件大小建议不超过 10MB
3. **速率限制**: 每个用户每分钟最多 60 次 API 请求
4. **CORS**: 已配置跨域支持，前端可以直接调用
5. **版本控制**: 后续版本可能会添加新的 API 端点，但会保持现有 API 的向后兼容性

## 9. 技术支持

- **API 文档**: https://docs.lezao.com/api
- **技术支持**: tech@lezao.com
- **问题反馈**: https://github.com/lezao/platform/issues

---

此 API 文档对应 LeZao 平台 1.0 版本，如有任何问题或建议，请联系技术支持。