import React, { useState } from 'react';
import { useTasks, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatsCard from '../components/dashboard/StatsCard';
import VelocityChart from '../components/dashboard/VelocityChart';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import TaskList from '../components/dashboard/TaskList';
import CreateEditTaskModal from '../components/tasks/CreateEditTaskModal';
import type { Task } from '../types/task.types';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  InboxIcon 
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-b-2 border-[#00c48c]"></div>
      </div>
    );
  }

  const finishedCount = tasks.filter(t => t.status === 'FINISHED').length;
  const startedCount = tasks.filter(t => t.status === 'STARTED').length;
  const notStartedCount = tasks.filter(t => t.status === 'NOT_STARTED').length;
  const totalTasks = tasks.length;

  const handleOpenCreateMode = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditMode = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(undefined);
          addToast('Task deleted successfully', 'success');
        }
      });
    }
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTask.mutate({ id: task.id, payload: { status: newStatus as any } }, {
      onSuccess: () => {
        addToast(`Task status updated to ${newStatus.replace('_', ' ')}`, 'success');
      },
      onError: () => {
        addToast('Failed to update task status', 'error');
      }
    });
  };

  return (
    <div className="space-y-8 pb-10 flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Tasks" 
          count={totalTasks} 
          icon={<ClipboardDocumentListIcon className="w-8 h-8" />} 
          isPrimary 
        />
        <StatsCard 
          title="Finished" 
          count={finishedCount} 
          total={totalTasks} 
          colorClass="bg-[#d1fae5] text-[#065f46]"
          icon={<CheckCircleIcon className="w-8 h-8" />} 
        />
        <StatsCard 
          title="Started" 
          count={startedCount} 
          total={totalTasks} 
          colorClass="bg-[#dbeafe] text-[#1e40af]"
          icon={<ClockIcon className="w-8 h-8" />} 
        />
        <StatsCard 
          title="Not Started" 
          count={notStartedCount} 
          total={totalTasks} 
          colorClass="bg-[#f3f4f6] text-[#6b7280]"
          icon={<InboxIcon className="w-8 h-8" />} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VelocityChart tasks={tasks} />
        </div>
        <div>
          <StatusDistributionChart tasks={tasks} />
        </div>
      </div>

      {/* Task List Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Active Workstreams</h2>
          {totalTasks > 0 && (
            <Button onClick={handleOpenCreateMode} className="mt-4">
              + Add Task
            </Button>
          )}
        </div>
        <TaskList 
          tasks={tasks} 
          onEdit={handleOpenEditMode} 
          onDelete={handleDeleteRequest} 
          onStatusChange={handleStatusChange}
          onAddFirst={handleOpenCreateMode}
        />
      </div>

      <CreateEditTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={editingTask}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteTask.isPending}
      />

    </div>
  );
};

export default DashboardPage;
