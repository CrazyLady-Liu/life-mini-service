import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { RecordType } from '../student-record.entity';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(RecordType)
  type: RecordType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @IsOptional()
  @IsInt()
  score?: number;
}
