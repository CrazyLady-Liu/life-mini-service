# 随手记账

一个简单易用的个人财务管理应用，支持收支记录、预算管理、数据统计和账单导出功能。

## 功能特性

- **日常收支记录** - 添加、编辑、删除收入和支出记录，支持多种分类
- **预算管控** - 为各消费分类设置月度预算，实时查看预算使用情况
- **月度数据统计** - 可视化图表展示收支构成和分类统计
- **账单导出** - 支持导出月度账单为 CSV 格式

## 技术栈

### 后端
- Node.js + Express
- Better-SQLite3 (轻量级本地数据库)

### 前端
- Vue 3
- Vue Router
- ECharts (数据可视化)
- Vite (构建工具)
- Axios (HTTP 客户端)
- Day.js (日期处理)

## 项目结构

```
随手记账/
├── backend/
│   ├── models/           # 数据模型
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/           # API 路由
│   │   ├── transactions.js
│   │   └── budgets.js
│   ├── utils/            # 工具函数
│   │   └── database.js
│   ├── package.json
│   └── server.js         # 后端入口
├── frontend/
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   │   ├── TransactionList.vue
│   │   │   ├── BudgetManagement.vue
│   │   │   └── DataStatistics.vue
│   │   ├── api/          # API 服务
│   │   │   └── index.js
│   │   ├── utils/        # 工具函数
│   │   │   └── index.js
│   │   ├── router/       # 路由配置
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json
└── README.md
```

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 或者分别安装后端和前端依赖
cd backend
npm install

cd ../frontend
npm install
```

### 启动项目

```bash
# 启动后端服务 (端口 3000)
cd backend
npm run dev

# 启动前端服务 (端口 5173)
cd ../frontend
npm run dev
```

访问 http://localhost:5173 即可使用应用。

## 功能说明

### 1. 收支记录
- 支持按月份查看记录
- 支持添加收入和支出记录
- 支持编辑和删除记录
- 支持导出 CSV 文件

### 2. 预算管控
- 为不同消费分类设置月度预算
- 实时查看已消费金额和剩余预算
- 预算进度条根据使用情况显示不同颜色

### 3. 数据统计
- 饼图展示收支构成
- 柱状图展示各分类的收入和支出情况
- 支持按月份切换查看统计数据

## 数据存储

使用 SQLite 本地数据库，数据文件存储在 `backend/data/` 目录下，首次运行会自动创建。
