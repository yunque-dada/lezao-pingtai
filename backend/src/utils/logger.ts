import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const logToFile = (level: string, message: string): void => {
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  const logMessage = `[${getTimestamp()}] [${level}] ${message}\n`;
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('写入日志失败:', err);
  });
};

const logger = {
  info: (message: string): void => {
    const logMessage = `[INFO] ${message}`;
    console.log(`\x1b[36m${logMessage}\x1b[0m`);
    logToFile('INFO', message);
  },

  error: (message: string): void => {
    const logMessage = `[ERROR] ${message}`;
    console.error(`\x1b[31m${logMessage}\x1b[0m`);
    logToFile('ERROR', message);
  },

  warn: (message: string): void => {
    const logMessage = `[WARN] ${message}`;
    console.warn(`\x1b[33m${logMessage}\x1b[0m`);
    logToFile('WARN', message);
  },

  success: (message: string): void => {
    const logMessage = `[SUCCESS] ${message}`;
    console.log(`\x1b[32m${logMessage}\x1b[0m`);
    logToFile('SUCCESS', message);
  },
};

export default logger;
