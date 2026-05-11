# 宅家积分社 - 微信小程序后端服务

基于 Node.js + Express + MySQL 构建的家务积分管理系统后端服务。

## 项目架构

```
宅家积分社/
├── src/
│   ├── app.js              # 应用入口
│   ├── config/
│   │   └── database.js     # 数据库配置
│   ├── models/             # 数据模型
│   ├── routes/             # 路由控制器
│   └── middleware/         # 中间件
├── public/                 # 静态文件
├── package.json
└── .env                    # 环境变量
```

## 功能模块

### 1. 用户模块
- 手机号验证码登录
- 账号密码登录
- 用户注册
- 密码设置/修改
- 用户信息管理

### 2. 家庭模块
- 创建家庭
- 邀请码加入家庭
- 成员审核管理

### 3. 家务任务模块
- 任务类型管理
- 创建和管理家务任务
- 设置任务周期（一次性/每日/每周/隔周/每月）
- 任务权重设置
- 难度标签（简单/中等/困难/非常困难）
- 任务时长设置
- 完成标准设置
- 提醒时间设置
- 支持批量添加家务任务
- 多条件筛选任务

### 4. 轮值分配模块
- 手动分配任务
- 自动轮值分配
- 轮值状态管理

### 5. 打卡积分模块
- 家务完成打卡
- 打卡审核
- 积分排行榜

### 6. 个人中心
- 统计数据
- 打卡历史
- 积分记录

### 7. 管理模块
- 任务类型配置
- 积分规则配置
- 成员权限管理
- 积分调整

## 数据库表

- users - 用户表
- families - 家庭表
- family_members - 家庭成员表
- task_types - 任务类型表
- housework_tasks - 家务任务表
- rotations - 轮值分配表
- checkin_records - 打卡记录表
- points_records - 积分记录表
- points_rules - 积分规则表
- verification_codes - 验证码表

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `.env` 文件中的数据库配置：

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=life_mini_db
DB_USER=root
DB_PASSWORD=your_password
```

### 3. 启动服务

```bash
npm run dev
```

服务将在 http://localhost:3000 启动

## API 接口

### 用户相关
- `POST /api/users/send-code` - 发送验证码
- `POST /api/users/login` - 登录（支持验证码和账号密码两种方式）
- `POST /api/users/register` - 用户注册
- `PUT /api/users/password` - 设置/修改密码
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

#### 登录接口参数
```json
{
  "loginType": "phone", // 或 "username"
  "phone": "13800138000",
  "code": "123456"
}

// 或

{
  "loginType": "username",
  "username": "zhangsan",
  "password": "123456"
}
```

### 家庭相关
- `POST /api/family/create` - 创建家庭
- `POST /api/family/join` - 加入家庭
- `GET /api/family/my` - 获取我的家庭
- `GET /api/family/pending` - 待审核成员
- `POST /api/family/approve/:memberId` - 审核通过
- `POST /api/family/reject/:memberId` - 审核拒绝
- `PUT /api/family/refresh-code` - 刷新邀请码

### 任务相关
- `POST /api/tasks/types` - 创建任务类型
- `GET /api/tasks/types` - 获取任务类型列表
- `POST /api/tasks` - 创建任务
- `POST /api/tasks/batch` - 批量创建任务
- `GET /api/tasks` - 获取任务列表（支持按类型、难度、周期、状态筛选）
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

#### 创建任务接口参数
```json
{
  "name": "扫地",
  "taskTypeId": 1,
  "description": "打扫客厅",
  "cycleType": "weekly",
  "cycleValue": "1,3,5",
  "cycleConfig": { "weekdays": [1, 3, 5] },
  "points": 10,
  "weight": 2,
  "difficulty": "medium",
  "tags": ["客厅", "日常"],
  "duration": 30,
  "standard": "无垃圾、地板干净",
  "requirement": "需要拍照",
  "reminderTime": "18:00",
  "reminderEnabled": true
}
```

#### 批量创建任务接口参数
```json
{
  "tasks": [
    {
      "name": "扫地",
      "taskTypeId": 1,
      "cycleType": "weekly",
      "points": 10
    },
    {
      "name": "洗碗",
      "taskTypeId": 2,
      "cycleType": "daily",
      "points": 5
    }
  ]
}
```

### 轮值相关
- `POST /api/rotation` - 创建轮值
- `GET /api/rotation` - 获取轮值列表
- `GET /api/rotation/my` - 我的轮值
- `PUT /api/rotation/:id/status` - 更新轮值状态
- `DELETE /api/rotation/:id` - 删除轮值
- `POST /api/rotation/auto-generate` - 自动生成轮值

### 打卡相关
- `POST /api/checkin` - 提交打卡
- `GET /api/checkin` - 获取打卡列表
- `GET /api/checkin/my` - 我的打卡
- `POST /api/checkin/:id/approve` - 审核通过
- `POST /api/checkin/:id/reject` - 审核拒绝

### 积分相关
- `GET /api/points/ranking` - 积分排行榜
- `GET /api/points/records` - 积分记录

### 个人中心
- `GET /api/profile/statistics` - 统计数据
- `GET /api/profile/checkin-history` - 打卡历史
- `GET /api/profile/points-history` - 积分历史

### 管理相关
- `GET /api/admin/dashboard` - 管理后台数据
- `POST /api/admin/task-types` - 创建任务类型
- `PUT /api/admin/task-types/:id` - 更新任务类型
- `DELETE /api/admin/task-types/:id` - 删除任务类型
- `POST /api/admin/points-rules` - 创建积分规则
- `PUT /api/admin/points-rules/:id` - 更新积分规则
- `DELETE /api/admin/points-rules/:id` - 删除积分规则
- `PUT /api/admin/members/:userId/role` - 修改成员角色
- `POST /api/admin/adjust-points` - 调整积分

## 技术栈

- Node.js
- Express
- MySQL
- Sequelize (ORM)
- JWT (身份认证)
- bcryptjs (密码加密)
- express-validator (参数验证)
- dayjs (日期处理)
