FROM node:18
WORKDIR /app
# 复制package.json和package-lock.json
COPY package*.json ./
RUN npm install
# 复制src目录
COPY src/ src/
# 详细列出当前目录内容，检查文件是否正确复制
RUN ls -la
# 检查src目录中的文件
RUN ls -la src/
# 检查src目录中的文件，确保app.ts和server.ts存在
RUN ls -la src/app.ts src/server.ts || echo "app.ts或server.ts不存在"
# 直接创建tsconfig.json文件
RUN echo '{"compilerOptions":{"target":"ES2020","module":"Node16","lib":["ES2020"],"outDir":"./dist","rootDir":"./src","strict":true,"esModuleInterop":true,"skipLibCheck":true,"forceConsistentCasingInFileNames":true,"resolveJsonModule":true,"moduleResolution":"Node16","emitDecoratorMetadata":true,"experimentalDecorators":true,"sourceMap":true,"isolatedModules":true},"include":["src/**/*"],"exclude":["node_modules","dist"]}' > tsconfig.json
# 显示tsconfig.json文件内容
RUN cat tsconfig.json
# 创建环境变量文件
RUN echo "NODE_ENV=production" > .env && \
    echo "PORT=5000" >> .env && \
    echo "MONGODB_URI=mongodb://localhost:27017/scratch-platform" >> .env && \
    echo "JWT_SECRET=your-secret-key" >> .env && \
    echo "JWT_EXPIRE=7d" >> .env && \
    echo "REDIS_HOST=localhost" >> .env && \
    echo "REDIS_PORT=6379" >> .env && \
    echo "CLIENT_URL=http://localhost:3000" >> .env && \
    echo "CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5000" >> .env
# 打印TypeScript版本
RUN npx tsc --version
# 执行TypeScript编译
RUN npx tsc --project tsconfig.json
# 检查编译结果
RUN ls -la dist/
# 检查server.js文件是否存在
RUN ls -la dist/server.js
EXPOSE 5000
CMD ["npm", "start"]