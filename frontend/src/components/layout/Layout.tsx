import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationsPanel, { getDaysUntilDue } from './NotificationsPanel';
import KeyboardShortcutsModal from '../ui/KeyboardShortcutsModal';
import InnerTransition from '../ui/InnerTransition';
import { useTasks } from '../../hooks/useTasks';
import { useKeybinds } from '../../context/KeybindsContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { keybinds } = useKeybinds();
  const { data: tasks = [] } = useTasks();
  const upcomingCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 'FINISHED') return false;
    const days = getDaysUntilDue(t.dueDate);
    return days <= 2;
  }).length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === keybinds.showShortcuts) setIsShortcutsOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keybinds.showShortcuts]);

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
          onShortcutsClick={() => setIsShortcutsOpen(true)}
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

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default Layout;
