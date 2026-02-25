import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative bg-white dark:bg-[#1a2535] rounded-xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            
            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              {message}
            </p>
            
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={onCancel} 
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={onConfirm} 
                isLoading={isLoading}
                className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
