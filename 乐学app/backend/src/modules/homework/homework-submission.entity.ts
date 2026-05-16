import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Homework } from './homework.entity';

export enum SubmissionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity('homework_submissions')
export class HomeworkSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  homeworkId: string;

  @ManyToOne(() => Homework, homework => homework.submissions)
  @JoinColumn({ name: 'homeworkId' })
  homework: Homework;

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.NOT_STARTED,
  })
  status: SubmissionStatus;

  @Column({ type: 'json', nullable: true })
  answers: StudentAnswer[];

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracy: number;

  @Column({ type: 'int', default: 0 })
  timeSpent: number;

  @Column({ type: 'text', nullable: true })
  teacherComment: string;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  submittedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  gradedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
  timeSpent?: number;
}
