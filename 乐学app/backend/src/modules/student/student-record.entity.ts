import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum RecordType {
  ACADEMIC = 'academic',
  BEHAVIOR = 'behavior',
  ATTENDANCE = 'attendance',
  AWARD = 'award',
  OTHER = 'other',
}

@Entity('student_records')
export class StudentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({
    type: 'enum',
    enum: RecordType,
    default: RecordType.OTHER,
  })
  type: RecordType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'date', nullable: true })
  recordDate: Date;

  @Column({ type: 'int', nullable: true })
  score: number;

  @CreateDateColumn()
  createdAt: Date;
}
