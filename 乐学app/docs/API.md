# API 接口文档

## 基础信息
- Base URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 数据格式: JSON

## 认证接口

### 登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "teacher",
  "password": "123456"
}
```

### 注册
```
POST /auth/register
Content-Type: application/json

{
  "username": "student1",
  "password": "123456",
  "name": "张三",
  "role": "student"
}
```

## 用户接口

### 获取当前用户信息
```
GET /users/profile
Authorization: Bearer {token}
```

### 更新用户信息
```
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "新名字",
  "phone": "13800138000"
}
```

### 修改密码
```
POST /users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

## 学生档案接口

### 获取学生列表
```
GET /students/profiles
Authorization: Bearer {token}
```

### 获取学生详情
```
GET /students/profiles/{studentId}
Authorization: Bearer {token}
```

### 创建学生档案
```
POST /students/profiles
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "uuid",
  "grade": 3,
  "className": "1班",
  "strengths": "听力好",
  "weaknesses": "写作需要加强"
}
```

### 添加学生记录
```
POST /students/records
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "uuid",
  "type": "academic",
  "title": "单元测试",
  "content": "本次考试成绩优秀",
  "score": 95
}
```

## 作业接口

### 创建作业
```
POST /homeworks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "第一单元练习",
  "type": "mixed",
  "difficulty": "medium",
  "autoGenerate": true,
  "questionCount": 10,
  "duration": 30
}
```

### 发布作业
```
POST /homeworks/{id}/publish
Authorization: Bearer {token}
```

### 获取作业列表
```
GET /homeworks
Authorization: Bearer {token}
```

### 学生获取作业列表
```
GET /homeworks/student/my
Authorization: Bearer {token}
```

### 开始做作业
```
POST /homeworks/submissions/{id}/start
Authorization: Bearer {token}
```

### 提交作业
```
POST /homeworks/submissions/{id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "uuid",
      "answer": "A"
    }
  ],
  "timeSpent": 1200
}
```

## 听力接口

### 获取听力材料列表
```
GET /listening/materials
Authorization: Bearer {token}
```

### 上传听力材料
```
POST /listening/materials
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "听力材料1",
  "audioUrl": "/audio/1.mp3",
  "category": "conversation",
  "level": "intermediate",
  "duration": 120
}
```

### 开始听力练习
```
POST /listening/materials/{id}/practice
Authorization: Bearer {token}
```

### 提交听力练习
```
POST /listening/practices/{id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [...],
  "totalListenTime": 300,
  "playCount": 3,
  "playbackSpeed": 1.0
}
```

## 分析接口

### 获取班级分析
```
GET /analysis/class
Authorization: Bearer {token}
```

### 获取学生分析报告
```
GET /analysis/student/{studentId}
Authorization: Bearer {token}
```

### 学生获取自己的分析报告
```
GET /analysis/my
Authorization: Bearer {token}
```

## 错误响应格式
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 成功响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```
