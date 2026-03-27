import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, message?: string, statusCode?: number) => void;
      error: (message: string, statusCode?: number, details?: any) => void;
      paginated: <T>(data: T[], page: number, limit: number, total: number) => void;
    }
  }
}

const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.success = <T>(data: T, message: string = '操作成功', statusCode: number = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message: string, statusCode: number = 500, details?: any) => {
    res.status(statusCode).json({
      success: false,
      message,
      ...(details && { details }),
    });
  };

  res.paginated = <T>(data: T[], page: number, limit: number, total: number) => {
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      message: '获取成功',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  };

  next();
};

export default responseMiddleware;
