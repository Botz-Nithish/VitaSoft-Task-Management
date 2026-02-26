import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`w-full ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-[#1a2535] text-gray-900 dark:text-white 
            focus:ring-2 focus:outline-none transition-colors
            ${
              error
                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                : 'border-gray-300 dark:border-gray-700 focus:border-[#00c48c] focus:ring-[#00c48c]/20 dark:focus:ring-[#00c48c]/20'
            }`}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
