const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理 scratch3-master 静态资源
  app.use(
    '/scratch3-master',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
