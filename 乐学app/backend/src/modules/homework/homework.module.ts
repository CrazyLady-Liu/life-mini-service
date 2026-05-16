import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homework } from './homework.entity';
import { HomeworkSubmission } from './homework-submission.entity';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Homework, HomeworkSubmission]),
    StudentModule,
  ],
  providers: [HomeworkService],
  controllers: [HomeworkController],
  exports: [HomeworkService],
})
export class HomeworkModule {}
