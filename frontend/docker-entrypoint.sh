#!/bin/sh

BACKEND_URL=${BACKEND_URL:-http://localhost:5000}

if [ -z "$BACKEND_URL" ]; then
  echo "Error: BACKEND_URL is not set"
  exit 1
fi

if ! echo "$BACKEND_URL" | grep -qE "^https?://"; then
  BACKEND_URL="https://$BACKEND_URL"
fi

echo "Using BACKEND_URL: $BACKEND_URL"

# Generate nginx config
cat > /etc/nginx/conf.d/default.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass BACKEND_URL_PLACEHOLDER/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /scratch3-master {
        proxy_pass BACKEND_URL_PLACEHOLDER/scratch3-master;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Replace placeholder with actual URL
sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

cat /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"
