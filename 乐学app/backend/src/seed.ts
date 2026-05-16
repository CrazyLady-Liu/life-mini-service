import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './modules/user/user.service';
import { UserRole } from './common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  console.log('开始初始化数据...');

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
    } else {
      console.log('ℹ️  教师账号已存在');
    }

    const student1 = await userService.findByUsername('student');
    if (!student1) {
      await userService.create({
        username: 'student',
        password: '123456',
        name: '小明',
        role: UserRole.STUDENT,
        phone: '13800138002',
        email: 'student@lexue.com',
      });
      console.log('✅ 学生账号创建成功: student / 123456');
    } else {
      console.log('ℹ️  学生账号已存在');
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
      console.log('✅ 学生账号2创建成功: student2 / 123456');
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
      console.log('✅ 学生账号3创建成功: student3 / 123456');
    }

    console.log('\n🎉 数据初始化完成！');
    console.log('\n📋 可用账号:');
    console.log('   👨‍🏫 教师: teacher / 123456');
    console.log('   👨‍🎓 学生1: student / 123456 (小明)');
    console.log('   👩‍🎓 学生2: student2 / 123456 (小红)');
    console.log('   👨‍🎓 学生3: student3 / 123456 (小刚)');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
  }

  await app.close();
}

bootstrap();
