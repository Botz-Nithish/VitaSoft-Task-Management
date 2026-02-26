import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from '../tasks.service';
import { TaskDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { RequestUser } from '../../common/interfaces/authenticated-request.interface';
import type { Task } from '@prisma/client';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   * @param dto - {TaskDto} task fields (title?, description?, taskType?, status?, priority?, dueDate?)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @GetUser() user: RequestUser,
    @Body() dto: TaskDto,
  ): Promise<Task> {
    return this.tasksService.create(user.id, dto);
  }

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   */
  @Get('types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all distinct task types for the current user' })
  @ApiResponse({ status: 200, description: 'List of task type strings.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getTypes(@GetUser() user: RequestUser): Promise<string[]> {
    return this.tasksService.getTypes(user.id);
  }

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({ status: 200, description: 'List of tasks.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@GetUser() user: RequestUser): Promise<Task[]> {
    return this.tasksService.findAll(user.id);
  }
}
