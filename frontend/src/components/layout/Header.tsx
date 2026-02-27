import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { BellIcon, SunIcon, MoonIcon, Bars3Icon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import uiText from '../../data.json';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

interface HeaderProps {
  onMenuClick: () => void;
  onBellClick: () => void;
  onShortcutsClick: () => void;
  upcomingCount: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onBellClick, onShortcutsClick, upcomingCount }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return uiText.navigation.dashboard;
      case '/calendar':
        return uiText.navigation.calendar;
      case '/settings':
        return uiText.navigation.settings;
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

      <div className="flex items-center space-x-1">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>

        <a
          href="https://github.com/Botz-Nithish/VitaSoft-Task-Management"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center"
        >
          <GitHubIcon />
        </a>

        <button
          onClick={onShortcutsClick}
          title="Keyboard shortcuts (?)"
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
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
