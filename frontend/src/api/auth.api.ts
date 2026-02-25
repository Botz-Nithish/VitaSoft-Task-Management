import axiosInstance from './axiosInstance';
import type { LoginPayload, RegisterPayload, AuthUser } from '../types/auth.types';

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<AuthUser> => {
  const response = await axiosInstance.post('/auth/register', payload);
  // Registration returns same AuthUser payload for auto-login ideally
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};
