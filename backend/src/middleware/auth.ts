import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { verifyToken } from '../utils/jwt';
import { unauthorizedResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: any;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      // 支持从查询参数中获取token
      token = req.query.token as string;
    }

    if (!token) {
      return unauthorizedResponse(res, '请先登录');
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return unauthorizedResponse(res, '无效的认证令牌');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return unauthorizedResponse(res, '用户不存在');
    }

    if (user.status !== 'active') {
      return unauthorizedResponse(res, '账户已被禁用');
    }

    req.user = user;
    next();
  } catch {
    return unauthorizedResponse(res, '认证失败');
  }
};

export default auth;
