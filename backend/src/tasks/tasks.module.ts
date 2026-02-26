import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller';
import { TaskIdController } from './controller/task-id.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController, TaskIdController],
  providers: [TasksService],
})
export class TasksModule {}
