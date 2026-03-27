# 少儿编程课程平台

基于 Scratch 3.0 的少儿编程课程平台，提供完整的课程管理、作品创作和资源库管理功能。

## 项目结构

```
lezao-pingtai/
├── frontend/          # 前端项目 (React + TypeScript)
├── backend/           # 后端项目 (Node.js + Express + TypeScript)
└── scratch3-master/   # Scratch 3.0 编辑器
```

## 技术栈

### 前端
- React 18
- TypeScript
- Redux Toolkit
- React Router
- Ant Design
- Axios
- Socket.io Client
- Styled Components

### 后端
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- Redis
- JWT 认证
- Socket.io

## 功能模块

### 老师端
- 课程管理
- 学生管理
- 作品管理

### 学生端
- 课程中心
- 作品中心

### 管理中心
- 老师管理
- 课程管理
- 学生管理
- 作品管理
- Scratch 资源库管理（角色、背景、音乐）

## 开发环境要求

- Node.js >= 16.x
- MongoDB >= 4.x
- Redis >= 6.x
- npm >= 8.x

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd lezao-pingtai
```

### 2. 安装依赖

#### 前端
```bash
cd frontend
npm install
```

#### 后端
```bash
cd backend
npm install
```

### 3. 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/scratch-platform

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. 启动开发服务器

#### 启动 MongoDB
```bash
mongod
```

#### 启动 Redis
```bash
redis-server
```

#### 启动后端
```bash
cd backend
npm run dev
```

#### 启动前端
```bash
cd frontend
npm start
```

### 5. 访问应用

- 前端地址: http://localhost:3000
- 后端API: http://localhost:5000

## 默认账户

系统启动时会自动创建以下账户：

| 角色 | 用户名 | 密码 | 邮箱 |
|------|--------|------|------|
| 管理员 | admin | admin123 | admin@scratch-platform.com |
| 教师 | teacher1 | teacher123 | teacher1@scratch-platform.com |
| 学生 | student1 | student123 | student1@scratch-platform.com |

## 开发命令

### 前端
```bash
npm start          # 启动开发服务器
npm run build      # 构建生产版本
npm test           # 运行测试
npm run eject      # 弹出配置（不可逆）
```

### 后端
```bash
npm run dev        # 启动开发服务器
npm run build      # 编译 TypeScript
npm start          # 启动生产服务器
npm run lint       # 运行 ESLint
npm run lint:fix   # 自动修复 ESLint 错误
npm run format     # 格式化代码
```

## 项目文档

- [数据库结构说明](backend/DATABASE.md)
- [Scratch 3.0 开发文档](scratch3-master/SCRATCH3_DEV_DOC.md)
- [详细规划方案](少儿编程课程平台详细规划方案.md)
- [执行步骤](少儿编程课程平台执行步骤.md)

## 开发进度

### 第1周：项目初始化与环境搭建
- ✅ 第1天：前端项目初始化
- ✅ 第2天：后端服务搭建
- ✅ 第3天：数据库设计与初始化
- ✅ 第4天：基础配置与工具搭建
- ⏳ 第5天：项目结构优化与测试

## 许可证

ISC

## 联系方式

如有问题，请联系项目维护人员。
