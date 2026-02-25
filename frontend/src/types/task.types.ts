export type TaskStatus = 'NOT_STARTED' | 'STARTED' | 'FINISHED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string;
  taskType: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  taskType?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  taskType?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
