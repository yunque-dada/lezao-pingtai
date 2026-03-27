# 数据库结构说明

## 数据库集合

### 1. users (用户表)
- **username**: 用户名 (唯一, 必填, 3-50字符)
- **password**: 密码 (必填, 最少6字符)
- **role**: 角色 (admin/teacher/student)
- **email**: 邮箱 (唯一, 必填)
- **avatar**: 头像URL
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 2. courses (课程表)
- **title**: 课程标题 (必填, 最多100字符)
- **description**: 课程描述 (必填, 最多500字符)
- **teacher**: 教师ID (关联users表)
- **students**: 学生ID数组 (关联users表)
- **coverImage**: 封面图片URL
- **difficulty**: 难度 (beginner/intermediate/advanced)
- **status**: 状态 (draft/published/archived)
- **lessons**: 课时ID数组 (关联lessons表)
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 3. lessons (课时表)
- **title**: 课时标题 (必填, 最多100字符)
- **description**: 课时描述 (必填, 最多500字符)
- **course**: 课程ID (关联courses表)
- **order**: 排序序号
- **content**: 课时内容
- **videoUrl**: 视频URL
- **scratchProject**: Scratch项目数据
- **duration**: 时长(分钟)
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 4. projects (作品表)
- **title**: 作品标题 (必填, 最多100字符)
- **description**: 作品描述 (最多500字符)
- **author**: 作者ID (关联users表)
- **course**: 课程ID (关联courses表, 可选)
- **scratchData**: Scratch项目数据 (JSON字符串)
- **thumbnail**: 缩略图URL
- **isPublic**: 是否公开
- **likes**: 点赞数
- **views**: 浏览数
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 5. sprites (角色库表)
- **name**: 角色名称 (必填, 最多50字符)
- **category**: 分类
- **tags**: 标签数组
- **imageUrl**: 图片URL
- **sb3File**: SB3文件路径
- **downloadCount**: 下载次数
- **createdBy**: 创建者ID (关联users表, 可选)
- **isOfficial**: 是否官方资源
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 6. backdrops (背景库表)
- **name**: 背景名称 (必填, 最多50字符)
- **category**: 分类
- **tags**: 标签数组
- **imageUrl**: 图片URL
- **sb3File**: SB3文件路径
- **downloadCount**: 下载次数
- **createdBy**: 创建者ID (关联users表, 可选)
- **isOfficial**: 是否官方资源
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 7. sounds (音乐库表)
- **name**: 音乐名称 (必填, 最多50字符)
- **category**: 分类
- **tags**: 标签数组
- **audioUrl**: 音频URL
- **duration**: 时长(秒)
- **downloadCount**: 下载次数
- **createdBy**: 创建者ID (关联users表, 可选)
- **isOfficial**: 是否官方资源
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

## 初始数据

系统启动时会自动创建以下初始账户：

| 角色 | 用户名 | 密码 | 邮箱 |
|------|--------|------|------|
| 管理员 | admin | admin123 | admin@scratch-platform.com |
| 教师 | teacher1 | teacher123 | teacher1@scratch-platform.com |
| 学生 | student1 | student123 | student1@scratch-platform.com |

## 数据库关系

```
User (用户)
  ├─> Course (课程) - 教师创建
  ├─> Course (课程) - 学生参与
  └─> Project (作品) - 用户创作

Course (课程)
  ├─> User (教师)
  ├─> User[] (学生列表)
  └─> Lesson[] (课时列表)

Lesson (课时)
  └─> Course (所属课程)

Project (作品)
  ├─> User (作者)
  └─> Course (关联课程, 可选)

Sprite/Backdrop/Sound (资源库)
  └─> User (创建者, 可选)
```
