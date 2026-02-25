import axiosInstance from './axiosInstance';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export const getTaskTypes = async (): Promise<string[]> => {
  const response = await axiosInstance.get('/tasks/types');
  return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get('/tasks');
  return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await axiosInstance.post('/tasks', payload);
  return response.data;
};

export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  const response = await axiosInstance.patch(`/tasks/${id}`, payload);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/tasks/${id}`);
};
