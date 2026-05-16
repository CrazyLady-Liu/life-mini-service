import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ length: 20, nullable: true })
  studentNo: string;

  @Column({ type: 'int', nullable: true })
  grade: number;

  @Column({ length: 50, nullable: true })
  className: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  guardianName: string;

  @Column({ length: 20, nullable: true })
  guardianPhone: string;

  @Column({ type: 'text', nullable: true })
  healthStatus: string;

  @Column({ type: 'text', nullable: true })
  learningStyle: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  weaknesses: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageScore: number;

  @Column({ type: 'int', default: 0 })
  totalHomework: number;

  @Column({ type: 'int', default: 0 })
  completedHomework: number;

  @Column({ type: 'int', default: 0 })
  totalListeningTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
