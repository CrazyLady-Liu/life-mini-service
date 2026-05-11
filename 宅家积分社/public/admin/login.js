// API基础地址
const API_BASE = '/api';

// 工具函数：显示提示
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
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

// 标签切换
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
let currentTab = 'username';

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        currentTab = tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab}-form`).classList.add('active');
    });
});

// 发送验证码
let countdown = 0;
const sendCodeBtn = document.getElementById('sendCodeBtn');

sendCodeBtn.addEventListener('click', async () => {
    if (countdown > 0) return;
    
    const phone = document.getElementById('phone').value;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        showToast('请输入正确的手机号', 'error');
        return;
    }
    
    try {
        await apiRequest('/users/send-code', {
            method: 'POST',
            body: JSON.stringify({ phone, type: 'login' })
        });
        
        showToast('验证码已发送（查看控制台）', 'success');
        
        // 开始倒计时
        countdown = 60;
        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = `${countdown}s`;
        
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                sendCodeBtn.disabled = false;
                sendCodeBtn.textContent = '发送验证码';
            } else {
                sendCodeBtn.textContent = `${countdown}s`;
            }
        }, 1000);
    } catch (error) {
        showToast(error.message || '发送验证码失败', 'error');
    }
});

// 登录表单
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    
    try {
        let loginData;
        
        if (currentTab === 'username') {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            loginData = {
                loginType: 'username',
                username,
                password
            };
        } else {
            const phone = document.getElementById('phone').value;
            const code = document.getElementById('code').value;
            
            loginData = {
                loginType: 'phone',
                phone,
                code
            };
        }
        
        const result = await apiRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        saveAuthData(result.data.token, result.data.user);
        showToast('登录成功！', 'success');
        
        // 跳转到管理后台首页
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        showToast(error.message || '登录失败', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
});

// 注册链接
document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    
    const username = prompt('请输入用户名：');
    if (!username) return;
    
    const password = prompt('请输入密码（至少6位）：');
    if (!password || password.length < 6) {
        alert('密码至少6位');
        return;
    }
    
    const nickname = prompt('请输入昵称（可选）：') || username;
    
    apiRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, nickname })
    }).then(result => {
        saveAuthData(result.data.token, result.data.user);
        showToast('注册成功！', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }).catch(error => {
        showToast(error.message || '注册失败', 'error');
    });
});

// 检查是否已登录
function checkAuth() {
    const token = getToken();
    if (token) {
        // 简单验证token
        window.location.href = 'dashboard.html';
    }
}

// 页面加载时检查
checkAuth();
