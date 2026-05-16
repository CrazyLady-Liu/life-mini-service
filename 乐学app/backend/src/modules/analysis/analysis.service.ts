import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HomeworkSubmission, SubmissionStatus } from '../homework/homework-submission.entity';
import { Homework, HomeworkType } from '../homework/homework.entity';
import { ListeningPractice, PracticeStatus } from '../listening/listening-practice.entity';
import { ListeningMaterial, ListeningLevel } from '../listening/listening-material.entity';
import { StudentProfile } from '../student/student-profile.entity';
import { StudentRecord, RecordType } from '../student/student-record.entity';
import { User } from '../user/user.entity';

export interface StudentAnalysis {
  studentId: string;
  studentName: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  homeworkStats: HomeworkStats;
  listeningStats: ListeningStats;
  recentActivity: RecentActivity[];
  improvement: ImprovementData;
}

export interface HomeworkStats {
  totalAssigned: number;
  completed: number;
  completionRate: number;
  averageScore: number;
  typeBreakdown: Record<string, { total: number; average: number }>;
}

export interface ListeningStats {
  totalPractices: number;
  completed: number;
  totalListenTime: number;
  averageScore: number;
  levelBreakdown: Record<string, { total: number; average: number }>;
  averagePlaybackSpeed: number;
}

export interface RecentActivity {
  id: string;
  type: 'homework' | 'listening' | 'record';
  title: string;
  score?: number;
  date: Date;
  status: string;
}

export interface ImprovementData {
  lastWeekAvg: number;
  thisWeekAvg: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
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

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(HomeworkSubmission)
    private readonly submissionRepository: Repository<HomeworkSubmission>,
    @InjectRepository(ListeningPractice)
    private readonly listeningPracticeRepository: Repository<ListeningPractice>,
    @InjectRepository(StudentProfile)
    private readonly profileRepository: Repository<StudentProfile>,
    @InjectRepository(StudentRecord)
    private readonly recordRepository: Repository<StudentRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStudentAnalysis(studentId: string): Promise<StudentAnalysis> {
    const student = await this.userRepository.findOne({ where: { id: studentId } });
    const profile = await this.profileRepository.findOne({ where: { studentId } });

    const homeworkStats = await this.getHomeworkStats(studentId);
    const listeningStats = await this.getListeningStats(studentId);
    const recentActivity = await this.getRecentActivity(studentId);
    const improvement = await this.getImprovementData(studentId);

    const strengths = this.identifyStrengths(homeworkStats, listeningStats);
    const weaknesses = this.identifyWeaknesses(homeworkStats, listeningStats);

    const overallScore = this.calculateOverallScore(homeworkStats, listeningStats);

    return {
      studentId,
      studentName: student?.name || '未知',
      overallScore,
      strengths,
      weaknesses,
      homeworkStats,
      listeningStats,
      recentActivity,
      improvement,
    };
  }

  private async getHomeworkStats(studentId: string): Promise<HomeworkStats> {
    const submissions = await this.submissionRepository.find({
      where: { studentId },
      relations: ['homework'],
    });

    const completed = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.GRADED);
    const typeBreakdown: Record<string, { total: number; average: number; sum: number }> = {};

    submissions.forEach(sub => {
      const type = sub.homework?.type || 'unknown';
      if (!typeBreakdown[type]) {
        typeBreakdown[type] = { total: 0, average: 0, sum: 0 };
      }
      typeBreakdown[type].total++;
      if (sub.score > 0 || sub.totalScore > 0) {
        const percentage = sub.totalScore > 0 ? (sub.score / sub.totalScore) * 100 : 0;
        typeBreakdown[type].sum += percentage;
      }
    });

    Object.keys(typeBreakdown).forEach(key => {
      typeBreakdown[key].average = typeBreakdown[key].total > 0
        ? Math.round(typeBreakdown[key].sum / typeBreakdown[key].total * 100) / 100
        : 0;
      delete (typeBreakdown[key] as any).sum;
    });

