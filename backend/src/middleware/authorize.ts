import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { forbiddenResponse } from '../utils/response';

const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return forbiddenResponse(res, '没有权限执行此操作');
    }
    next();
  };
};

export default authorize;
