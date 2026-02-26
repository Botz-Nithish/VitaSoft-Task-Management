import React, { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks'; // adjusted path
import { useTaskTypes } from '../../hooks/useTaskTypes';
import { useToast } from '../../context/ToastContext';
import type { Task, TaskPriority, TaskStatus } from '../../types/task.types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline'; // adjusted for standard usage
import uiText from '../../data.json';

interface CreateEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

const CreateEditTaskModal: React.FC<CreateEditTaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { data: taskTypes = [] } = useTaskTypes();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { addToast } = useToast();

  const isEditMode = !!taskToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('NOT_STARTED');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setTaskType(taskToEdit.taskType || '');
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setTaskType('');
        setPriority('MEDIUM');
        setStatus('NOT_STARTED');
        setDueDate('');
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Date (Cannot be in the past)
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        addToast('Past dates are not allowed for Task Timelines.', 'error');
        return;
      }
    }

    // Normalize payload
    const payload = {
      title,
      description,
      priority,
      status,
      ...(taskType && { taskType }),
      ...(dueDate && { dueDate: new Date(dueDate).toISOString() })
    };

    if (isEditMode && taskToEdit) {
      updateTask.mutate({ id: taskToEdit.id, payload }, {
        onSuccess: () => {
          addToast('Task updated successfully', 'success');
          onClose();
        },
        onError: () => addToast('Failed to update task', 'error')
      });
    } else {
      createTask.mutate(payload, {
        onSuccess: () => {
          addToast('Task created successfully', 'success');
          onClose();
        },
        onError: () => addToast('Failed to create task', 'error')
      });
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-[#1a2535] rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isEditMode ? uiText.tasks.modals.edit.title : uiText.tasks.modals.create.title}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-6 w-full">
                
                <Input
                  label={uiText.tasks.fields.title}
                  placeholder={uiText.tasks.fields.titlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                {/* Combobox logic for TYPE */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {uiText.tasks.fields.type}
                  </label>
                  <input
                    type="text"
                    list="task-types"
                    placeholder="e.g. Bug Fix"
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2535] text-gray-900 dark:text-white focus:border-[#00c48c] focus:ring-2 focus:ring-[#00c48c]/20 outline-none transition-colors"
                  />
                  <datalist id="task-types">
                    {taskTypes.map((type: string) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>

                {/* segmented toggle for PRIORITY */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {uiText.tasks.fields.priority}
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
                    {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                          priority === p 
                            ? 'bg-white dark:bg-[#1a2535] text-[#00c48c] shadow-sm border border-gray-200 dark:border-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>



                {/* Timelines - simplified to end date equivalent to Due Date */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {uiText.tasks.fields.dueDate}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2535] text-gray-900 dark:text-white focus:border-[#00c48c] focus:ring-2 focus:ring-[#00c48c]/20 outline-none transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-400">Maps to the due date of the task.</p>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {uiText.tasks.fields.description}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={uiText.tasks.fields.descriptionPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2535] text-gray-900 dark:text-white focus:border-[#00c48c] focus:ring-2 focus:ring-[#00c48c]/20 outline-none resize-none transition-colors"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {uiText.tasks.fields.status}
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
                    {[
                      { value: 'NOT_STARTED', label: uiText.filters.status.pending },
                      { value: 'STARTED', label: uiText.filters.status.inProgress },
                      { value: 'FINISHED', label: uiText.filters.status.completed }
                    ].map((s) => (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => setStatus(s.value as TaskStatus)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                          status === s.value 
                            ? 'bg-white dark:bg-[#1a2535] text-[#00c48c] shadow-sm border border-gray-200 dark:border-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex justify-end space-x-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-b-2xl">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                {uiText.tasks.modals.delete.cancel.toUpperCase()}
              </Button>
              <Button type="submit" form="task-form" isLoading={isLoading}>
                {isEditMode ? uiText.tasks.modals.edit.submit.toUpperCase() : uiText.tasks.modals.create.submit.toUpperCase()}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateEditTaskModal;
