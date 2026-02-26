import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Task } from '../../types/task.types';

interface ViewTaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null;

  const priorityColors = {
    HIGH: 'bg-[#ef4444] text-white',
    MEDIUM: 'bg-[#f59e0b] text-white',
    LOW: 'bg-[#10b981] text-white'
  };

  const statusStyles = {
    FINISHED: 'bg-[#d1fae5] text-[#065f46] dark:bg-[#065f46] dark:text-[#d1fae5]',
    STARTED: 'bg-[#dbeafe] text-[#1e40af] dark:bg-[#1e40af] dark:text-[#dbeafe]',
    NOT_STARTED: 'bg-[#f3f4f6] text-[#4b5563] dark:bg-gray-700 dark:text-gray-300'
  };

  const statusLabels = {
    FINISHED: 'Finished',
    STARTED: 'In Progress',
    NOT_STARTED: 'Not Started'
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Content */}
            <motion.div
              layoutId={`task-card-${task.id}`}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a2535] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col h-full max-h-[85vh]">
                
                {/* Header Area */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md ${priorityColors[task.priority]}`}>
                        {task.priority} PRIORITY
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${statusStyles[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {task.title}
                    </h2>
                  </div>
                  
                  <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-6 py-6 overflow-y-auto flex-1">
                  <div className="prose dark:prose-invert max-w-none">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                      {task.description || <span className="italic opacity-50">No description provided.</span>}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 opacity-70" />
                    <span>Due: <strong className="text-gray-700 dark:text-gray-200 font-medium">{formatDate(task.dueDate)}</strong></span>
                  </div>
                  
                  {task.taskType && (
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">Type:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{task.taskType}</span>
                    </div>
                  )}

                  <div className="ml-auto text-xs opacity-60">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default ViewTaskModal;
