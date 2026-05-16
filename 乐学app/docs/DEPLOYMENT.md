# 部署指南

## 后端部署

### 1. 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7
- Redis >= 5.0

### 2. 安装依赖
```bash
cd backend
npm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```bash
cp .env.example .env
```

### 4. 启动服务
```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

### 5. PM2 部署（推荐）
```bash
npm install -g pm2
pm2 start dist/main.js --name lexue-backend
```

## 前端部署

### H5 部署
```bash
cd frontend
npm install
npm run build:h5
```
将 `dist/build/h5` 目录部署到静态服务器。

### 微信小程序部署
```bash
cd frontend
npm install
npm run build:mp-weixin
```
使用微信开发者工具打开 `dist/build/mp-weixin` 目录，上传代码。

### App 打包
```bash
cd frontend
npm install
npm run build:app
```
使用 HBuilderX 打开项目，云打包或离线打包生成 Android/iOS 安装包。

## Docker 部署

### 后端 Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: lexue
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    environment:
      DB_HOST: mysql
      REDIS_HOST: redis

volumes:
  mysql-data:
```
