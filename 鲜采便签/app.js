const Storage = {
    KEYS: {
        USER: 'fresh_note_user',
        ITEMS: 'fresh_note_items',
        HISTORY: 'fresh_note_history'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};

const App = {
    user: null,
    items: [],
    history: [],
    currentCategory: '全部',
    codeTimer: null,
    codeCountdown: 0,

    init() {
        this.user = Storage.get(Storage.KEYS.USER);
        this.items = Storage.get(Storage.KEYS.ITEMS) || [];
        this.history = Storage.get(Storage.KEYS.HISTORY) || [];
        
        this.bindEvents();
        
        if (this.user) {
            this.showMainPage();
        } else {
            this.showLoginPage();
        }
    },

    bindEvents() {
        document.getElementById('sendCodeBtn').addEventListener('click', () => this.sendCode());
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.page));
        });
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.currentTarget.dataset.category));
        });
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('backToProfile').addEventListener('click', () => this.showProfile());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearList());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    },

    sendCode() {
        const phone = document.getElementById('phone').value.trim();
        if (!/^1\d{10}$/.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }

        if (this.codeCountdown > 0) return;

        this.codeCountdown = 60;
        const btn = document.getElementById('sendCodeBtn');
        btn.disabled = true;
        
        this.codeTimer = setInterval(() => {
            this.codeCountdown--;
            btn.textContent = this.codeCountdown + 's';
            if (this.codeCountdown <= 0) {
                clearInterval(this.codeTimer);
                btn.disabled = false;
                btn.textContent = '获取验证码';
            }
        }, 1000);

        alert('验证码已发送（测试用，任意6位数字均可）');
    },

    login() {
        const phone = document.getElementById('phone').value.trim();
        const code = document.getElementById('code').value.trim();

        if (!/^1\d{10}$/.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        if (!code || code.length < 4) {
            alert('请输入验证码');
            return;
        }

        this.user = { phone };
        Storage.set(Storage.KEYS.USER, this.user);
        this.showMainPage();
    },

    logout() {
        if (!confirm('确定要退出登录吗？')) return;
        
        Storage.remove(Storage.KEYS.USER);
        this.user = null;
        this.showLoginPage();
    },

    showLoginPage() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('mainPage').classList.add('hidden');
    },

    showMainPage() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainPage').classList.remove('hidden');
        document.getElementById('userPhone').textContent = this.user?.phone || '';
        this.renderList();
    },

    switchTab(page) {
        document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.tab-item[data-page="${page}"]`).classList.add('active');

        document.getElementById('listPage').classList.add('hidden');
        document.getElementById('categoryPage').classList.add('hidden');
        document.getElementById('profilePage').classList.add('hidden');
        document.getElementById('historyPage').classList.add('hidden');

        const titles = { list: '买菜清单', category: '分类筛选', profile: '个人中心' };
        document.getElementById('pageTitle').textContent = titles[page] || '鲜采便签';

        if (page === 'list') {
            document.getElementById('listPage').classList.remove('hidden');
            this.renderList();
        } else if (page === 'category') {
            document.getElementById('categoryPage').classList.remove('hidden');
            this.renderCategoryList();
        } else if (page === 'profile') {
            document.getElementById('profilePage').classList.remove('hidden');
        }
    },

    addItem() {
        const name = document.getElementById('itemName').value.trim();
        const quantity = document.getElementById('itemQuantity').value.trim() || '1';
        const category = document.getElementById('itemCategory').value;

        if (!name) {
            alert('请输入物品名称');
            return;
        }

        const item = {
            id: Date.now(),
            name,
            quantity,
            category,
            purchased: false,
            createTime: new Date().toISOString()
        };

        this.items.push(item);
        Storage.set(Storage.KEYS.ITEMS, this.items);
        
        document.getElementById('itemName').value = '';
        document.getElementById('itemQuantity').value = '';
        
        this.renderList();
        this.renderCategoryList();
    },

    togglePurchased(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.purchased = !item.purchased;
            Storage.set(Storage.KEYS.ITEMS, this.items);
            this.renderList();
            this.renderCategoryList();
        }
    },

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        Storage.set(Storage.KEYS.ITEMS, this.items);
        this.renderList();
        this.renderCategoryList();
    },

    renderList() {
        const pendingList = document.getElementById('pendingList');
        const purchasedList = document.getElementById('purchasedList');

        const pendingItems = this.items.filter(i => !i.purchased);
        const purchasedItems = this.items.filter(i => i.purchased);

        pendingList.innerHTML = pendingItems.length ? pendingItems.map(item => this.renderItem(item)).join('') : '<div style="padding:20px;text-align:center;color:#999">暂无待买物品</div>';
        purchasedList.innerHTML = purchasedItems.length ? purchasedItems.map(item => this.renderItem(item)).join('') : '<div style="padding:20px;text-align:center;color:#999">暂无已买物品</div>';

        pendingList.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => this.togglePurchased(parseInt(e.target.dataset.id)));
        });
        purchasedList.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => this.togglePurchased(parseInt(e.target.dataset.id)));
        });
        pendingList.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteItem(parseInt(e.target.dataset.id)));
        });
        purchasedList.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteItem(parseInt(e.target.dataset.id)));
        });
    },

    renderItem(item) {
        return `
            <div class="item ${item.purchased ? 'purchased' : ''}">
                <input type="checkbox" class="item-checkbox" ${item.purchased ? 'checked' : ''} data-id="${item.id}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span class="item-category">${item.category}</span>
                        <span>x${item.quantity}</span>
                    </div>
                </div>
                <button class="item-delete" data-id="${item.id}">删除</button>
            </div>
        `;
    },

    filterByCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.category-btn[data-category="${category}"]`).classList.add('active');
        this.renderCategoryList();
    },

    renderCategoryList() {
        const categoryList = document.getElementById('categoryList');
        let filteredItems = this.items;
        if (this.currentCategory !== '全部') {
            filteredItems = this.items.filter(i => i.category === this.currentCategory);
        }

        if (filteredItems.length === 0) {
            categoryList.innerHTML = '<div style="padding:20px;text-align:center;color:#999">暂无物品</div>';
            return;
        }

        categoryList.innerHTML = `
            <div class="item-list">
                ${filteredItems.map(item => this.renderItem(item)).join('')}
            </div>
        `;

        categoryList.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => this.togglePurchased(parseInt(e.target.dataset.id)));
        });
        categoryList.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteItem(parseInt(e.target.dataset.id)));
        });
    },

    clearList() {
        if (!this.items.length) {
            alert('清单已经是空的了');
            return;
        }
        if (!confirm('确定要清空当前清单吗？已购物品将保存到历史记录')) return;

        const purchasedItems = this.items.filter(i => i.purchased);
        if (purchasedItems.length > 0) {
            this.history.unshift({
                id: Date.now(),
                date: new Date().toLocaleString(),
                items: purchasedItems
            });
            Storage.set(Storage.KEYS.HISTORY, this.history);
        }

        this.items = [];
        Storage.set(Storage.KEYS.ITEMS, this.items);
        this.renderList();
        this.renderCategoryList();
        alert('清单已清空');
    },

    showHistory() {
        document.getElementById('profilePage').classList.add('hidden');
        document.getElementById('historyPage').classList.remove('hidden');
        document.getElementById('pageTitle').textContent = '历史清单';
        this.renderHistory();
    },

    showProfile() {
        document.getElementById('historyPage').classList.add('hidden');
        document.getElementById('profilePage').classList.remove('hidden');
        document.getElementById('pageTitle').textContent = '个人中心';
    },

    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="padding:20px;text-align:center;color:#999">暂无历史记录</div>';
            return;
        }

        historyList.innerHTML = this.history.map(h => `
            <div class="history-item">
                <div class="history-date">${h.date}</div>
                <div class="history-items">
                    ${h.items.map(i => `${i.name} x${i.quantity}`).join('、')}
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());