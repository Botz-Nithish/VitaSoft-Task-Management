import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { RequestUser } from '../common/interfaces/authenticated-request.interface';
import type { Task } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser() user: RequestUser,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(user.id, dto);
  }

  @Get('types')
  @HttpCode(HttpStatus.OK)
  getTypes(@GetUser() user: RequestUser): Promise<string[]> {
    return this.tasksService.getTypes(user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@GetUser() user: RequestUser): Promise<Task[]> {
    return this.tasksService.findAll(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<Task> {
    return this.tasksService.findOne(user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(user.id, id);
  }
}
