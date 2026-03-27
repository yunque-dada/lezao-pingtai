FROM node:18
WORKDIR /app
# 复制所有文件
COPY . .
# 详细列出当前目录内容，检查文件是否正确复制
RUN ls -la
# 检查是否存在package.json文件
RUN ls -la package.json || echo "package.json不存在"
# 检查server.js文件是否存在
RUN ls -la server.js
# 显示server.js文件内容，检查语法是否正确
RUN cat server.js
# 安装依赖，包括TypeScript
RUN npm install
# 修改package.json中的start脚本，指向我们创建的server.js文件
RUN npm pkg set scripts.start="node server.js"
# 显示package.json中的scripts部分
RUN npm pkg get scripts
EXPOSE 5000
CMD ["npm", "start"]