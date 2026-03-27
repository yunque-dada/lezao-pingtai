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

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建启动脚本，用于替换环境变量
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
    echo 'sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["/docker-entrypoint.sh"]
