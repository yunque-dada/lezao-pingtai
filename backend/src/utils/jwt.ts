import * as jwt from 'jsonwebtoken';

export interface IJwtPayload {
  id: string;
  role: string;
  username: string;
}

const generateToken = (payload: IJwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt as any).sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string): IJwtPayload | null => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  try {
    return jwt.verify(token, secret) as IJwtPayload;
  } catch {
    return null;
  }
};

export { generateToken, verifyToken };
