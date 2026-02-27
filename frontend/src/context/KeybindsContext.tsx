import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'vitasoft-keybinds';

export interface KeybindsMap {
  newTask: string;
  focusSearch: string;
  showShortcuts: string;
  closeModal: string;
}

export const DEFAULT_KEYBINDS: KeybindsMap = {
  newTask: 'n',
  focusSearch: '/',
  showShortcuts: '?',
  closeModal: 'Escape',
};

export const formatKey = (key: string): string => {
  if (key === 'Escape') return 'Esc';
  if (key === 'Backspace') return 'Bksp';
  if (key === 'Delete') return 'Del';
  if (key === 'Enter') return 'Enter';
  if (key === 'ArrowUp') return '↑';
  if (key === 'ArrowDown') return '↓';
  if (key === 'ArrowLeft') return '←';
  if (key === 'ArrowRight') return '→';
  if (key === ' ') return 'Space';
  return key.toUpperCase();
};

interface KeybindsContextValue {
  keybinds: KeybindsMap;
  setKeybind: (action: keyof KeybindsMap, key: string) => void;
  resetKeybinds: () => void;
}

const KeybindsContext = createContext<KeybindsContextValue | null>(null);

export const KeybindsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keybinds, setKeybindsState] = useState<KeybindsMap>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_KEYBINDS, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_KEYBINDS;
  });

  const setKeybind = (action: keyof KeybindsMap, key: string) => {
    const next = { ...keybinds, [action]: key };
    setKeybindsState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetKeybinds = () => {
    setKeybindsState(DEFAULT_KEYBINDS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <KeybindsContext.Provider value={{ keybinds, setKeybind, resetKeybinds }}>
      {children}
    </KeybindsContext.Provider>
  );
};

export const useKeybinds = (): KeybindsContextValue => {
  const ctx = useContext(KeybindsContext);
  if (!ctx) throw new Error('useKeybinds must be used within KeybindsProvider');
  return ctx;
};
