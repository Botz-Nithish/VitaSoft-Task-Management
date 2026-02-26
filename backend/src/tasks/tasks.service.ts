import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskDto } from './dto/task.dto';
import { TaskStatus } from '@prisma/client';
import type { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @param userId - {string} authenticated user's ID (scopes task to owner)
   * @param dto - {CreateTaskDto} validated task creation payload (title, description, taskType?, status?, priority?, dueDate?)
   */
  async create(userId: string, dto: TaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title ?? '',
        description: dto.description ?? '',
        ...(dto.taskType !== undefined && { taskType: dto.taskType }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        userId,
      },
    });
  }

  /**
   * @param userId - {string} authenticated user's ID (scopes tasks to owner)
   */
  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * @param userId - {string} authenticated user's ID (enforces ownership check)
   * @param taskId - {string} UUID of the task to fetch
   */
  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * @param userId - {string} authenticated user's ID (enforces ownership check)
   * @param taskId - {string} UUID of the task to update
   * @param dto - {TaskDto} partial task fields to apply (all optional: title?, description?, taskType?, status?, priority?, dueDate?)
   */
  async update(userId: string, taskId: string, dto: TaskDto): Promise<Task> {
    await this.findOne(userId, taskId);

    const completedAtUpdate = this.resolveCompletedAt(dto.status);

    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.taskType !== undefined && { taskType: dto.taskType }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...completedAtUpdate,
      },
    });
  }

  /**
   * @param userId - {string} authenticated user's ID (scopes types to owner)
   */
  async getTypes(userId: string): Promise<string[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId, taskType: { not: null } },
      select: { taskType: true },
      distinct: ['taskType'],
      orderBy: { taskType: 'asc' },
    });

    return tasks.map((t) => t.taskType as string);
  }

  /**
   * @param userId - {string} authenticated user's ID (enforces ownership check)
   * @param taskId - {string} UUID of the task to delete
   */
  async remove(userId: string, taskId: string): Promise<{ message: string }> {
    await this.findOne(userId, taskId);

    await this.prisma.task.delete({
      where: { id: taskId, userId },
    });

    return { message: 'Task deleted successfully' };
  }

  /**
   * Resolves the `status` + `completedAt` fields for an update.
   * - FINISHED → sets completedAt to now
   * - Any other status → clears completedAt (reverted from finished)
   * - undefined → no-op (status not being changed)
   *
   * @param status - incoming status from the update DTO
   */
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
