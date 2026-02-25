import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { startTransition } from '../../features/ui/transitionSlice';
import { logoutApi } from '../../api/auth.api';
import { 
  Squares2X2Icon, 
  CalendarIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    // 1. Trigger the logout transition animation
    dispatch(startTransition('LOGOUT'));

    // 2. Wait for overlay to cover screen, then clear state
    setTimeout(async () => {
      try {
        await logoutApi();
      } catch (e) {
        console.error(e); // Optional: Handle error silently
      } finally {
        dispatch(logout()); // Ensure state is cleared and user is redirected
        navigate('/login');
      }
    }, 400); // Overlay speed
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (location.pathname === path) {
      if (isOpen) onClose();
      return;
    }
    
    if (isOpen) onClose();

    // 1. Trigger the internal transition animation
    dispatch(startTransition('INTERNAL'));

    // 2. Wait for internal overlay to cover screen, then navigate
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Squares2X2Icon },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Settings', path: '#settings', icon: Cog6ToothIcon }, // Settings is a placeholder
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2535] flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <img src="/logo.svg" alt="TaskSphere Logo" className="w-7 h-7 mr-2.5" />
              <h1 className="text-xl font-bold text-[#00c48c] tracking-tight">TaskSphere</h1>
            </div>
            
            {/* Close button strictly for Mobile */}
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <a
                href={item.path}
                key={item.name}
                onClick={(e) => handleNavClick(e, item.path)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#00c48c]/10 text-[#00c48c] dark:bg-[#00c48c]/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#00c48c]' : 'text-gray-400 dark:text-gray-500'}`} aria-hidden="true" />
                {item.name}
              </a>
            );
          })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0d1f2d] p-3 rounded-lg border border-gray-100 dark:border-gray-800 group">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-[#00c48c] flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={user.name || ''}>
                {user.name || 'User'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email || ''}>
                {user.email}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
