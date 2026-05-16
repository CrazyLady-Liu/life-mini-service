import { IsArray, IsNotEmpty, ValidateNested, IsInt, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ListeningAnswer } from '../listening-practice.entity';

export class SubmitPracticeDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Object)
  answers: ListeningAnswer[];

  @IsInt()
  totalListenTime: number;

  @IsInt()
  playCount: number;

  @IsOptional()
  @IsNumber()
  playbackSpeed?: number;

  @IsOptional()
  @IsInt()
  repeatedSections?: number;
}
