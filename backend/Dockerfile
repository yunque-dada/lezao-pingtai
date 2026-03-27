FROM node:18
WORKDIR /app
# 检查当前工作目录
RUN pwd
# 列出构建上下文中的文件
RUN ls -la /
# 复制package.json和package-lock.json
COPY package*.json ./
RUN ls -la
RUN npm install
# 复制所有文件
COPY . .
# 详细列出当前目录内容，检查tsconfig.json是否存在
RUN ls -la
# 检查是否存在src目录
RUN ls -la src/ || echo "src目录不存在"
# 从项目根目录复制tsconfig.json文件
COPY tsconfig.json ./
# 再次检查tsconfig.json是否存在
RUN ls -la
# 检查tsconfig.json文件内容
RUN cat tsconfig.json
# 创建环境变量文件
RUN echo "NODE_ENV=production" > .env
RUN echo "PORT=5000" >> .env
RUN echo "MONGODB_URI=mongodb://localhost:27017/scratch-platform" >> .env
RUN echo "JWT_SECRET=your-secret-key" >> .env
RUN echo "JWT_EXPIRE=7d" >> .env
RUN echo "REDIS_HOST=localhost" >> .env
RUN echo "REDIS_PORT=6379" >> .env
RUN echo "CLIENT_URL=http://localhost:3000" >> .env
RUN echo "CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5000" >> .env
# 打印TypeScript版本
RUN npx tsc --version
# 手动指定tsconfig.json路径执行构建
RUN npx tsc --project tsconfig.json
EXPOSE 5000
CMD ["npm", "start"]