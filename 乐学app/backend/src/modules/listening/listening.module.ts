import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListeningMaterial } from './listening-material.entity';
import { ListeningPractice } from './listening-practice.entity';
import { ListeningService } from './listening.service';
import { ListeningController } from './listening.controller';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListeningMaterial, ListeningPractice]),
    StudentModule,
  ],
  providers: [ListeningService],
  controllers: [ListeningController],
  exports: [ListeningService],
})
export class ListeningModule {}
