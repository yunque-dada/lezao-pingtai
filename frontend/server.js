const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 提供scratch3-master静态文件服务
app.use('/scratch3-master', express.static(path.join(__dirname, 'scratch3-master')));

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
