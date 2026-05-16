# 乐学App - 智能教育平台

一个功能完备的在线教育平台，包含教师端和学生端，支持作业自动生成、在线完成、听力训练、学生档案管理等核心功能。

## 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: MySQL + TypeORM
- **缓存**: Redis
- **认证**: JWT
- **文件存储**: 本地/OSS

### 前端
- **框架**: uni-app + Vue3 + TypeScript
- **UI组件**: uView Plus
- **状态管理**: Pinia
- **打包**: 支持微信小程序、H5、Android/iOS App

## 项目结构

```
乐学app/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── common/         # 公共模块
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── student/    # 学生档案模块
│   │   │   ├── homework/   # 作业模块
│   │   │   ├── listening/  # 听力模块
│   │   │   └── analysis/   # 学习分析模块
│   │   └── main.ts
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── pages/          # 页面
│   │   │   ├── teacher/    # 教师端页面
│   │   │   └── student/    # 学生端页面
│   │   ├── components/     # 组件
│   │   ├── api/            # 接口请求
│   │   ├── store/          # 状态管理
│   │   └── utils/          # 工具函数
│   └── package.json
└── docs/                   # 文档
```

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm run start:dev
```

### 前端启动
```bash
cd frontend
npm install
npm run dev:mp-weixin  # 微信小程序
npm run dev:h5         # H5
npm run dev:app        # App
```

## 核心功能

### 教师端
- 👥 学生管理：查看所有学生，建立学生档案
- 📝 作业管理：自动生成作业，查看完成情况
- 🎧 听力管理：上传听力材料，创建听力练习
- 📊 学习分析：查看学生学习情况，分析优缺点
- 📁 档案管理：学生个人档案，历史记录查阅

### 学生端
- 📚 作业中心：查看并完成作业
- 🎧 听力训练：在线听力练习，支持倍速播放
- 📊 我的成绩：查看个人学习报告
- 👤 个人中心：个人信息管理

## 许可证

MIT License
