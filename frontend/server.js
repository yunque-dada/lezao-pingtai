const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'https://lezao-pingtai-houduan-production.up.railway.app';

// 代理API请求到后端
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true
}));

// 代理auth请求到后端
app.use('/auth', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true
}));

// 代理scratch3-master请求到后端
app.use('/scratch3-master', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true
}));

// 提供静态文件
app.use(express.static(path.join(__dirname, 'build')));

// 所有其他请求返回index.html（支持React Router）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});
