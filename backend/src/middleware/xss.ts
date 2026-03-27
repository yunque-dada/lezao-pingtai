import { Request, Response, NextFunction } from 'express';

const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
];

const sanitizeString = (str: string): string => {
  let sanitized = str;
  
  xssPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

export const xssSanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

export const xssSanitizeStrict = (req: Request, res: Response, next: NextFunction) => {
  const checkXSS = (obj: any, path: string = ''): boolean => {
    if (typeof obj === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(obj)) {
          return false;
        }
      }
    }
    
    if (Array.isArray(obj)) {
      return obj.every((item, index) => checkXSS(item, `${path}[${index}]`));
    }
    
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).every(key => checkXSS(obj[key], `${path}.${key}`));
    }
    
    return true;
  };
  
  if (!checkXSS(req.body) || !checkXSS(req.query) || !checkXSS(req.params)) {
    return res.status(400).json({
      success: false,
      message: '检测到潜在的XSS攻击',
    });
  }
  
  next();
};

export default xssSanitize;
