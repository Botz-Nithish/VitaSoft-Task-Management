import React, { useState, useEffect } from 'react';
import { PencilSquareIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useKeybinds, formatKey, DEFAULT_KEYBINDS } from '../context/KeybindsContext';
import type { KeybindsMap } from '../context/KeybindsContext';

interface KeybindDef {
  id: keyof KeybindsMap;
  label: string;
  description: string;
}

const KEYBIND_DEFINITIONS: KeybindDef[] = [
  { id: 'newTask',       label: 'Create New Task',       description: 'Opens the create task modal' },
  { id: 'focusSearch',   label: 'Focus Search Bar',       description: 'Jumps focus to the search input' },
  { id: 'showShortcuts', label: 'Show Shortcuts Panel',   description: 'Opens the keyboard shortcuts reference' },
  { id: 'closeModal',    label: 'Close / Cancel',         description: 'Closes any open modal or panel' },
];

const IGNORED_KEYS = ['Tab', 'Shift', 'Control', 'Alt', 'Meta'];

const SettingsPage: React.FC = () => {
  const { keybinds, setKeybind, resetKeybinds } = useKeybinds();
  const [editingAction, setEditingAction] = useState<keyof KeybindsMap | null>(null);
  const [justSaved, setJustSaved] = useState<keyof KeybindsMap | null>(null);

  // Key capture while a row is in edit mode
  useEffect(() => {
    if (!editingAction) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (IGNORED_KEYS.includes(e.key)) return;

      if (e.key === 'Escape') {
        setEditingAction(null);
        return;
      }

      setKeybind(editingAction, e.key);
      setJustSaved(editingAction);
      setEditingAction(null);
      setTimeout(() => setJustSaved(null), 1500);
    };

    // Use capture phase so we intercept before other listeners
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [editingAction, setKeybind]);

  const isDefault = JSON.stringify(keybinds) === JSON.stringify(DEFAULT_KEYBINDS);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500 max-w-2xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your preferences</p>
      </div>

      {/* Keybinds card */}
      <div className="bg-white dark:bg-[#1a2535] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Click <span className="font-semibold text-gray-700 dark:text-gray-300">Edit</span> on any row, then press the key you want to assign.
              Press{' '}
              <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                Esc
              </kbd>{' '}
              to cancel.
            </p>
          </div>
          {!isDefault && (
            <button
              onClick={resetKeybinds}
              title="Reset all shortcuts to defaults"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Keybind rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {KEYBIND_DEFINITIONS.map(({ id, label, description }, index) => {
            const isEditing = editingAction === id;
            const wasSaved  = justSaved === id;
            const currentKey = keybinds[id];
            const isModified = currentKey !== DEFAULT_KEYBINDS[id];

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  isEditing
                    ? 'bg-[#00c48c]/5 dark:bg-[#00c48c]/10'
                    : 'hover:bg-gray-50 dark:hover:bg-[#0d1f2d]/60'
                }`}
              >
                {/* Left: label + description */}
                <div className="flex-1 min-w-0 mr-6">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                    {isModified && (
                      <span className="text-[9px] font-bold text-[#00c48c] bg-[#00c48c]/10 dark:bg-[#00c48c]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>

                {/* Right: key badge + edit button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isEditing ? (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-[#00c48c] bg-[#00c48c]/5 text-xs font-semibold text-[#00c48c] animate-pulse whitespace-nowrap select-none">
                      Press any key…
                    </span>
                  ) : wasSaved ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00c48c]/15 dark:bg-[#00c48c]/20 text-xs font-bold text-[#00c48c] whitespace-nowrap">
                      <CheckIcon className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  ) : (
                    <kbd className="px-3 py-1.5 text-sm font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm min-w-[44px] text-center select-none">
                      {formatKey(currentKey)}
                    </kbd>
                  )}

                  <button
                    onClick={() => setEditingAction(isEditing ? null : id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      isEditing
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                        : 'bg-white dark:bg-[#0d1f2d] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#00c48c] hover:text-[#00c48c] dark:hover:border-[#00c48c] dark:hover:text-[#00c48c] shadow-sm'
                    }`}
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
