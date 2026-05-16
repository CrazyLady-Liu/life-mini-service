import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkSubmission } from '../homework/homework-submission.entity';
import { Homework } from '../homework/homework.entity';
import { ListeningPractice } from '../listening/listening-practice.entity';
import { ListeningMaterial } from '../listening/listening-material.entity';
import { StudentProfile } from '../student/student-profile.entity';
import { StudentRecord } from '../student/student-record.entity';
import { User } from '../user/user.entity';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeworkSubmission,
      Homework,
      ListeningPractice,
      ListeningMaterial,
      StudentProfile,
      StudentRecord,
      User,
    ]),
  ],
  providers: [AnalysisService],
  controllers: [AnalysisController],
  exports: [AnalysisService],
})
export class AnalysisModule {}
