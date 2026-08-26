import React from 'react';
import type { AppMode } from '../services/appMode';

interface AppModeSwitcherProps {
  appMode: AppMode;
  onChange: (mode: AppMode) => void;
}

export const AppModeSwitcher: React.FC<AppModeSwitcherProps> = ({ appMode, onChange }) => (
  <div className="fixed bottom-4 right-4 z-[60] flex items-center rounded-full border border-stone-200/80 bg-white/90 p-1 shadow-lg backdrop-blur-xl xl:bottom-auto xl:left-3 xl:right-auto xl:top-4" aria-label="运行模式">
    {(['demo', 'use'] as const).map(mode => (
      <button
        key={mode}
        type="button"
        onClick={() => onChange(mode)}
        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition active:scale-[0.97] ${appMode === mode ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
        aria-pressed={appMode === mode}
      >
        {mode === 'demo' ? '演示' : '正式'}
      </button>
    ))}
  </div>
);
