import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(
  res: Response,
  message: string,
  data: T
) => {
  return successResponse(res, message, data, 201);
};

export const badRequestResponse = (
  res: Response,
  message: string = '请求参数错误'
) => {
  return res.status(400).json({
    success: false,
    message,
  });
};

export const unauthorizedResponse = (
  res: Response,
  message: string = '未授权访问'
) => {
  return res.status(401).json({
    success: false,
    message,
  });
};

export const forbiddenResponse = (
  res: Response,
  message: string = '权限不足'
) => {
  return res.status(403).json({
    success: false,
    message,
  });
};

export const notFoundResponse = (
  res: Response,
  message: string = '资源不存在'
) => {
  return res.status(404).json({
    success: false,
    message,
  });
};

export const serverErrorResponse = (
  res: Response,
  message: string = '服务器内部错误'
) => {
  return res.status(500).json({
    success: false,
    message,
  });
};

export const noContentResponse = (res: Response) => {
  return res.status(204).send();
};
