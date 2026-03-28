// 必需的环境变量
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
];

// 可选的环境变量（有默认值）
const optionalEnvVars = [
  { name: 'JWT_EXPIRE', defaultValue: '7d' },
  { name: 'REDIS_HOST', defaultValue: 'localhost' },
  { name: 'REDIS_PORT', defaultValue: '6379' },
];

const validateEnv = (): void => {
  const missingVars: string[] = [];

  // 检查必需的环境变量
  requiredEnvVars.forEach((varName) => {
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

  // 为可选的环境变量设置默认值
  optionalEnvVars.forEach(({ name, defaultValue }) => {
    if (!process.env[name]) {
      process.env[name] = defaultValue;
      console.log(`环境变量 ${name} 未设置，使用默认值: ${defaultValue}`);
    }
  });

  console.log('环境变量验证通过');
};

export default validateEnv;
