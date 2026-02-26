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

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Fix login bug', maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty if provided' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty if provided' })
  description?: string;

  @ApiPropertyOptional({ example: 'Feature', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'taskType must not be empty if provided' })
  @MaxLength(100, { message: 'taskType must not exceed 100 characters' })
  taskType?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.STARTED })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be NOT_STARTED, STARTED, or FINISHED' })
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}
