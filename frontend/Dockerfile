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

# 创建启动脚本
RUN { \
    echo '#!/bin/sh'; \
    echo 'BACKEND_URL=${BACKEND_URL:-http://localhost:5000}'; \
    echo 'if ! echo "$BACKEND_URL" | grep -qE "^https?://"; then'; \
    echo '  BACKEND_URL="https://$BACKEND_URL"'; \
    echo 'fi'; \
    echo 'echo "Using BACKEND_URL: $BACKEND_URL"'; \
    echo 'cat > /etc/nginx/conf.d/default.conf << NGINXCONFIG'; \
    echo 'server {'; \
    echo '    listen 80;'; \
    echo '    server_name localhost;'; \
    echo ''; \
    echo '    location / {'; \
    echo '        root /usr/share/nginx/html;'; \
    echo '        index index.html index.htm;'; \
    echo '        try_files \$uri \$uri/ /index.html;'; \
    echo '    }'; \
    echo ''; \
    echo '    location /api {'; \
    echo "        proxy_pass \${BACKEND_URL}/api;"; \
    echo '        proxy_http_version 1.1;'; \
    echo '        proxy_set_header Upgrade \$http_upgrade;'; \
    echo "        proxy_set_header Connection 'upgrade';"; \
    echo '        proxy_set_header Host \$host;'; \
    echo '        proxy_cache_bypass \$http_upgrade;'; \
    echo '    }'; \
    echo ''; \
    echo '    location /scratch3-master {'; \
    echo "        proxy_pass \${BACKEND_URL}/scratch3-master;"; \
    echo '        proxy_http_version 1.1;'; \
    echo '        proxy_set_header Upgrade \$http_upgrade;'; \
    echo "        proxy_set_header Connection 'upgrade';"; \
    echo '        proxy_set_header Host \$host;'; \
    echo '        proxy_cache_bypass \$http_upgrade;'; \
    echo '    }'; \
    echo '}'; \
    echo 'NGINXCONFIG'; \
    echo 'cat /etc/nginx/conf.d/default.conf'; \
    echo 'nginx -g "daemon off;"'; \
} > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
