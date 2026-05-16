import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HomeworkType, DifficultyLevel, Question } from '../homework.entity';

export class CreateHomeworkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(HomeworkType)
  type: HomeworkType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  questions?: Question[];

  @IsOptional()
  @IsArray()
  studentIds?: string[];

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;

  @IsOptional()
  @IsInt()
  questionCount?: number;

  @IsOptional()
  @IsInt()
  grade?: number;

  @IsOptional()
  @IsString()
  subject?: string;
}
