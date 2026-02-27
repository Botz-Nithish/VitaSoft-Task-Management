import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationsPanel, { getDaysUntilDue } from './NotificationsPanel';
import InnerTransition from '../ui/InnerTransition';
import { useTasks } from '../../hooks/useTasks';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: tasks = [] } = useTasks();
  const upcomingCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'FINISHED') return false;
    const days = getDaysUntilDue(t.dueDate);
    return days <= 2;
  }).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0d1f2d]">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onBellClick={() => setIsNotificationOpen(true)}
          upcomingCount={upcomingCount}
        />
        <main className="flex-1 overflow-scroll p-6 md:p-8 relative">
          <InnerTransition />
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {children}
          </div>
        </main>
      </div>

      <NotificationsPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default Layout;
