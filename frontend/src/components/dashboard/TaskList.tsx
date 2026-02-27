import React from 'react';
import type { Task, TaskStatus } from '../../types/task.types';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  onAddFirst: () => void;
  isBulkMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  hasActiveFilters?: boolean;
  activeFilterSummary?: string;
}

// Empty state SVG illustration
const EmptyDeskSVG = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6 drop-shadow-md">
    {/* Desk */}
    <rect x="30" y="140" width="140" height="8" rx="4" className="fill-[#cbd5e1] dark:fill-[#334155]" />
    <rect x="40" y="148" width="8" height="40" rx="4" className="fill-[#94a3b8] dark:fill-[#475569]" />
    <rect x="152" y="148" width="8" height="40" rx="4" className="fill-[#94a3b8] dark:fill-[#475569]" />

    {/* Laptop */}
    <rect x="70" y="100" width="60" height="40" rx="4" className="fill-[#e2e8f0] dark:fill-[#1e293b]" />
    <rect x="75" y="105" width="50" height="30" rx="2" fill="#0d1f2d" />

    {/* Coffee cup */}
    <rect x="140" y="125" width="12" height="15" rx="2" fill="#00c48c" opacity="0.8" />
    <path d="M152 128 C156 128, 156 136, 152 136" fill="none" stroke="#00c48c" strokeWidth="2" />

    {/* Floating elements indicating emptiness/clean slate */}
    <circle cx="50" cy="60" r="15" className="fill-[#f1f5f9] dark:fill-[#0f172a]" />
    <circle cx="160" cy="80" r="10" className="fill-[#f1f5f9] dark:fill-[#0f172a]" />
    <path d="M80 50 Q100 20 120 50" fill="none" stroke="#00c48c" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
  </svg>
);

const TaskList: React.FC<TaskListProps> = ({
  tasks, onEdit, onView, onDelete, onStatusChange, onAddFirst,
  isBulkMode = false, selectedIds, onToggleSelect,
  hasActiveFilters = false, activeFilterSummary = ''
}) => {
  if (tasks.length === 0) {
    if (hasActiveFilters) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1a2535] border border-gray-100 dark:border-gray-800 rounded-xl"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FunnelIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching tasks</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm text-center max-w-xs">
            {activeFilterSummary
              ? `No tasks found for ${activeFilterSummary}`
              : 'Try adjusting your filters or search query'}
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1a2535] border border-gray-100 dark:border-gray-800 rounded-xl"
      >
        <EmptyDeskSVG />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Create your first task to get started.</p>
        <Button onClick={onAddFirst} className="px-6 py-2.5">
          + Add Task
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isBulkMode={isBulkMode}
          isSelected={selectedIds?.has(task.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default TaskList;
