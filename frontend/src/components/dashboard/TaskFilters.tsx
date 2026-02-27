import React, { useState } from 'react';
import { FunnelIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';
import uiText from '../../data.json';

interface TaskFiltersProps {
  statusFilters: string[];
  priorityFilters: string[];
  sortBy?: string;
  onStatusChange: (statusFilters: string[]) => void;
  onPriorityChange: (priorityFilters: string[]) => void;
  onSortChange?: (sortBy: string) => void;
  showSort?: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ 
  statusFilters, 
  priorityFilters, 
  sortBy, 
  onStatusChange, 
  onPriorityChange,
  onSortChange,
  showSort = true
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0;

  const toggleStatusFilter = (status: string) => {
    onStatusChange(
      statusFilters.includes(status)
        ? statusFilters.filter(s => s !== status)
        : [...statusFilters, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    onPriorityChange(
      priorityFilters.includes(priority)
        ? priorityFilters.filter(p => p !== priority)
        : [...priorityFilters, priority]
    );
  };

  const handleSingleStatusOverride = (val: string) => {
    if (val === 'ALL') onStatusChange([]);
    else if (val !== 'MULTIPLE') onStatusChange([val]);
  };

  const handleSinglePriorityOverride = (val: string) => {
    if (val === 'ALL') onPriorityChange([]);
    else if (val !== 'MULTIPLE') onPriorityChange([val]);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Unified Multi-Select Filter Popover */}
      <div className="relative">
        <button
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          onBlur={() => setTimeout(() => setIsFilterMenuOpen(false), 200)}
          className={`flex items-center justify-center p-2.5 bg-white dark:bg-[#1a2535] border rounded-lg shadow-sm transition-colors ${
            hasActiveFilters 
              ? 'border-[#00c48c] text-[#00c48c] dark:border-[#00c48c] bg-[#00c48c]/5' 
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700'
          }`}
          title="Advanced Multi-Filter"
        >
          <FunnelIcon className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#00c48c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#1a2535]">
              {statusFilters.length + priorityFilters.length}
            </span>
          )}
        </button>

        {isFilterMenuOpen && (
          <div 
            className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-white dark:bg-[#1a2535] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{uiText.filters.status.title}</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: 'NOT_STARTED', label: uiText.filters.status.pending },
                  { id: 'STARTED', label: uiText.filters.status.inProgress },
                  { id: 'FINISHED', label: uiText.filters.status.completed },
                  { id: 'OVERDUE', label: uiText.filters.status.overdue }
                ].map(status => (
                  <label key={status.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={statusFilters.includes(status.id)}
                      onChange={() => toggleStatusFilter(status.id)}
                      className="w-4 h-4 text-[#00c48c] rounded border-gray-300 dark:border-gray-600 focus:ring-[#00c48c] focus:ring-opacity-50 transition-colors"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-[#0d1f2d]/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{uiText.filters.priority.title}</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: 'HIGH', label: uiText.filters.priority.high, color: 'text-red-500' },
                  { id: 'MEDIUM', label: uiText.filters.priority.medium, color: 'text-amber-500' },
                  { id: 'LOW', label: uiText.filters.priority.low, color: 'text-green-500' }
                ].map(priority => (
                  <label key={priority.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={priorityFilters.includes(priority.id)}
                      onChange={() => togglePriorityFilter(priority.id)}
                      className="w-4 h-4 text-[#00c48c] rounded border-gray-300 dark:border-gray-600 focus:ring-[#00c48c] focus:ring-opacity-50 transition-colors"
                    />
                    <span className={`text-sm font-medium transition-colors ${priorityFilters.includes(priority.id) ? priority.color : 'text-gray-700 dark:text-gray-300'}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
                <button 
                  onClick={() => { onStatusChange([]); onPriorityChange([]); setIsFilterMenuOpen(false); }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors uppercase tracking-wider"
                >
                  {uiText.filters.clearAll}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Dropdown (Single-Select Override) */}
      <div className="flex items-center bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
        <select 
          value={statusFilters.length === 0 ? 'ALL' : statusFilters.length === 1 ? statusFilters[0] : 'MULTIPLE'}
          onChange={(e) => handleSingleStatusOverride(e.target.value)}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-300 py-2.5 px-3 outline-none cursor-pointer appearance-none pr-8 relative min-w-[120px]"
          style={{ background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.5rem center/1.5rem 1.5rem` }}
        >
          <option value="ALL">{uiText.filters.status.all}</option>
          <option value="NOT_STARTED">{uiText.filters.status.pending}</option>
          <option value="STARTED">{uiText.filters.status.inProgress}</option>
          <option value="FINISHED">{uiText.filters.status.completed}</option>
          <option value="OVERDUE">{uiText.filters.status.overdue}</option>
          {statusFilters.length > 1 && <option value="MULTIPLE" disabled>{uiText.filters.multipleSelected}</option>}
        </select>
      </div>

      {/* Priority Dropdown (Single-Select Override) */}
      <div className="flex items-center bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
          <select 
          value={priorityFilters.length === 0 ? 'ALL' : priorityFilters.length === 1 ? priorityFilters[0] : 'MULTIPLE'}
          onChange={(e) => handleSinglePriorityOverride(e.target.value)}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-300 py-2.5 px-3 outline-none cursor-pointer appearance-none pr-8 relative min-w-[130px]"
          style={{ background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.5rem center/1.5rem 1.5rem` }}
        >
          <option value="ALL">{uiText.filters.priority.all}</option>
          <option value="HIGH">{uiText.filters.priority.high}</option>
          <option value="MEDIUM">{uiText.filters.priority.medium}</option>
          <option value="LOW">{uiText.filters.priority.low}</option>
          {priorityFilters.length > 1 && <option value="MULTIPLE" disabled>{uiText.filters.multipleSelected}</option>}
        </select>
      </div>

      {/* Sort By Dropdown */}
      {showSort && onSortChange && (
        <div className="flex items-center bg-white dark:bg-[#1a2535] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
          <div className="px-3 text-gray-400 border-r border-gray-200 dark:border-gray-700 hidden sm:block">
            <BarsArrowDownIcon className="w-4 h-4" />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 py-2.5 px-3 outline-none cursor-pointer appearance-none pr-8 relative min-w-[120px]"
            style={{ background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.5rem center/1.5rem 1.5rem` }}
          >
            <option value="CREATED_DESC">{uiText.filters.sort.newest}</option>
            <option value="CREATED_ASC">{uiText.filters.sort.oldest}</option>
            <option value="DUE_DATE_ASC">{uiText.filters.sort.dueDate}</option>
            <option value="PRIORITY">{uiText.filters.sort.priority}</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
