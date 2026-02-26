import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix login bug', maxLength: 255 })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @ApiProperty({ example: 'The login page throws 500 on wrong password.' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @ApiPropertyOptional({ example: 'Bug', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'taskType must not be empty if provided' })
  @MaxLength(100, { message: 'taskType must not exceed 100 characters' })
  taskType?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.NOT_STARTED })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be NOT_STARTED, STARTED, or FINISHED' })
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}
