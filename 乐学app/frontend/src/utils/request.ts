const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  needAuth?: boolean;
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    const header = {
      'Content-Type': 'application/json',
      ...options.header,
    };

    if (options.needAuth !== false && token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res: any) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          uni.reLaunch({ url: '/pages/login/login' });
          reject(res);
        } else {
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

export const http = {
  get: <T = any>(url: string, data?: any, needAuth = true) =>
    request<T>({ url, method: 'GET', data, needAuth }),
  post: <T = any>(url: string, data?: any, needAuth = true) =>
    request<T>({ url, method: 'POST', data, needAuth }),
  put: <T = any>(url: string, data?: any, needAuth = true) =>
    request<T>({ url, method: 'PUT', data, needAuth }),
  delete: <T = any>(url: string, data?: any, needAuth = true) =>
    request<T>({ url, method: 'DELETE', data, needAuth }),
};
