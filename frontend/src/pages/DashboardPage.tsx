import React, { useState, useMemo } from 'react';
import { useTasks, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatsCard from '../components/dashboard/StatsCard';
import VelocityChart from '../components/dashboard/VelocityChart';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import TaskList from '../components/dashboard/TaskList';
import TaskFilters from '../components/dashboard/TaskFilters';
import CreateEditTaskModal from '../components/tasks/CreateEditTaskModal';
import ViewTaskModal from '../components/tasks/ViewTaskModal';
import type { Task, TaskStatus } from '../types/task.types';
import uiText from '../data.json';
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
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);

  // Sorting and Filtering State
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('CREATED_DESC');

  const finishedCount = tasks.filter(t => t.status === 'FINISHED').length;
  const startedCount = tasks.filter(t => t.status === 'STARTED').length;
  const notStartedCount = tasks.filter(t => t.status === 'NOT_STARTED').length;
  const totalTasks = tasks.length;

  // Apply Filtering and Sorting
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Filter by Status (Multi-select)
    if (statusFilters.length > 0) {
      result = result.filter(t => statusFilters.includes(t.status));
    }

    // 2. Filter by Priority (Multi-select)
    if (priorityFilters.length > 0) {
      result = result.filter(t => priorityFilters.includes(t.priority));
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'CREATED_DESC':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'CREATED_ASC':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'DUE_DATE_ASC':
          // Push null due dates to the bottom
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'PRIORITY':
          const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, statusFilters, priorityFilters, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-b-2 border-[#00c48c]"></div>
      </div>
    );
  }

  const handleOpenCreateMode = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditMode = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleOpenViewMode = (task: Task) => {
    setViewingTask(task);
    setIsViewModalOpen(true);
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

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, payload: { status: newStatus } }, {
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
          title={uiText.dashboard.stats.total} 
          count={totalTasks} 
          icon={<ClipboardDocumentListIcon className="w-8 h-8" />} 
          isPrimary 
        />
        <StatsCard 
          title={uiText.dashboard.stats.finished} 
          count={finishedCount} 
          total={totalTasks} 
          colorClass="bg-[#d1fae5] text-[#065f46]"
          icon={<CheckCircleIcon className="w-8 h-8" />} 
        />
        <StatsCard 
          title={uiText.dashboard.stats.inProgress}
          count={startedCount} 
          total={totalTasks} 
          colorClass="bg-[#dbeafe] text-[#1e40af]"
          icon={<ClockIcon className="w-8 h-8" />} 
        />
        <StatsCard 
          title={uiText.dashboard.stats.notStarted}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4 sm:mt-0">{uiText.dashboard.sections.workstreams}</h2>
          
          {totalTasks > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <TaskFilters
                statusFilters={statusFilters}
                priorityFilters={priorityFilters}
                sortBy={sortBy}
                onStatusChange={setStatusFilters}
                onPriorityChange={setPriorityFilters}
                onSortChange={setSortBy}
              />
              <Button onClick={handleOpenCreateMode} className="ml-auto sm:ml-2">
                {uiText.dashboard.buttons.addTask}
              </Button>
            </div>
          )}
        </div>
        <TaskList 
          tasks={processedTasks} 
          onEdit={handleOpenEditMode} 
          onView={handleOpenViewMode}
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

      <ViewTaskModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        task={viewingTask}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={uiText.tasks.modals.delete.title}
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteTask.isPending}
      />

    </div>
  );
};

export default DashboardPage;
