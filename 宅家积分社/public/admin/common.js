// API基础地址
const API_BASE = '/api';

// 工具函数：显示提示
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
    }
    
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    toastEl.className = `toast ${type} show`;
    
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// 工具函数：存储token
function saveAuthData(token, user) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
}

// 工具函数：获取token
function getToken() {
    return localStorage.getItem('admin_token');
}

// 工具函数：获取用户信息
function getUser() {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
}

// 工具函数：清除认证
function clearAuth() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
}

// 工具函数：API请求
async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }
        
        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 检查登录状态
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// 退出登录
function logout() {
    clearAuth();
    window.location.href = 'index.html';
}

// 渲染用户信息
function renderUserInfo() {
    const user = getUser();
    if (!user) return;
    
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-detail .name');
    const userRole = document.querySelector('.user-detail .role');
    
    if (userAvatar) {
        userAvatar.textContent = user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U';
    }
    if (userName) {
        userName.textContent = user.nickname || user.username || '用户';
    }
    if (userRole) {
        userRole.textContent = user.role === 'admin' ? '管理员' : '普通用户';
    }
}

// 初始化侧边栏导航
function initSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = window.location.pathname.split('/').pop();
    
    navItems.forEach(item => {
        const page = item.dataset.page;
        if (page === currentPage || (currentPage === 'dashboard.html' && page === 'dashboard')) {
            item.classList.add('active');
        }
        
        item.addEventListener('click', () => {
            window.location.href = `${page}.html`;
        });
    });
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 初始化管理后台页面
function initAdminPage() {
    if (!checkAuth()) return;
    renderUserInfo();
    initSidebar();
}
