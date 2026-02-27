import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  InboxIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { useKeybinds } from '../context/KeybindsContext';

const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

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

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Bulk Actions
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { keybinds } = useKeybinds();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key.toLowerCase() === keybinds.newTask.toLowerCase()) {
        setEditingTask(undefined);
        setIsModalOpen(true);
      }
      if (e.key === keybinds.focusSearch) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === keybinds.closeModal) {
        setIsModalOpen(false);
        setIsViewModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [keybinds]);

  const finishedCount = tasks.filter(t => t.status === 'FINISHED').length;
  const startedCount = tasks.filter(t => t.status === 'STARTED').length;
  const notStartedCount = tasks.filter(t => t.status === 'NOT_STARTED').length;
  const totalTasks = tasks.length;

  // 5.1 Average completion time
  const avgCompletionDays = useMemo(() => {
    const finished = tasks.filter(t => t.status === 'FINISHED' && t.completedAt);
    if (finished.length === 0) return null;
    const totalMs = finished.reduce((sum, t) => {
      return sum + (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime());
    }, 0);
    const days = totalMs / finished.length / (1000 * 60 * 60 * 24);
    return Math.round(days * 10) / 10;
  }, [tasks]);

  // 5.2 Completion streak (consecutive days with ≥1 task completed, going back from today)
  const completionStreak = useMemo(() => {
    const completedDays = new Set(
      tasks
        .filter(t => t.status === 'FINISHED' && t.completedAt)
        .map(t => {
          const d = new Date(t.completedAt!);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    );
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = today.getTime();
    while (completedDays.has(cursor)) {
      streak++;
      cursor -= 86_400_000;
    }
    return streak;
  }, [tasks]);

  // Apply Filtering and Sorting
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Filter by Status (supports OVERDUE virtual status)
    if (statusFilters.length > 0) {
      const hasOverdue = statusFilters.includes('OVERDUE');
      const realStatuses = statusFilters.filter(s => s !== 'OVERDUE');
      if (hasOverdue && realStatuses.length > 0) {
        result = result.filter(t =>
          realStatuses.includes(t.status) ||
          (t.dueDate && t.status !== 'FINISHED' && getDaysUntilDue(t.dueDate) < 0)
        );
      } else if (hasOverdue) {
        result = result.filter(t =>
          t.dueDate && t.status !== 'FINISHED' && getDaysUntilDue(t.dueDate) < 0
        );
      } else {
        result = result.filter(t => realStatuses.includes(t.status));
      }
    }

    // 2. Filter by Priority (Multi-select)
    if (priorityFilters.length > 0) {
      result = result.filter(t => priorityFilters.includes(t.priority));
    }

    // 3. Search (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.taskType?.toLowerCase().includes(q) ?? false)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'CREATED_DESC':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'CREATED_ASC':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'DUE_DATE_ASC':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'PRIORITY': {
          const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, statusFilters, priorityFilters, sortBy, debouncedSearch]);

  // 6.4 Contextual empty state
  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0 || debouncedSearch.trim().length > 0;
  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (statusFilters.length > 0) {
      const labels: Record<string, string> = {
        NOT_STARTED: 'Not Started', STARTED: 'In Progress',
        FINISHED: 'Finished', OVERDUE: 'Overdue',
      };
      parts.push(statusFilters.map(s => labels[s] ?? s).join(' or '));
    }
    if (priorityFilters.length > 0) {
      parts.push(`${priorityFilters.join(' or ')} priority`);
    }
    if (debouncedSearch.trim()) {
      parts.push(`matching "${debouncedSearch}"`);
    }
    return parts.join(', ');
  }, [statusFilters, priorityFilters, debouncedSearch]);

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

  // 6.1 Bulk action handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = (status: TaskStatus) => {
    const ids = Array.from(selectedIds);
    ids.forEach(id => updateTask.mutate({ id, payload: { status } }));
    addToast(`${ids.length} task${ids.length !== 1 ? 's' : ''} updated`, 'success');
    setSelectedIds(new Set());
    setIsBulkMode(false);
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    ids.forEach(id => deleteTask.mutate(id));
    addToast(`${ids.length} task${ids.length !== 1 ? 's' : ''} deleted`, 'success');
    setSelectedIds(new Set());
    setIsBulkMode(false);
  };

  const handleToggleBulkMode = () => {
    setIsBulkMode(prev => !prev);
    setSelectedIds(new Set());
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
          icon={<CheckCircleIcon className="w-8 h-8 text-[#00c48c]" />}
        />
        <StatsCard
          title={uiText.dashboard.stats.inProgress}
          count={startedCount}
          total={totalTasks}
          colorClass="bg-[#dbeafe] text-[#1e40af]"
          icon={<ClockIcon className="w-8 h-8 text-[#00c48c]" />}
        />
        <StatsCard
          title={uiText.dashboard.stats.notStarted}
          count={notStartedCount}
          total={totalTasks}
          colorClass="bg-[#f3f4f6] text-[#6b7280]"
          icon={<InboxIcon className="w-8 h-8 text-[#00c48c]" />}
        />
      </div>

      {/* 5.1 + 5.2 Insights Row */}
      {(avgCompletionDays !== null || completionStreak > 0) && (
        <div className="flex flex-wrap gap-3">
          {avgCompletionDays !== null && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <div className="p-1.5 bg-[#00c48c]/10 dark:bg-[#00c48c]/15 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-[#00c48c]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mb-0.5">Avg. completion</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {avgCompletionDays} day{avgCompletionDays !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
          {completionStreak > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FireIcon className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mb-0.5">Completion streak</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {completionStreak}-day streak
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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
              {/* 3.1 Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={uiText.filters.search.placeholder}
                  className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-[#00c48c]/40 focus:border-[#00c48c] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 w-48 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <TaskFilters
                statusFilters={statusFilters}
                priorityFilters={priorityFilters}
                sortBy={sortBy}
                onStatusChange={setStatusFilters}
                onPriorityChange={setPriorityFilters}
                onSortChange={setSortBy}
              />

              {/* 6.1 Bulk select toggle */}
              <button
                onClick={handleToggleBulkMode}
                title="Select tasks for bulk actions"
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                  isBulkMode
                    ? 'bg-[#00c48c] text-white border-[#00c48c]'
                    : 'bg-white dark:bg-[#1a2535] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm'
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                Select
              </button>

              <Button onClick={handleOpenCreateMode} className="ml-auto sm:ml-0">
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
          isBulkMode={isBulkMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          hasActiveFilters={hasActiveFilters}
          activeFilterSummary={activeFilterSummary}
        />
      </div>

      {/* 6.1 Floating Bulk Action Bar */}
      <AnimatePresence>
        {isBulkMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0d1f2d] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl"
          >
            <span className="text-gray-900 dark:text-white text-sm font-semibold pr-3 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => handleBulkStatus('FINISHED')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00c48c] hover:bg-[#00b07a] rounded-lg transition-colors whitespace-nowrap"
            >
              Mark Finished
            </button>
            <button
              onClick={() => handleBulkStatus('STARTED')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Mark Started
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
