import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Homework, HomeworkStatus, HomeworkType, DifficultyLevel } from './homework.entity';
import { HomeworkSubmission, SubmissionStatus, StudentAnswer } from './homework-submission.entity';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { GradeHomeworkDto } from './dto/grade-homework.dto';
import { generateQuestions, generateMixedQuestions } from './question-bank';
import { User } from '../user/user.entity';
import { StudentService } from '../student/student.service';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @InjectRepository(HomeworkSubmission)
    private readonly submissionRepository: Repository<HomeworkSubmission>,
    private readonly studentService: StudentService,
  ) {}

  async create(createHomeworkDto: CreateHomeworkDto, teacher: User): Promise<Homework> {
    let questions = createHomeworkDto.questions || [];
    
    if (createHomeworkDto.autoGenerate || !questions.length) {
      const count = createHomeworkDto.questionCount || 10;
      if (createHomeworkDto.type === HomeworkType.MIXED) {
        questions = generateMixedQuestions(createHomeworkDto.difficulty, count);
      } else {
        questions = generateQuestions(createHomeworkDto.type, createHomeworkDto.difficulty, count);
      }
    }

    const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

    const homework = this.homeworkRepository.create({
      ...createHomeworkDto,
      teacherId: teacher.id,
      questions,
      totalScore,
      status: HomeworkStatus.DRAFT,
    });

    const savedHomework = await this.homeworkRepository.save(homework);

    if (createHomeworkDto.studentIds?.length) {
      await this.createSubmissions(savedHomework.id, createHomeworkDto.studentIds);
    }

    return savedHomework;
  }

  private async createSubmissions(homeworkId: string, studentIds: string[]): Promise<void> {
    const submissions = studentIds.map(studentId =>
      this.submissionRepository.create({
        homeworkId,
        studentId,
        status: SubmissionStatus.NOT_STARTED,
      }),
    );
    await this.submissionRepository.save(submissions);
  }

  async publish(homeworkId: string, teacher: User): Promise<Homework> {
    const homework = await this.findOne(homeworkId);
    if (homework.teacherId !== teacher.id) {
      throw new ForbiddenException('无权限发布此作业');
    }
    homework.status = HomeworkStatus.PUBLISHED;
    return this.homeworkRepository.save(homework);
  }

  async findAll(teacherId?: string, status?: HomeworkStatus): Promise<Homework[]> {
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    return this.homeworkRepository.find({
      where,
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Homework> {
    const homework = await this.homeworkRepository.findOne({
      where: { id },
      relations: ['teacher', 'submissions'],
    });
    if (!homework) {
      throw new NotFoundException('作业不存在');
    }
    return homework;
  }

  async getStudentHomeworks(studentId: string, status?: SubmissionStatus): Promise<HomeworkSubmission[]> {
    const where: any = { studentId };
    if (status) where.status = status;

    return this.submissionRepository.find({
      where,
      relations: ['homework', 'homework.teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async startHomework(submissionId: string, studentId: string): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['homework'],
    });

    if (!submission) {
      throw new NotFoundException('作业提交记录不存在');
    }
    if (submission.studentId !== studentId) {
      throw new ForbiddenException('无权限访问此作业');
    }
    if (submission.status !== SubmissionStatus.NOT_STARTED) {
      throw new BadRequestException('作业已开始或已提交');
    }
    if (submission.homework.status !== HomeworkStatus.PUBLISHED) {
      throw new BadRequestException('作业未发布');
    }

    submission.status = SubmissionStatus.IN_PROGRESS;
    submission.startedAt = new Date();
    return this.submissionRepository.save(submission);
  }

  async submitHomework(
    submissionId: string,
    studentId: string,
    submitDto: SubmitHomeworkDto,
  ): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['homework'],
    });

    if (!submission) {
      throw new NotFoundException('作业提交记录不存在');
    }
    if (submission.studentId !== studentId) {
      throw new ForbiddenException('无权限访问此作业');
    }
    if (submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.GRADED) {
      throw new BadRequestException('作业已提交');
    }

    const homework = submission.homework;
    const gradedAnswers = this.gradeAnswers(submitDto.answers, homework.questions);
    
    let totalScore = 0;
    let correctCount = 0;

    gradedAnswers.forEach(answer => {
      if (answer.isCorrect) {
        correctCount++;
        totalScore += answer.score || 0;
      }
    });

    const accuracy = homework.totalScore > 0 ? (totalScore / homework.totalScore) * 100 : 0;

    submission.answers = gradedAnswers;
    submission.score = totalScore;
    submission.totalScore = homework.totalScore;
    submission.accuracy = Math.round(accuracy * 100) / 100;
    submission.timeSpent = submitDto.timeSpent;
    submission.status = SubmissionStatus.SUBMITTED;
    submission.submittedAt = new Date();

    const savedSubmission = await this.submissionRepository.save(submission);
    await this.updateStudentStats(submission.studentId);

    return savedSubmission;
  }

  private gradeAnswers(studentAnswers: StudentAnswer[], questions: any[]): StudentAnswer[] {
    return studentAnswers.map(studentAnswer => {
      const question = questions.find(q => q.id === studentAnswer.questionId);
      if (!question) return studentAnswer;

      let isCorrect = false;
      
      if (question.type === 'single' || question.type === 'fill') {
        isCorrect = String(studentAnswer.answer).toLowerCase().trim() === String(question.answer).toLowerCase().trim();
      } else if (question.type === 'multiple') {
        const studentAns = Array.isArray(studentAnswer.answer) ? studentAnswer.answer : [studentAnswer.answer];
        const correctAns = Array.isArray(question.answer) ? question.answer : [question.answer];
        isCorrect = 
          studentAns.length === correctAns.length &&
          studentAns.every(a => correctAns.includes(a));
      }

      return {
        ...studentAnswer,
        isCorrect,
        score: isCorrect ? question.score : 0,
      };
    });
  }

  async gradeSubmission(submissionId: string, gradeDto: GradeHomeworkDto, teacher: User): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['homework'],
    });

    if (!submission) {
      throw new NotFoundException('作业提交记录不存在');
    }
    if (submission.homework.teacherId !== teacher.id) {
      throw new ForbiddenException('无权限批改此作业');
    }

    submission.score = gradeDto.score;
    submission.teacherComment = gradeDto.teacherComment;
    submission.status = SubmissionStatus.GRADED;
    submission.gradedAt = new Date();

    const savedSubmission = await this.submissionRepository.save(submission);
    await this.updateStudentStats(submission.studentId);

    return savedSubmission;
  }

  async getSubmission(submissionId: string): Promise<HomeworkSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['homework', 'student', 'homework.teacher'],
    });
    if (!submission) {
      throw new NotFoundException('作业提交记录不存在');
    }
    return submission;
  }

  async getHomeworkSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
    return this.submissionRepository.find({
      where: { homeworkId },
      relations: ['student'],
      order: { submittedAt: 'DESC' },
    });
  }

  private async updateStudentStats(studentId: string): Promise<void> {
    const submissions = await this.submissionRepository.find({
      where: { studentId, status: In([SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED]) },
    });

    if (submissions.length === 0) return;

    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = submissions.reduce((sum, s) => sum + s.totalScore, 0);
    const averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    const completedHomework = submissions.length;

    const allSubmissions = await this.submissionRepository.find({ where: { studentId } });
    const totalHomework = allSubmissions.length;

    await this.studentService.updateProfileStats(studentId, {
      averageScore: Math.round(averageScore * 100) / 100,
      totalHomework,
      completedHomework,
    });
  }

  async delete(homeworkId: string, teacher: User): Promise<void> {
    const homework = await this.findOne(homeworkId);
    if (homework.teacherId !== teacher.id) {
      throw new ForbiddenException('无权限删除此作业');
    }
    await this.homeworkRepository.delete(homeworkId);
  }
}
