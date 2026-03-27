FROM node:18
WORKDIR /app
# 检查当前工作目录
RUN pwd
# 复制package.json和package-lock.json
COPY package*.json ./
RUN ls -la
RUN npm install
# 复制所有文件
COPY . .
# 详细列出当前目录内容，检查文件是否正确复制
RUN ls -la
# 检查是否存在src目录
RUN ls -la src/ || echo "src目录不存在"
# 检查是否存在tsconfig.json文件
RUN if [ -f tsconfig.json ]; then echo "tsconfig.json存在"; cat tsconfig.json; else echo "tsconfig.json不存在"; fi
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
# 尝试构建，如果tsconfig.json存在
RUN if [ -f tsconfig.json ]; then npx tsc --project tsconfig.json; else echo "tsconfig.json不存在，跳过构建"; fi
EXPOSE 5000
CMD ["npm", "start"]