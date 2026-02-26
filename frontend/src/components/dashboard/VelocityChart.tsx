import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Task } from '../../types/task.types';
import uiText from '../../data.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface VelocityChartProps {
  tasks: Task[];
}

const VelocityChart: React.FC<VelocityChartProps> = ({ tasks }) => {
  const [view, setView] = useState<'W' | 'M' | 'Y'>('W');
  
  // Calculate historical data based on view
  const completedTasks = tasks.filter(t => t.status === 'FINISHED' && t.completedAt);
  
  let daysToLookBack = 7;
  if(view === 'M') daysToLookBack = 30;
  if(view === 'Y') daysToLookBack = 365;

  const labels: string[] = [];
  const dataPoints: number[] = [];

  for (let i = daysToLookBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    
    // Formatting label
    let label = '';
    if (view === 'W') {
      label = d.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (view === 'M') {
      label = d.getDate().toString();
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short' });
      // To compress year view, we'd normally group by month instead of 365 days.
      // For simplicity in this demo, let's group by month if view === 'Y'
    }

    if (view !== 'Y') {
      labels.push(label);
      let count = 0;
      completedTasks.forEach(task => {
        const completedDate = new Date(task.completedAt!);
        completedDate.setHours(0,0,0,0);
        if(completedDate.getTime() === d.getTime()) {
          count++;
        }
      });
      dataPoints.push(count);
    }
  }

  // Handle year grouping properly
  if (view === 'Y') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
      
      let count = 0;
      completedTasks.forEach(task => {
        const completedDate = new Date(task.completedAt!);
        if (completedDate.getMonth() === d.getMonth() && completedDate.getFullYear() === d.getFullYear()) {
          count++;
        }
      });
      dataPoints.push(count);
    }
  }

  const noCompletedData = completedTasks.length === 0;

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: uiText.charts.velocity.completedTasks,
        data: dataPoints,
        borderColor: '#00c48c',
        backgroundColor: 'rgba(0, 196, 140, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#00c48c',
        borderWidth: 2,
        pointRadius: noCompletedData ? 0 : 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      }
    },
    scales: {
      y: { display: false, min: 0, suggestedMax: 5 },
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#9ca3af' }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a2535] p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white">{uiText.charts.velocity.title}</h3>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          {['W', 'M', 'Y'].map(t => (
            <button
              key={t}
              onClick={() => setView(t as any)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                view === t 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative flex-1">
        <Line data={data} options={options} />
        {noCompletedData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-medium text-gray-400 bg-white/80 dark:bg-[#1a2535]/80 px-4 py-2 rounded-lg backdrop-blur-sm">
              No completed tasks yet
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VelocityChart;
