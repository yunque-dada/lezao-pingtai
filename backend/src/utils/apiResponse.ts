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
  data: T,
  message?: string,
  meta?: ApiResponse['meta']
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) response.message = message;
  if (meta) response.meta = meta;

  return res.status(200).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message?: string
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) response.message = message;

  return res.status(201).json(response);
};

export const badRequestResponse = (
  res: Response,
  message: string = '请求参数错误'
) => {
  return res.status(400).json({
    success: false,
    error: { message },
  });
};

export const unauthorizedResponse = (
  res: Response,
  message: string = '未授权访问'
) => {
  return res.status(401).json({
    success: false,
    error: { message },
  });
};

export const forbiddenResponse = (
  res: Response,
  message: string = '权限不足'
) => {
  return res.status(403).json({
    success: false,
    error: { message },
  });
};

export const notFoundResponse = (
  res: Response,
  message: string = '资源不存在'
) => {
  return res.status(404).json({
    success: false,
    error: { message },
  });
};

export const serverErrorResponse = (
  res: Response,
  message: string = '服务器内部错误'
) => {
  return res.status(500).json({
    success: false,
    error: { message },
  });
};

export const noContentResponse = (res: Response) => {
  return res.status(204).send();
};

export default {
  success: successResponse,
  created: createdResponse,
  badRequest: badRequestResponse,
  unauthorized: unauthorizedResponse,
  forbidden: forbiddenResponse,
  notFound: notFoundResponse,
  serverError: serverErrorResponse,
  noContent: noContentResponse,
};