    const totalScore = completed.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = completed.reduce((sum, s) => sum + s.totalScore, 0);
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100 * 100) / 100 : 0;

    return {
      totalAssigned: submissions.length,
      completed: completed.length,
      completionRate: submissions.length > 0 ? Math.round((completed.length / submissions.length) * 100) : 0,
      averageScore,
      typeBreakdown,
    };
  }

  private async getListeningStats(studentId: string): Promise<ListeningStats> {
    const practices = await this.listeningPracticeRepository.find({
      where: { studentId },
      relations: ['material'],
    });

    const completed = practices.filter(p => p.status === PracticeStatus.COMPLETED);
    const levelBreakdown: Record<string, { total: number; average: number; sum: number }> = {};

    practices.forEach(practice => {
      const level = practice.material?.level || 'unknown';
      if (!levelBreakdown[level]) {
        levelBreakdown[level] = { total: 0, average: 0, sum: 0 };
      }
      levelBreakdown[level].total++;
      if (practice.score > 0 || practice.totalScore > 0) {
        const percentage = practice.totalScore > 0 ? (practice.score / practice.totalScore) * 100 : 0;
        levelBreakdown[level].sum += percentage;
      }
    });

    Object.keys(levelBreakdown).forEach(key => {
      levelBreakdown[key].average = levelBreakdown[key].total > 0
        ? Math.round(levelBreakdown[key].sum / levelBreakdown[key].total * 100) / 100
        : 0;
      delete (levelBreakdown[key] as any).sum;
    });

    const totalScore = completed.reduce((sum, p) => sum + p.score, 0);
    const totalMaxScore = completed.reduce((sum, p) => sum + p.totalScore, 0);
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100 * 100) / 100 : 0;

    const totalListenTime = completed.reduce((sum, p) => sum + p.totalListenTime, 0);
    const avgSpeed = completed.length > 0
      ? completed.reduce((sum, p) => sum + p.playbackSpeed, 0) / completed.length
      : 1.0;

    return {
      totalPractices: practices.length,
      completed: completed.length,
      totalListenTime,
      averageScore,
      levelBreakdown,
      averagePlaybackSpeed: Math.round(avgSpeed * 10) / 10,
    };
  }

  private async getRecentActivity(studentId: string): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    const submissions = await this.submissionRepository.find({
      where: { studentId },
      relations: ['homework'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

    const practices = await this.listeningPracticeRepository.find({
      where: { studentId },
      relations: ['material'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

    const records = await this.recordRepository.find({
      where: { studentId },
      take: 5,
      order: { createdAt: 'DESC' },
    });

    submissions.forEach(s => {
      activities.push({
        id: s.id,
        type: 'homework',
        title: s.homework?.title || '作业',
        score: s.totalScore > 0 ? Math.round((s.score / s.totalScore) * 100) : 0,
        date: s.submittedAt || s.createdAt,
        status: s.status,
      });
    });

    practices.forEach(p => {
      activities.push({
        id: p.id,
        type: 'listening',
        title: p.material?.title || '听力练习',
        score: p.totalScore > 0 ? Math.round((p.score / p.totalScore) * 100) : 0,
        date: p.completedAt || p.createdAt,
        status: p.status,
      });
    });

    records.forEach(r => {
      activities.push({
        id: r.id,
        type: 'record',
        title: r.title,
        score: r.score,
        date: r.createdAt,
        status: r.type,
      });
    });

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }

  private async getImprovementData(studentId: string): Promise<ImprovementData> {
    const now = new Date();
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastWeekSubmissions = await this.submissionRepository.find({
      where: {
        studentId,
        submittedAt: Between(lastWeekStart, thisWeekStart),
        status: SubmissionStatus.SUBMITTED,
      },
    });

    const thisWeekSubmissions = await this.submissionRepository.find({
      where: {
        studentId,
        submittedAt: Between(thisWeekStart, now),
        status: SubmissionStatus.SUBMITTED,
      },
    });

    const lastWeekAvg = this.calculateAverageScore(lastWeekSubmissions);
    const thisWeekAvg = this.calculateAverageScore(thisWeekSubmissions);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let changePercent = 0;

    if (lastWeekAvg > 0) {
      changePercent = Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100);
      if (changePercent > 5) trend = 'up';
      else if (changePercent < -5) trend = 'down';
    }

    return {
      lastWeekAvg,
      thisWeekAvg,
      trend,
      changePercent,
    };
  }

  private calculateAverageScore(submissions: HomeworkSubmission[]): number {
    if (submissions.length === 0) return 0;
    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = submissions.reduce((sum, s) => sum + s.totalScore, 0);
    return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  }

  private identifyStrengths(homeworkStats: HomeworkStats, listeningStats: ListeningStats): string[] {
    const strengths: string[] = [];

    if (homeworkStats.completionRate >= 90) {
      strengths.push('作业完成态度积极，按时完成率高');
    }

    if (homeworkStats.averageScore >= 85) {
      strengths.push('整体作业掌握程度优秀');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.LISTENING]?.average >= 80) {
      strengths.push('听力理解能力较强');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.READING]?.average >= 80) {
      strengths.push('阅读理解能力优秀');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.WRITING]?.average >= 80) {
      strengths.push('写作表达能力突出');
    }

    if (listeningStats.averageScore >= 80) {
      strengths.push('听力训练成效显著');
    }

    if (listeningStats.totalListenTime >= 3600) {
      strengths.push('听力练习投入时间充足');
    }

    if (strengths.length === 0) {
      strengths.push('学习态度认真，继续保持');
    }

    return strengths.slice(0, 5);
  }

  private identifyWeaknesses(homeworkStats: HomeworkStats, listeningStats: ListeningStats): string[] {
    const weaknesses: string[] = [];

    if (homeworkStats.completionRate < 70) {
      weaknesses.push('作业完成率有待提高，需加强学习主动性');
    }

    if (homeworkStats.averageScore < 60) {
      weaknesses.push('整体知识掌握不够扎实，建议加强基础练习');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.LISTENING]?.average < 60) {
      weaknesses.push('听力理解是薄弱环节，建议多听多练');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.READING]?.average < 60) {
      weaknesses.push('阅读理解需要加强，建议增加阅读量');
    }

    if (homeworkStats.typeBreakdown[HomeworkType.WRITING]?.average < 60) {
      weaknesses.push('写作能力有待提升，建议多加练习');
    }

    if (listeningStats.totalPractices < 5) {
      weaknesses.push('听力练习次数较少，建议增加练习频率');
    }

    if (listeningStats.averagePlaybackSpeed < 0.8) {
      weaknesses.push('听力播放速度较慢，可以尝试逐步提高语速');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('整体表现良好，挑战更高难度的内容吧');
    }

    return weaknesses.slice(0, 5);
  }

  private calculateOverallScore(homeworkStats: HomeworkStats, listeningStats: ListeningStats): number {
    const homeworkScore = homeworkStats.averageScore * 0.6;
    const listeningScore = listeningStats.averageScore * 0.3;
    const completionScore = homeworkStats.completionRate * 0.1;
    return Math.round(homeworkScore + listeningScore + completionScore);
  }

  async getClassAnalysis(teacherId?: string): Promise<ClassAnalysis> {
    const profiles = await this.profileRepository.find({
      relations: ['student'],
    });

    const allSubmissions = await this.submissionRepository.find({
      where: { status: SubmissionStatus.SUBMITTED },
      relations: ['homework'],
    });

    const students = profiles.map(p => p.student).filter(Boolean);
    const totalStudents = students.length;

    const avgScores = profiles
      .filter(p => p.averageScore > 0)
      .map(p => ({ id: p.studentId, name: p.student?.name || '', score: p.averageScore }));

    const averageScore = avgScores.length > 0
      ? Math.round(avgScores.reduce((sum, s) => sum + s.score, 0) / avgScores.length * 100) / 100
      : 0;

    const sortedStudents = [...avgScores].sort((a, b) => b.score - a.score);
    const topStudents = sortedStudents.slice(0, 5);
    const strugglingStudents = sortedStudents.slice(-5).reverse();

    const completedCount = allSubmissions.length;
    const totalAssigned = await this.submissionRepository.count();
    const homeworkCompletionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

    const subjectPerformance: Record<string, number> = {};
    const typeSums: Record<string, { total: number; count: number }> = {};

    allSubmissions.forEach(sub => {
      const type = sub.homework?.type || 'unknown';
      if (!typeSums[type]) {
        typeSums[type] = { total: 0, count: 0 };
      }
      if (sub.totalScore > 0) {
        typeSums[type].total += (sub.score / sub.totalScore) * 100;
        typeSums[type].count++;
      }
    });

    Object.keys(typeSums).forEach(key => {
      subjectPerformance[key] = typeSums[key].count > 0
        ? Math.round(typeSums[key].total / typeSums[key].count * 100) / 100
        : 0;
    });

    const weeklyProgress = await this.getWeeklyProgress();

    return {
      totalStudents,
      averageScore,
      homeworkCompletionRate,
      topStudents,
      strugglingStudents,
      subjectPerformance,
      weeklyProgress,
    };
  }

  private async getWeeklyProgress(): Promise<{ date: string; avgScore: number }[]> {
    const now = new Date();
    const weeks: { date: string; avgScore: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const submissions = await this.submissionRepository.find({
        where: {
          submittedAt: Between(weekStart, weekEnd),
          status: SubmissionStatus.SUBMITTED,
        },
      });

      const avgScore = this.calculateAverageScore(submissions);
      weeks.push({
        date: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        avgScore,
      });
    }

    return weeks;
  }
}
