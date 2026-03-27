import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const csrfTokens: Map<string, { token: string; expires: number }> = new Map();

const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const CSRF_TOKEN_EXPIRY = 3600000; // 1 hour

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(req.method)) {
    const existingToken = req.cookies?.csrfToken;
    
    if (!existingToken || !csrfTokens.has(existingToken)) {
      const token = generateToken();
      csrfTokens.set(token, { token, expires: Date.now() + CSRF_TOKEN_EXPIRY });
      
      res.cookie('csrfToken', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_TOKEN_EXPIRY,
      });
      
      res.locals.csrfToken = token;
    } else {
      res.locals.csrfToken = existingToken;
    }
    
    return next();
  }
  
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'] || req.body?._csrf;
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF令牌缺失',
    });
  }
  
  const storedToken = csrfTokens.get(cookieToken);
  
  if (!storedToken || storedToken.token !== headerToken || storedToken.expires < Date.now()) {
    return res.status(403).json({
      success: false,
      message: 'CSRF令牌无效或已过期',
    });
  }
  
  next();
};

export const getCsrfToken = (req: Request, res: Response) => {
  const token = res.locals.csrfToken || generateToken();
  
  csrfTokens.set(token, { token, expires: Date.now() + CSRF_TOKEN_EXPIRY });
  
  res.cookie('csrfToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
  });
  
  res.json({
    success: true,
    csrfToken: token,
  });
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 60000);

export default csrfProtection;
