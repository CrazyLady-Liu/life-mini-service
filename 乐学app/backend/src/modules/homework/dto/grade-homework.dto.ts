import { IsOptional, IsString, IsInt } from 'class-validator';

export class GradeHomeworkDto {
  @IsInt()
  score: number;

  @IsOptional()
  @IsString()
  teacherComment?: string;
}
