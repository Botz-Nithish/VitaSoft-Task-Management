import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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
export class TaskIdController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   * @param id - {string} task UUID from route param
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.tasksService.findOne(user.id, id);
  }

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   * @param id - {string} task UUID from route param
   * @param dto - {TaskDto} partial task fields to apply (all optional: title?, description?, taskType?, status?, priority?, dueDate?)
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: TaskDto,
  ): Promise<Task> {
    return this.tasksService.update(user.id, id, dto);
  }

  /**
   * @param user - {RequestUser} authenticated user extracted from JWT ({ id: string, email: string })
   * @param id - {string} task UUID from route param
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(user.id, id);
  }
}
