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

# 复制构建产物到nginx的静态文件目录
COPY --from=build /app/build /usr/share/nginx/html

# 创建启动脚本，用于生成nginx配置文件
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'BACKEND_URL=${BACKEND_URL:-http://localhost:5000}' >> /docker-entrypoint.sh && \
    echo 'if [ -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "Error: BACKEND_URL is not set"' >> /docker-entrypoint.sh && \
    echo '  exit 1' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'if ! echo "$BACKEND_URL" | grep -qE "^https?://"; then' >> /docker-entrypoint.sh && \
    echo '  BACKEND_URL="https://$BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'echo "Using BACKEND_URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'cat > /etc/nginx/conf.d/default.conf << "EOF"' >> /docker-entrypoint.sh && \
    echo 'server {' >> /docker-entrypoint.sh && \
    echo '    listen 80;' >> /docker-entrypoint.sh && \
    echo '    server_name localhost;' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '    location / {' >> /docker-entrypoint.sh && \
    echo '        root /usr/share/nginx/html;' >> /docker-entrypoint.sh && \
    echo '        index index.html index.htm;' >> /docker-entrypoint.sh && \
    echo '        try_files $uri $uri/ /index.html;' >> /docker-entrypoint.sh && \
    echo '    }' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '    location /api {' >> /docker-entrypoint.sh && \
    echo "        proxy_pass \${BACKEND_URL}/api;" >> /docker-entrypoint.sh && \
    echo '        proxy_http_version 1.1;' >> /docker-entrypoint.sh && \
    echo '        proxy_set_header Upgrade $http_upgrade;' >> /docker-entrypoint.sh && \
    echo "        proxy_set_header Connection 'upgrade';" >> /docker-entrypoint.sh && \
    echo '        proxy_set_header Host $host;' >> /docker-entrypoint.sh && \
    echo '        proxy_cache_bypass $http_upgrade;' >> /docker-entrypoint.sh && \
    echo '    }' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '    location /scratch3-master {' >> /docker-entrypoint.sh && \
    echo "        proxy_pass \${BACKEND_URL}/scratch3-master;" >> /docker-entrypoint.sh && \
    echo '        proxy_http_version 1.1;' >> /docker-entrypoint.sh && \
    echo '        proxy_set_header Upgrade $http_upgrade;' >> /docker-entrypoint.sh && \
    echo "        proxy_set_header Connection 'upgrade';" >> /docker-entrypoint.sh && \
    echo '        proxy_set_header Host $host;' >> /docker-entrypoint.sh && \
    echo '        proxy_cache_bypass $http_upgrade;' >> /docker-entrypoint.sh && \
    echo '    }' >> /docker-entrypoint.sh && \
    echo '}' >> /docker-entrypoint.sh && \
    echo 'EOF' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
