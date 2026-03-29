FROM node:18
WORKDIR /app

# 复制scratch3-master目录
COPY scratch3-master/ ./scratch3-master/

# 构建scratch3-master
WORKDIR /app/scratch3-master
RUN npm install --legacy-peer-deps && npm run build:prod

# 检查scratch3-master构建结果
RUN ls -la && ls -la build/

# 回到backend目录
WORKDIR /app

# 复制backend目录的package.json和package-lock.json
COPY backend/package*.json ./

# 安装依赖（使用--legacy-peer-deps解决依赖冲突）
RUN npm install --legacy-peer-deps

# 复制backend目录的所有源代码
COPY backend/ ./

# 检查文件结构
RUN ls -la && ls -la src/ && ls -la ../

# 编译TypeScript代码
RUN npx tsc --project tsconfig.json

# 检查编译输出
RUN ls -la dist/

# 暴露5000端口
EXPOSE 5000

# 启动编译后的服务器
CMD ["node", "dist/server.js"]
