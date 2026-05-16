import { http } from '@/utils/request';

export const authApi = {
  login: (data: { username: string; password: string }) => {
    return http.post<any>('/auth/login', data, false);
  },
  register: (data: any) => {
    return http.post<any>('/auth/register', data, false);
  },
};
