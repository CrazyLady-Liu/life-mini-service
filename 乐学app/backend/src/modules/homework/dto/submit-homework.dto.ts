import { IsArray, IsNotEmpty, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentAnswer } from '../homework-submission.entity';

export class SubmitHomeworkDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Object)
  answers: StudentAnswer[];

  @IsInt()
  timeSpent: number;
}
