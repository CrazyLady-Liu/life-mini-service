import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserRole } from '@/types';
import { authApi } from '@/api/auth';
import { userApi } from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const userInfo = ref<any>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isTeacher = computed(() => userInfo.value?.role === UserRole.TEACHER || userInfo.value?.role === UserRole.ADMIN);
  const isStudent = computed(() => userInfo.value?.role === UserRole.STUDENT);

  async function login(username: string, password: string) {
    const res = await authApi.login({ username, password });
    token.value = res.token;
    userInfo.value = res.user;
    uni.setStorageSync('token', res.token);
    uni.setStorageSync('userInfo', res.user);
    return res;
  }

  async function register(data: any) {
    const res = await authApi.register(data);
    token.value = res.token;
    userInfo.value = res.user;
    uni.setStorageSync('token', res.token);
    uni.setStorageSync('userInfo', res.user);
    return res;
  }

  async function getProfile() {
    const res = await userApi.getProfile();
    userInfo.value = res;
    uni.setStorageSync('userInfo', res);
    return res;
  }

  function checkLogin() {
    const savedToken = uni.getStorageSync('token');
    const savedUser = uni.getStorageSync('userInfo');
    if (savedToken && savedUser) {
      token.value = savedToken;
      userInfo.value = savedUser;
    }
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.reLaunch({ url: '/pages/login/login' });
  }

  function redirectToHome() {
    if (isTeacher.value) {
      uni.switchTab({ url: '/pages/teacher/index/index' });
    } else {
      uni.switchTab({ url: '/pages/student/index/index' });
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isTeacher,
    isStudent,
    login,
    register,
    getProfile,
    checkLogin,
    logout,
    redirectToHome,
  };
});
