import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { HomeworkSubmission } from './homework-submission.entity';

export enum HomeworkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

export enum HomeworkType {
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  SPEAKING = 'speaking',
  MIXED = 'mixed',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('homeworks')
export class Homework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({
    type: 'enum',
    enum: HomeworkType,
    default: HomeworkType.MIXED,
  })
  type: HomeworkType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficulty: DifficultyLevel;

  @Column({
    type: 'enum',
    enum: HomeworkStatus,
    default: HomeworkStatus.DRAFT,
  })
  status: HomeworkStatus;

  @Column({ type: 'json', nullable: true })
  questions: Question[];

  @Column({ type: 'simple-array', nullable: true })
  studentIds: string[];

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'boolean', default: true })
  autoGenerate: boolean;

  @Column({ type: 'int', default: 0 })
  questionCount: number;

  @Column({ type: 'int', nullable: true })
  grade: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject: string;

  @OneToMany(() => HomeworkSubmission, submission => submission.homework)
  submissions: HomeworkSubmission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'fill' | 'short' | 'listening';
  content: string;
  options?: string[];
  answer: string | string[];
  score: number;
  audioUrl?: string;
  explanation?: string;
}
