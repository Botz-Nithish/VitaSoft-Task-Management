import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { BellIcon, SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import uiText from '../../data.json';

interface HeaderProps {
  onMenuClick: () => void;
  onBellClick: () => void;
  upcomingCount: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onBellClick, upcomingCount }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return uiText.navigation.dashboard;
      case '/calendar':
        return uiText.navigation.calendar;
      default:
        return uiText.navigation.dashboard;
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2535]">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Home <span className="mx-2">/</span> <span className="font-semibold text-gray-900 dark:text-white">{getPageTitle()}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
        
        <button
          onClick={onBellClick}
          title="Reminders"
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors relative"
        >
          <BellIcon className="w-5 h-5" />
          {upcomingCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#ef4444] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5">
              {upcomingCount > 9 ? '9+' : upcomingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
