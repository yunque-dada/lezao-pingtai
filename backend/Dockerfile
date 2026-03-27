FROM node:18
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 编译TypeScript代码
RUN npm run build

# 检查编译输出
RUN ls -la dist/

# 暴露5000端口
EXPOSE 5000

# 启动编译后的服务器
CMD ["node", "dist/server.js"]
