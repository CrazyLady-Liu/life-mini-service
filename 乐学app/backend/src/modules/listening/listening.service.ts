import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListeningMaterial, MaterialCategory, ListeningLevel } from './listening-material.entity';
import { ListeningPractice, PracticeStatus, ListeningAnswer } from './listening-practice.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { User } from '../user/user.entity';
import { StudentService } from '../student/student.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ListeningService {
  constructor(
    @InjectRepository(ListeningMaterial)
    private readonly materialRepository: Repository<ListeningMaterial>,
    @InjectRepository(ListeningPractice)
    private readonly practiceRepository: Repository<ListeningPractice>,
    private readonly studentService: StudentService,
  ) {}

  async createMaterial(createDto: CreateMaterialDto, teacher: User): Promise<ListeningMaterial> {
    const material = this.materialRepository.create({
      ...createDto,
      teacherId: teacher.id,
    });
    return this.materialRepository.save(material);
  }

  async getAllMaterials(
    category?: MaterialCategory,
    level?: ListeningLevel,
    isPublic?: boolean,
  ): Promise<ListeningMaterial[]> {
    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (isPublic !== undefined) where.isPublic = isPublic;

    return this.materialRepository.find({
      where,
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMaterialById(id: string): Promise<ListeningMaterial> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!material) {
      throw new NotFoundException('听力材料不存在');
    }
    return material;
  }

  async deleteMaterial(id: string, teacher: User): Promise<void> {
    const material = await this.getMaterialById(id);
    if (material.teacherId !== teacher.id) {
      throw new ForbiddenException('无权限删除此材料');
    }
    await this.materialRepository.delete(id);
  }

  async startPractice(materialId: string, student: User): Promise<ListeningPractice> {
    const material = await this.getMaterialById(materialId);
    
    const existingPractice = await this.practiceRepository.findOne({
      where: {
        materialId,
        studentId: student.id,
        status: PracticeStatus.IN_PROGRESS,
      },
    });

    if (existingPractice) {
      return existingPractice;
    }

    const practice = this.practiceRepository.create({
      materialId,
      studentId: student.id,
      startedAt: new Date(),
    });

    return this.practiceRepository.save(practice);
  }

  async submitPractice(
    practiceId: string,
    submitDto: SubmitPracticeDto,
    student: User,
  ): Promise<ListeningPractice> {
    const practice = await this.practiceRepository.findOne({
      where: { id: practiceId },
      relations: ['material'],
    });

    if (!practice) {
      throw new NotFoundException('练习记录不存在');
    }
    if (practice.studentId !== student.id) {
      throw new ForbiddenException('无权限提交此练习');
    }
    if (practice.status === PracticeStatus.COMPLETED) {
      throw new Error('练习已提交');
    }

    const material = practice.material;
    const gradedAnswers = this.gradeAnswers(submitDto.answers, material.questions);

    let totalScore = 0;
    let correctCount = 0;

    gradedAnswers.forEach(answer => {
      if (answer.isCorrect) {
        correctCount++;
        totalScore += answer.score || 0;
      }
    });

    const maxScore = material.questions?.reduce((sum, q) => sum + q.score, 0) || 0;
    const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    practice.answers = gradedAnswers;
    practice.score = totalScore;
    practice.totalScore = maxScore;
    practice.accuracy = Math.round(accuracy * 100) / 100;
    practice.totalListenTime = submitDto.totalListenTime;
    practice.playCount = submitDto.playCount;
    practice.playbackSpeed = submitDto.playbackSpeed || 1.0;
    practice.repeatedSections = submitDto.repeatedSections || 0;
    practice.status = PracticeStatus.COMPLETED;
    practice.completedAt = new Date();

    const savedPractice = await this.practiceRepository.save(practice);

    material.playCount++;
    await this.materialRepository.save(material);

    await this.updateStudentListeningStats(student.id, submitDto.totalListenTime);

    return savedPractice;
  }

  private gradeAnswers(studentAnswers: ListeningAnswer[], questions: any[]): ListeningAnswer[] {
    return studentAnswers.map(studentAnswer => {
      const question = questions?.find(q => q.id === studentAnswer.questionId);
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

  async getStudentPractices(studentId: string, status?: PracticeStatus): Promise<ListeningPractice[]> {
    const where: any = { studentId };
    if (status) where.status = status;

    return this.practiceRepository.find({
      where,
      relations: ['material'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPracticeById(id: string): Promise<ListeningPractice> {
    const practice = await this.practiceRepository.findOne({
      where: { id },
      relations: ['material', 'student', 'material.teacher'],
    });
    if (!practice) {
      throw new NotFoundException('练习记录不存在');
    }
    return practice;
  }

  private async updateStudentListeningStats(studentId: string, listenTime: number): Promise<void> {
    const practices = await this.practiceRepository.find({
      where: { studentId, status: PracticeStatus.COMPLETED },
    });

    const totalTime = practices.reduce((sum, p) => sum + p.totalListenTime, 0) + listenTime;

    await this.studentService.updateProfileStats(studentId, {
      totalListeningTime: totalTime,
    });
  }

  async getMaterialPractices(materialId: string): Promise<ListeningPractice[]> {
    return this.practiceRepository.find({
      where: { materialId, status: PracticeStatus.COMPLETED },
      relations: ['student'],
      order: { completedAt: 'DESC' },
    });
  }

  async generateListeningQuestions(type: string, level: ListeningLevel, count: number): Promise<any[]> {
    const questionTemplates = [
      {
        id: uuidv4(),
        type: 'single',
        content: '根据听到的内容，选择正确的答案',
        options: ['选项A', '选项B', '选项C', '选项D'],
        answer: '选项A',
        score: 10,
      },
      {
        id: uuidv4(),
        type: 'fill',
        content: '填空：The main idea of the passage is about ___',
        answer: 'education',
        score: 10,
      },
      {
        id: uuidv4(),
        type: 'short',
        content: '请用自己的话总结你听到的内容',
        answer: '学生需要根据听力内容进行总结',
        score: 20,
      },
    ];

    return Array(count).fill(null).map(() => ({
      ...questionTemplates[Math.floor(Math.random() * questionTemplates.length)],
      id: uuidv4(),
    }));
  }
}
