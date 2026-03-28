// 设置环境变量默认值
const setDefaultEnvVars = (): void => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
  
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'railway-default-secret-key-change-in-production';
  }
  
  if (!process.env.JWT_EXPIRE) {
    process.env.JWT_EXPIRE = '7d';
  }
  
  if (!process.env.REDIS_HOST) {
    process.env.REDIS_HOST = 'localhost';
  }
  
  if (!process.env.REDIS_PORT) {
    process.env.REDIS_PORT = '6379';
  }
  
  if (!process.env.CLIENT_URL) {
    process.env.CLIENT_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';
  }
  
  if (!process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN = process.env.CLIENT_URL || 'http://localhost:3000';
  }
};

const validateEnv = (): void => {
  // 设置默认值
  setDefaultEnvVars();
  
  // 只检查最关键的环境变量
  const criticalEnvVars = ['MONGODB_URI'];
  const missingVars: string[] = [];

  criticalEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('缺少必要的环境变量:');
    missingVars.forEach((varName) => {
      console.error(`  - ${varName}`);
    });
    process.exit(1);
  }

  console.log('环境变量验证通过');
};

export default validateEnv;
