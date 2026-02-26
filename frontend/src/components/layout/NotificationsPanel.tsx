import React from 'react';
import { XMarkIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';
import type { Task, TaskPriority } from '../../types/task.types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getUpcomingTasks = (tasks: Task[]): Task[] =>
  tasks
    .filter(t => {
      if (!t.dueDate || t.status === 'FINISHED') return false;
      const days = getDaysUntilDue(t.dueDate);
      return days >= 0 && days <= 2;
    })
    .sort((a, b) => {
      const daysA = getDaysUntilDue(a.dueDate!);
      const daysB = getDaysUntilDue(b.dueDate!);
      if (daysA !== daysB) return daysA - daysB;
      const w: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return w[a.priority] - w[b.priority];
    });

const urgencyConfig: Record<number, { label: string; chipClass: string; barClass: string }> = {
  0: {
    label: 'Due Today',
    chipClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    barClass: 'bg-[#ef4444]',
  },
  1: {
    label: 'Due Tomorrow',
    chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    barClass: 'bg-[#f59e0b]',
  },
  2: {
    label: 'Due in 2 Days',
    chipClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    barClass: 'bg-[#00c48c]',
  },
};

const priorityDotClass: Record<TaskPriority, string> = {
  HIGH: 'bg-[#ef4444]',
  MEDIUM: 'bg-[#f59e0b]',
  LOW: 'bg-[#10b981]',
};

const statusLabel: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  STARTED: 'In Progress',
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { data: tasks = [] } = useTasks();
  const upcomingTasks = getUpcomingTasks(tasks);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-80 z-50 bg-white dark:bg-[#1a2535] border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl"
          >
            {/* Panel header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-[#00c48c]/10 dark:bg-[#00c48c]/20 rounded-lg">
                  <ClockIcon className="w-4 h-4 text-[#00c48c]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    Reminders
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tasks due within 2 days</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-16">
                  <div className="w-16 h-16 rounded-full bg-[#00c48c]/10 dark:bg-[#00c48c]/15 flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-[#00c48c]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    All clear!
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    No tasks are due in the next 2 days. Keep up the great work!
                  </p>
                </div>
              ) : (
                upcomingTasks.map((task, index) => {
                  const days = getDaysUntilDue(task.dueDate!);
                  const urgency = urgencyConfig[days];

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 dark:bg-[#0d1f2d] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      {/* Urgency colour bar */}
                      <div className={`h-1 w-full ${urgency.barClass}`} />

                      <div className="p-3.5">
                        {/* Title row */}
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <span
                            className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${priorityDotClass[task.priority]}`}
                          />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                            {task.title}
                          </p>
                        </div>

                        {/* Chips row */}
                        <div className="flex items-center gap-2 flex-wrap pl-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgency.chipClass}`}
                          >
                            {urgency.label}
                          </span>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                            {task.priority} · {statusLabel[task.status]}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {upcomingTasks.length > 0 && (
              <div className="px-5 py-3.5 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {upcomingTasks.length}
                  </span>{' '}
                  task{upcomingTasks.length !== 1 ? 's' : ''} need
                  {upcomingTasks.length === 1 ? 's' : ''} your attention soon
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
