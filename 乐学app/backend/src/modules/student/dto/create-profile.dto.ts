import { IsString, IsOptional, IsInt, IsDateString, IsNumber } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  studentNo?: string;

  @IsOptional()
  @IsInt()
  grade?: number;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  healthStatus?: string;

  @IsOptional()
  @IsString()
  learningStyle?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  weaknesses?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  averageScore?: number;
}
