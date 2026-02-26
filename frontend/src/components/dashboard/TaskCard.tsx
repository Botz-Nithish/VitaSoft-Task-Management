import React from 'react';
import type { Task } from '../../types/task.types';
import { EllipsisVerticalIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: import('../../types/task.types').TaskStatus) => void;
}

const formatDueDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onView, onDelete, onStatusChange }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const outerColors = {
    HIGH: 'bg-[#ef4444]/10 dark:bg-[#ef4444]/15 shadow-sm',
    MEDIUM: 'bg-[#f59e0b]/10 dark:bg-[#f59e0b]/15 shadow-sm',
    LOW: 'bg-[#10b981]/10 dark:bg-[#10b981]/15 shadow-sm'
  };

  const accentColors = {
    HIGH: 'text-[#ef4444]',
    MEDIUM: 'text-[#f59e0b]',
    LOW: 'text-[#10b981]'
  };

  const dotColors = {
    HIGH: 'bg-[#ef4444]',
    MEDIUM: 'bg-[#f59e0b]',
    LOW: 'bg-[#10b981]'
  };

  const statusStyles = {
    FINISHED: 'bg-[#d1fae5] text-[#065f46] dark:bg-[#065f46]/20 dark:text-[#a7f3d0]',
    STARTED: 'bg-[#dbeafe] text-[#1e40af] dark:bg-[#1e40af]/20 dark:text-[#bfdbfe]',
    NOT_STARTED: 'bg-[#f3f4f6] text-[#6b7280] dark:bg-gray-800 dark:text-gray-300'
  };

  const statusLabels = {
    FINISHED: 'Finished',
    STARTED: 'In Progress',
    NOT_STARTED: 'Not Started'
  };

  return (
    <motion.div 
      layoutId={`task-card-${task.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onView(task)}
      className={`rounded-2xl p-[6px] pt-0 ${outerColors[task.priority]} hover:shadow-md transition-shadow relative flex flex-col cursor-pointer`}
    >
      <div className="flex items-center space-x-2.5 px-3 py-3">
        <span className={`w-3.5 h-3.5 rounded-full ${dotColors[task.priority]}`} />
        <span className={`text-xs font-bold tracking-widest uppercase ${accentColors[task.priority]}`}>
          {task.priority === 'HIGH' ? 'HIGH PRIORITY' : `${task.priority} PRIORITY`}
        </span>
      </div>
      
      <div className="bg-white dark:bg-[#1a2535] rounded-[14px] p-5 flex flex-col flex-1 shadow-sm h-full">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate pr-4">
            {task.title}
          </h4>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors relative z-20"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div 
              className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(task); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit Task
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div 
            className="relative inline-block hover:opacity-90 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <select
              value={task.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange?.(task, e.target.value as any);
              }}
              className={`text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer appearance-none outline-none border border-transparent shadow-sm dark:shadow-none hover:shadow ${statusStyles[task.status]}`}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium">
                  {label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
          </div>
          {task.taskType && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              {task.taskType}
            </span>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            {formatDueDate(task.dueDate)}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
