FROM node:18 as build
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有文件
COPY . .

# 构建项目（使用生产环境变量）
RUN npm run build

FROM nginx:alpine

# 安装dos2unix用于转换换行符
RUN apk add --no-cache dos2unix

# 复制构建产物到nginx的静态文件目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制启动脚本并转换换行符
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN dos2unix /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
