import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { AppMode } from '../services/appMode';

interface AppModeSwitcherProps {
  appMode: AppMode;
  onChange: (mode: AppMode) => void;
  onReplayDemo: () => void;
}

export const AppModeSwitcher: React.FC<AppModeSwitcherProps> = ({ appMode, onChange, onReplayDemo }) => (
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
    {appMode === 'demo' && (
      <button
        type="button"
        onClick={onReplayDemo}
        className="ml-1 flex items-center gap-1 rounded-full border-l border-stone-200 px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 active:scale-[0.97]"
        title="清除演示进度并返回首页"
      >
        <RotateCcw className="h-3 w-3" />
        <span>重新演示</span>
      </button>
    )}
  </div>
);
