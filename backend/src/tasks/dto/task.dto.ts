import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class TaskDto {
  @ApiPropertyOptional({ example: 'Fix login bug', maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty if provided' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'The login page throws 500 on wrong password.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty if provided' })
  description?: string;

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
