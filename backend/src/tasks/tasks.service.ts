import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';
import type { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(userId, taskId);

    const completedAtUpdate = this.resolveCompletedAt(dto.status);

    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...completedAtUpdate,
      },
    });
  }

  async remove(userId: string, taskId: string): Promise<{ message: string }> {
    await this.findOne(userId, taskId);

    await this.prisma.task.delete({
      where: { id: taskId, userId },
    });

    return { message: 'Task deleted successfully' };
  }

  private resolveCompletedAt(
    status: TaskStatus | undefined,
  ): { status?: TaskStatus; completedAt?: Date | null } {
    if (status === undefined) {
      return {};
    }

    if (status === TaskStatus.FINISHED) {
      return { status, completedAt: new Date() };
    }

    return { status, completedAt: null };
  }
}
