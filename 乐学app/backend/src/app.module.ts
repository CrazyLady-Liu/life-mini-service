import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StudentModule } from './modules/student/student.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { ListeningModule } from './modules/listening/listening.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './data/lexue.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    CommonModule,
    AuthModule,
    UserModule,
    StudentModule,
    HomeworkModule,
    ListeningModule,
    AnalysisModule,
  ],
})
export class AppModule {}
