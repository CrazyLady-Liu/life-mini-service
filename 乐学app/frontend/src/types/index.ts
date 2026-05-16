export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  student?: User;
  studentNo?: string;
  grade?: number;
  className?: string;
  birthday?: Date;
  gender?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  healthStatus?: string;
  learningStyle?: string;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  averageScore: number;
  totalHomework: number;
  completedHomework: number;
  totalListeningTime: number;
  createdAt: Date;
  updatedAt: Date;
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

export enum HomeworkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
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

export interface Homework {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  teacher?: User;
  type: HomeworkType;
  difficulty: DifficultyLevel;
  status: HomeworkStatus;
  questions?: Question[];
  studentIds?: string[];
  deadline?: Date;
  totalScore: number;
  duration: number;
  autoGenerate: boolean;
  questionCount: number;
  grade?: number;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubmissionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
  timeSpent?: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homework?: Homework;
  studentId: string;
  student?: User;
  status: SubmissionStatus;
  answers?: StudentAnswer[];
  score: number;
  totalScore: number;
  accuracy: number;
  timeSpent: number;
  teacherComment?: string;
  startedAt?: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  createdAt: Date;
}

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

export interface ListeningMaterial {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  transcript?: string;
  category: MaterialCategory;
  level: ListeningLevel;
  duration: number;
  teacherId: string;
  teacher?: User;
  tags?: string[];
  questions?: any[];
  isPublic: boolean;
  playCount: number;
  createdAt: Date;
}

export enum PracticeStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ListeningPractice {
  id: string;
  materialId: string;
  material?: ListeningMaterial;
  studentId: string;
  student?: User;
  status: PracticeStatus;
  answers?: any[];
  score: number;
  totalScore: number;
  accuracy: number;
  totalListenTime: number;
  playCount: number;
  playbackSpeed: number;
  repeatedSections: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface StudentAnalysis {
  studentId: string;
  studentName: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  homeworkStats: any;
  listeningStats: any;
  recentActivity: any[];
  improvement: any;
}

export interface ClassAnalysis {
  totalStudents: number;
  averageScore: number;
  homeworkCompletionRate: number;
  topStudents: { id: string; name: string; score: number }[];
  strugglingStudents: { id: string; name: string; score: number }[];
  subjectPerformance: Record<string, number>;
  weeklyProgress: { date: string; avgScore: number }[];
}
