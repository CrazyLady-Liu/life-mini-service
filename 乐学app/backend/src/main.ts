import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { UserService } from './modules/user/user.service';
import { UserRole } from './common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('乐学App API')
    .setDescription('乐学App后端接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const userService = app.get(UserService);
  await initDefaultUsers(userService);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🎉 乐学App后端服务已启动: http://localhost:${port}`);
  console.log(`📚 API文档: http://localhost:${port}/docs`);
  console.log(`\n📋 可用账号:`);
  console.log(`   👨‍🏫 教师: teacher / 123456`);
  console.log(`   👨‍🎓 学生1: student / 123456`);
  console.log(`   👩‍🎓 学生2: student2 / 123456`);
  console.log(`   👨‍🎓 学生3: student3 / 123456`);
  console.log(`\n🚀 现在可以启动前端小程序了！`);
}

async function initDefaultUsers(userService: UserService) {
  try {
    const teacher = await userService.findByUsername('teacher');
    if (!teacher) {
      await userService.create({
        username: 'teacher',
        password: '123456',
        name: '张老师',
        role: UserRole.TEACHER,
        phone: '13800138001',
        email: 'teacher@lexue.com',
      });
      console.log('✅ 教师账号创建成功: teacher / 123456');
    }

    const student1 = await userService.findByUsername('student');
    if (!student1) {
      await userService.create({
        username: 'student',
        password: '123456',
        name: '小明',
        role: UserRole.STUDENT,
        phone: '13800138002',
      });
      console.log('✅ 学生账号创建成功: student / 123456');
    }

    const student2 = await userService.findByUsername('student2');
    if (!student2) {
      await userService.create({
        username: 'student2',
        password: '123456',
        name: '小红',
        role: UserRole.STUDENT,
        phone: '13800138003',
      });
      console.log('✅ 学生账号创建成功: student2 / 123456');
    }

    const student3 = await userService.findByUsername('student3');
    if (!student3) {
      await userService.create({
        username: 'student3',
        password: '123456',
        name: '小刚',
        role: UserRole.STUDENT,
        phone: '13800138004',
      });
      console.log('✅ 学生账号创建成功: student3 / 123456');
    }
  } catch (error) {
    console.log('ℹ️  账号已存在，跳过初始化');
  }
}

bootstrap();
