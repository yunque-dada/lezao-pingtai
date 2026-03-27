FROM node:18 as build
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有文件
COPY . .

# 清除之前的构建缓存
RUN rm -rf build/

# 构建项目
RUN npm run build

# 详细检查构建输出
RUN echo "=== Checking build directory ===" && \
    ls -la build/ && \
    echo "=== Checking for index.html ===" && \
    cat build/index.html | head -20

FROM nginx:alpine

# 复制构建产物到nginx的静态文件目录
COPY --from=build /app/build /usr/share/nginx/html

# 检查复制后的文件
RUN echo "=== Files in nginx html directory ===" && \
    ls -la /usr/share/nginx/html

# 创建启动脚本，使用Railway的PORT环境变量
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'PORT=${PORT:-80}' >> /docker-entrypoint.sh && \
    echo 'echo "Using PORT: $PORT"' >> /docker-entrypoint.sh && \
    echo 'sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 创建默认nginx配置（使用80端口，会被脚本替换）
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        index index.html index.htm;' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# 暴露端口（Railway会动态分配）
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
