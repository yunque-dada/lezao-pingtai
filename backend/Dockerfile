FROM node:18
WORKDIR /app
# 复制所有文件
COPY . .
# 详细列出当前目录内容，检查文件是否正确复制
RUN ls -la
# 检查是否存在package.json文件
RUN ls -la package.json || echo "package.json不存在"
# 安装依赖，包括TypeScript
RUN npm install
# 直接创建一个简单的server.js文件作为启动入口
RUN echo 'const http = require("http");\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader("Content-Type", "text/plain");\n  res.end("Hello World!\n");\n});\nserver.listen(5000, () => {\n  console.log("Server running on port 5000");\n});' > server.js
# 检查server.js文件是否存在
RUN ls -la server.js
EXPOSE 5000
CMD ["node", "server.js"]