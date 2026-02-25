import { useQuery } from '@tanstack/react-query';
import { getTaskTypes } from '../api/tasks.api';

export const useTaskTypes = () => {
  return useQuery({
    queryKey: ['taskTypes'],
    queryFn: getTaskTypes,
  });
};
