import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MaterialCategory, ListeningLevel, ListeningQuestion } from '../listening-material.entity';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsEnum(ListeningLevel)
  level: ListeningLevel;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  questions?: ListeningQuestion[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
