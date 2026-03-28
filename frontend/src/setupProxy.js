const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理 scratch3-master 静态资源
  app.use(
    '/scratch3-master',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    })
  );
  
  // 代理 API 请求
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    })
  );
};
