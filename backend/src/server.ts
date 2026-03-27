import { createServer } from 'http';
import app from './app';
import connectDB from './config/database';
import createInitialData from './utils/initData';
import validateEnv from './config/validateEnv';
import { initializeSocket } from './socket';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();
    
    await connectDB();
    
    await createInitialData();
    
    // 创建HTTP服务器
    const httpServer = createServer(app);
    
    // 初始化Socket.io
    initializeSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`访问地址: http://localhost:${PORT}`);
      console.log(`WebSocket服务已启动`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
