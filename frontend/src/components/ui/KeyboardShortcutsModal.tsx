import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeybinds, formatKey } from '../../context/KeybindsContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { keybinds } = useKeybinds();

  const shortcuts = [
    { key: formatKey(keybinds.newTask),       description: 'Create new task' },
    { key: formatKey(keybinds.focusSearch),   description: 'Focus search bar' },
    { key: formatKey(keybinds.showShortcuts), description: 'Show keyboard shortcuts' },
    { key: formatKey(keybinds.closeModal),    description: 'Close any open modal' },
  ];

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 bg-white dark:bg-[#1a2535] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {shortcuts.map(({ key, description }) => (
                <div key={description} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0d1f2d] transition-colors">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{description}</span>
                  <kbd className="px-2 py-1 text-xs font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm min-w-[32px] text-center">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
