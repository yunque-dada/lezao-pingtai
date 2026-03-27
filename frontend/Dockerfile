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
RUN printf '%s\n' \
    '#!/bin/sh' \
    'BACKEND_URL=${BACKEND_URL:-http://localhost:5000}' \
    'if [ -z "$BACKEND_URL" ]; then' \
    '  echo "Error: BACKEND_URL is not set"' \
    '  exit 1' \
    'fi' \
    'if ! echo "$BACKEND_URL" | grep -qE "^https?://"; then' \
    '  BACKEND_URL="https://$BACKEND_URL"' \
    'fi' \
    'echo "Using BACKEND_URL: $BACKEND_URL"' \
    'cat > /etc/nginx/conf.d/default.conf << EOF' \
    'server {' \
    '    listen 80;' \
    '    server_name localhost;' \
    '' \
    '    location / {' \
    '        root /usr/share/nginx/html;' \
    '        index index.html index.htm;' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '' \
    '    location /api {' \
    "        proxy_pass $BACKEND_URL/api;" \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Upgrade $http_upgrade;' \
    "        proxy_set_header Connection 'upgrade';" \
    '        proxy_set_header Host $host;' \
    '        proxy_cache_bypass $http_upgrade;' \
    '    }' \
    '' \
    '    location /scratch3-master {' \
    "        proxy_pass $BACKEND_URL/scratch3-master;" \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Upgrade $http_upgrade;' \
    "        proxy_set_header Connection 'upgrade';" \
    '        proxy_set_header Host $host;' \
    '        proxy_cache_bypass $http_upgrade;' \
    '    }' \
    '}' \
    'EOF' \
    'cat /etc/nginx/conf.d/default.conf' \
    'nginx -g "daemon off;"' \
    > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
