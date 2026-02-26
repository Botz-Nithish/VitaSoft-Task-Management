import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types/task.types';
import CreateEditTaskModal from '../components/tasks/CreateEditTaskModal';
import ViewTaskModal from '../components/tasks/ViewTaskModal';
import TaskFilters from '../components/dashboard/TaskFilters';
import Button from '../components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import uiText from '../data.json';

// Blank Calendar SVG for Empty State
const BlankCalendarSVG = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto mb-6 drop-shadow-md">
    <rect x="40" y="50" width="120" height="110" rx="8" className="fill-[#1a2535] stroke-[#e2e8f0] dark:stroke-[#334155] stroke-[2px] opacity-90" />
    <path d="M40 80 L160 80" className="stroke-[#e2e8f0] dark:stroke-[#334155] stroke-[2px]" />
    <rect x="60" y="35" width="12" height="30" rx="4" fill="#ef4444" />
    <rect x="128" y="35" width="12" height="30" rx="4" fill="#ef4444" />
    
    <rect x="60" y="100" width="20" height="20" rx="4" fill="#00c48c" opacity="0.2" />
    <rect x="90" y="100" width="20" height="20" rx="4" fill="#00c48c" opacity="0.2" />
    <rect x="120" y="100" width="20" height="20" rx="4" fill="#00c48c" opacity="0.2" />
    
    <rect x="60" y="130" width="20" height="20" rx="4" fill="#00c48c" opacity="0.2" />
    <rect x="90" y="130" width="20" height="20" rx="4" fill="#14b8a6" opacity="0.8" />
    <circle cx="100" cy="140" r="4" fill="#fff" />
  </svg>
);

const CalendarPage: React.FC = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);

  // Filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);

  // Filter tasks that have a dueDate
  const scheduledTasks = useMemo(() => {
    let result = tasks.filter(t => t.dueDate);
    
    // Status Filter (Multi-select)
    if (statusFilters.length > 0) {
      result = result.filter(t => statusFilters.includes(t.status));
    }

    // Priority Filter (Multi-select)
    if (priorityFilters.length > 0) {
      result = result.filter(t => priorityFilters.includes(t.priority));
    }

    return result;
  }, [tasks, statusFilters, priorityFilters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-b-2 border-[#00c48c]"></div>
      </div>
    );
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskClick = (task: Task) => {
    setViewingTask(task);
    setIsViewModalOpen(true);
  };

  const handleOpenCreateMode = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate grid cells
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // empty cells
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const statusColors: Record<string, string> = {
    FINISHED: 'bg-[#10b981] border-[#059669]',
    STARTED: 'bg-[#3b82f6] border-[#2563eb]',
    NOT_STARTED: 'bg-[#9ca3af] border-[#6b7280]'
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white min-w-[180px]">
            {monthName}
          </h2>
          <div className="flex items-center space-x-1 bg-white dark:bg-[#1a2535] rounded-lg border border-gray-200 dark:border-gray-800 p-1">
            <button onClick={handlePrevMonth} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-3 mt-4 sm:mt-0">
          <TaskFilters
            statusFilters={statusFilters}
            priorityFilters={priorityFilters}
            onStatusChange={setStatusFilters}
            onPriorityChange={setPriorityFilters}
            showSort={false}
          />
          <Button onClick={handleOpenCreateMode} className="ml-auto sm:ml-2">
            {uiText.dashboard.buttons.addTask}
          </Button>
        </div>
      </div>

      {scheduledTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1a2535] border border-gray-100 dark:border-gray-800 rounded-xl"
        >
          <BlankCalendarSVG />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nothing scheduled</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Tasks with a due date will appear here.</p>
          <Button onClick={handleOpenCreateMode} className="px-6 py-2.5">
            {uiText.dashboard.buttons.addTask}
          </Button>
        </motion.div>
      ) : (
        <div className="flex-1 bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1f2d]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="border-b border-r border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20 p-2 opacity-50"></div>;
              }

              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              
              // Find tasks for this day
              const dayTasks = scheduledTasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.getDate() === day && 
                       taskDate.getMonth() === currentDate.getMonth() && 
                       taskDate.getFullYear() === currentDate.getFullYear();
              });

              return (
                <div key={day} className={`border-b border-r border-gray-100 dark:border-gray-800/50 p-1 md:p-2 min-h-[100px] flex flex-col ${isToday ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                  <div className={`text-right mb-1 ${isToday ? 'font-bold text-[#00c48c]' : 'text-gray-500 dark:text-gray-400 text-sm font-medium'}`}>
                    <span className={isToday ? 'bg-[#00c48c] text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs' : ''}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-1 overflow-y-auto pr-1 no-scrollbar">
                    {dayTasks.map(task => (
                      <motion.div 
                        layoutId={`task-card-${task.id}`}
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`text-xs px-2 py-1 rounded border shadow-sm cursor-pointer truncate text-white transition-opacity hover:opacity-80 ${statusColors[task.status] || 'bg-gray-500'}`}
                        title={task.title}
                      >
                        {task.status === 'FINISHED' ? '✓ ' : ''}{task.title}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CalendarPage;
