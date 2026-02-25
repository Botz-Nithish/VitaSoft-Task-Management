import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  total?: number;
  colorClass: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, total, colorClass, icon, isPrimary }) => {
  const percentage = total && total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={`p-6 rounded-xl border flex items-start justify-between transition-shadow hover:shadow-sm ${
      isPrimary 
        ? 'bg-[#00c48c] border-[#00c48c] text-white' 
        : 'bg-white dark:bg-[#1a2535] border-gray-100 dark:border-gray-800'
    }`}>
      <div>
        <p className={`text-sm font-medium mb-1 ${isPrimary ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          {title}
        </p>
        <div className="flex items-baseline space-x-2">
          <h4 className={`text-3xl font-bold ${isPrimary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {count}
          </h4>
          {!isPrimary && total !== undefined && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${isPrimary ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
