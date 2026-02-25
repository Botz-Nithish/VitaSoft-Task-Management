import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import InnerTransition from '../ui/InnerTransition';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0d1f2d]">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-scroll p-6 md:p-8 relative">
          <InnerTransition />
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
