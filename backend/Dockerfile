FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 列出当前目录内容，检查文件是否正确复制
RUN ls -la
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
# 执行构建
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]