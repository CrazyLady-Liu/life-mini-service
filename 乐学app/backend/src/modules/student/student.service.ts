import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { StudentRecord, RecordType } from './student-record.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from '../user/user.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly profileRepository: Repository<StudentProfile>,
    @InjectRepository(StudentRecord)
    private readonly recordRepository: Repository<StudentRecord>,
  ) {}

  async createProfile(createProfileDto: CreateProfileDto): Promise<StudentProfile> {
    const existingProfile = await this.profileRepository.findOne({
      where: { studentId: createProfileDto.studentId },
    });
    if (existingProfile) {
      throw new BadRequestException('该学生档案已存在');
    }

    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  async getProfileByStudentId(studentId: string): Promise<StudentProfile> {
    const profile = await this.profileRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });
    if (!profile) {
      throw new NotFoundException('学生档案不存在');
    }
    return profile;
  }

  async updateProfile(studentId: string, updateProfileDto: UpdateProfileDto): Promise<StudentProfile> {
    const profile = await this.getProfileByStudentId(studentId);
    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }

  async getAllProfiles(grade?: number, className?: string): Promise<StudentProfile[]> {
    const where: any = {};
    if (grade) where.grade = grade;
    if (className) where.className = className;

    return this.profileRepository.find({
      where,
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async addRecord(createRecordDto: CreateRecordDto, teacher: User): Promise<StudentRecord> {
    const record = this.recordRepository.create({
      ...createRecordDto,
      teacherId: teacher.id,
    });
    return this.recordRepository.save(record);
  }

  async getStudentRecords(studentId: string, type?: RecordType): Promise<StudentRecord[]> {
    const where: any = { studentId };
    if (type) where.type = type;

    return this.recordRepository.find({
      where,
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRecordById(id: string): Promise<StudentRecord> {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['student', 'teacher'],
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }
    return record;
  }

  async deleteRecord(id: string): Promise<void> {
    const result = await this.recordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('记录不存在');
    }
  }

  async updateProfileStats(studentId: string, stats: Partial<StudentProfile>): Promise<void> {
    await this.profileRepository.update({ studentId }, stats);
  }
}
