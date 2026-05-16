import { http } from '@/utils/request';
import { User, UserRole } from '@/types';

export const userApi = {
  getProfile: () => {
    return http.get<User>('/users/profile');
  },
  updateProfile: (data: any) => {
    return http.put<User>('/users/profile', data);
  },
  getUsers: (role?: UserRole) => {
    return http.get<User[]>('/users', { role });
  },
  getUser: (id: string) => {
    return http.get<User>(`/users/${id}`);
  },
  changePassword: (oldPassword: string, newPassword: string) => {
    return http.post('/users/change-password', { oldPassword, newPassword });
  },
};
