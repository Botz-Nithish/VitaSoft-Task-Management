import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Task } from '../../types/task.types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionChartProps {
  tasks: Task[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ tasks }) => {
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.priority === filter);

  const counts = {
    FINISHED: filteredTasks.filter(t => t.status === 'FINISHED').length,
    STARTED: filteredTasks.filter(t => t.status === 'STARTED').length,
    NOT_STARTED: filteredTasks.filter(t => t.status === 'NOT_STARTED').length,
  };

  const total = filteredTasks.length;
  const efficiency = total > 0 ? Math.round((counts.FINISHED / total) * 100) : 0;

  const data = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [counts.FINISHED, counts.STARTED, counts.NOT_STARTED],
        backgroundColor: [
          '#2E8152', // Dark Green (Completed)
          '#0E3A24', // Very Dark Green (In Progress)
          '#CBD5E1', // Shaded Gray (Pending)
        ],
        borderWidth: 0,
        hoverOffset: 4,
        borderRadius: 20, // Curved Ends
      }
    ]
  };

  const options = {
    cutout: '75%',
    circumference: 180,
    rotation: -90,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#6b7280'
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a2535] p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Project Progress</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-sm bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-[#10B77F] focus:border-[#10B77F] block py-1.5 px-3 dark:bg-[#0d1f2d] dark:border-gray-700 dark:placeholder-gray-400 dark:text-white outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>
      
      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-4 opacity-50 dark:opacity-30">
            <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Abstract decorative circles / semi-circles */}
              <circle cx="100" cy="100" r="80" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="10 10" opacity="0.5"/>
              <path d="M40 100 A 60 60 0 0 1 160 100" stroke="#10B77F" strokeWidth="12" strokeLinecap="round" opacity="0.2"/>
              <path d="M100 160 A 60 60 0 0 1 40 100" stroke="#0E3A24" strokeWidth="12" strokeLinecap="round" opacity="0.1"/>
              {/* Central icon (Folder / Box empty) */}
              <rect x="70" y="80" width="60" height="45" rx="4" fill="currentColor" className="text-gray-300 dark:text-gray-600"/>
              <path d="M70 95 L100 110 L130 95" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="100" cy="100" r="15" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-1">No tasks found</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            There is no data available for the <span className="font-semibold">{filter.toLowerCase()}</span> priority.
          </p>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col mt-4">
          <div className="absolute inset-0 pb-10">
            <Doughnut data={data} options={options} />
          </div>
          {/* Efficiency Center Text positioned near bottom of semi-circle */}
          <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">{efficiency}%</span>
            <span className="text-sm text-gray-500 font-medium mb-8">Project Ended</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDistributionChart;
