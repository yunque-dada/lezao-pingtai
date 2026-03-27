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

# 安装envsubst用于替换环境变量
RUN apk add --no-cache gettext

# 复制构建产物到nginx的静态文件目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制nginx配置文件模板
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# 创建启动脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export BACKEND_URL=${BACKEND_URL:-http://localhost:5000}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\${BACKEND_URL}" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
