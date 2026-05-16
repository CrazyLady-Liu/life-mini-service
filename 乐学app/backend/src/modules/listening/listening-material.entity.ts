import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { ListeningPractice } from './listening-practice.entity';

export enum MaterialCategory {
  CONVERSATION = 'conversation',
  STORY = 'story',
  NEWS = 'news',
  LECTURE = 'lecture',
  SONG = 'song',
  OTHER = 'other',
}

export enum ListeningLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
}

@Entity('listening_materials')
export class ListeningMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  audioUrl: string;

  @Column({ type: 'text', nullable: true })
  transcript: string;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
    default: MaterialCategory.CONVERSATION,
  })
  category: MaterialCategory;

  @Column({
    type: 'enum',
    enum: ListeningLevel,
    default: ListeningLevel.INTERMEDIATE,
  })
  level: ListeningLevel;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column()
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  questions: ListeningQuestion[];

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @OneToMany(() => ListeningPractice, practice => practice.material)
  practices: ListeningPractice[];

  @CreateDateColumn()
  createdAt: Date;
}

export interface ListeningQuestion {
  id: string;
  type: 'single' | 'multiple' | 'fill' | 'short';
  content: string;
  options?: string[];
  answer: string | string[];
  score: number;
  explanation?: string;
  startTime?: number;
  endTime?: number;
}
