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

# 直接创建nginx配置文件，不使用脚本
RUN printf '%s\n' \
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
    '        proxy_pass https://lezao-pingtai-houduan-production.up.railway.app/api;' \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Upgrade $http_upgrade;' \
    '        proxy_set_header Connection '"'"'upgrade'"'"';' \
    '        proxy_set_header Host $host;' \
    '        proxy_cache_bypass $http_upgrade;' \
    '    }' \
    '' \
    '    location /scratch3-master {' \
    '        proxy_pass https://lezao-pingtai-houduan-production.up.railway.app/scratch3-master;' \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Upgrade $http_upgrade;' \
    '        proxy_set_header Connection '"'"'upgrade'"'"';' \
    '        proxy_set_header Host $host;' \
    '        proxy_cache_bypass $http_upgrade;' \
    '    }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
