import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Task } from '../../types/task.types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionChartProps {
  tasks: Task[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ tasks }) => {
  const counts = {
    FINISHED: tasks.filter(t => t.status === 'FINISHED').length,
    STARTED: tasks.filter(t => t.status === 'STARTED').length,
    NOT_STARTED: tasks.filter(t => t.status === 'NOT_STARTED').length,
  };

  const total = tasks.length;
  const efficiency = total > 0 ? Math.round((counts.FINISHED / total) * 100) : 0;

  const data = {
    labels: ['Finished', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [counts.FINISHED, counts.STARTED, counts.NOT_STARTED],
        backgroundColor: [
          '#10b981', // green / finished
          '#3b82f6', // blue / started
          '#ad993cff', // gray / not started
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    cutout: '75%',
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
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      ) : (
        <div className="relative flex-1">
          <Doughnut data={data} options={options} />
          {/* Efficiency Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{efficiency}%</span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Efficiency</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDistributionChart;
