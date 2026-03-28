import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';
import responseMiddleware from './middleware/responseMiddleware';
import { securityHeaders, corsOptions } from './middleware/security';
import xssSanitize from './middleware/xss';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app: Application = express();

// 全局错误捕获 - 确保在任何错误情况下都返回JSON
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 暂时禁用 securityHeaders 中间件，解决跨源资源加载问题
// app.use(securityHeaders);
app.use(cors(corsOptions));
// 暂时禁用 Helmet 安全头，让 Scratch 编辑器可以正常加载资源
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   // 禁用X-Content-Type-Options，允许浏览器根据内容自动检测MIME类型
//   xContentTypeOptions: false,
// }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xssSanitize);
app.use(responseMiddleware);

// 提供完整的 scratch3-master 静态文件服务，优先提供 build 目录
app.use('/scratch3-master', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Type-Options');
  next();
}, express.static('../scratch3-master/build', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 提供 scratch3-master 根目录的静态文件（包括 static 目录下的原生素材）
app.use('/scratch3-master', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Type-Options');
  next();
}, express.static('../scratch3-master', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 提供 /static 路径的静态文件服务（直接映射到 scratch3-master/static）
app.use('/static', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Type-Options');
  next();
}, express.static('../scratch3-master/static', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 提供测试页面
app.use('/test', express.static('.'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '少儿编程课程平台API服务运行正常',
    version: '1.0.0',
    docs: '/api',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/', apiLimiter);

app.use('/api', routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.path,
  });
});

// 全局错误处理中间件 - 确保返回JSON格式
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express错误:', err);
  
  // 确保返回JSON而不是HTML
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use(errorHandler);

export default app;
