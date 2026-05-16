import { ApiResponse } from '../interfaces/api-response.interface';

export function success<T = any>(data: T, message = '操作成功'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
  };
}

export function error(code: number, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
  };
}
