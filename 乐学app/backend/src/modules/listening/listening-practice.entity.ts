import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { ListeningMaterial } from './listening-material.entity';

export enum PracticeStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('listening_practices')
export class ListeningPractice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  materialId: string;

  @ManyToOne(() => ListeningMaterial, material => material.practices)
  @JoinColumn({ name: 'materialId' })
  material: ListeningMaterial;

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({
    type: 'enum',
    enum: PracticeStatus,
    default: PracticeStatus.IN_PROGRESS,
  })
  status: PracticeStatus;

  @Column({ type: 'json', nullable: true })
  answers: ListeningAnswer[];

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracy: number;

  @Column({ type: 'int', default: 0 })
  totalListenTime: number;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  playbackSpeed: number;

  @Column({ type: 'int', default: 0 })
  repeatedSections: number;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

export interface ListeningAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
  timeSpent?: number;
  listenCount?: number;
}
