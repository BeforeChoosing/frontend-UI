import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Sprout, X } from 'lucide-react';
import { AGENT_REGISTRY } from '../types';

interface GrowthCompanionWidgetProps {
  inConversation: boolean;
  onContinue: () => void;
}

// This is an entry to ProfileAgent's existing conversation, not a second chat.
export const GrowthCompanionWidget: React.FC<GrowthCompanionWidgetProps> = ({ inConversation, onContinue }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const companion = AGENT_REGISTRY.growth_companion;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="growth-companion-widget fixed bottom-20 right-3 z-40 sm:right-6 xl:bottom-auto xl:top-[82px]">
      <button ref={triggerRef} type="button" aria-label="成长陪伴 Agent" aria-expanded={open} aria-controls="growth-companion-panel" onClick={() => setOpen(value => !value)} title={companion.name}
        className="ml-auto flex items-center gap-2 rounded-full border border-stone-600 bg-stone-900 px-4 py-2.5 text-xs text-stone-100 shadow-md transition-colors hover:bg-stone-800 active:scale-[0.98]">
        <Sprout className="h-4 w-4 text-emerald-400" /><span>{companion.shortName}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.section id="growth-companion-panel" aria-label={companion.name}
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 440, damping: 34 }}
            className="absolute bottom-full right-0 mb-3 w-[min(330px,calc(100vw-24px))] origin-bottom-right rounded-3xl border border-stone-200 bg-white p-5 text-stone-800 shadow-xl xl:bottom-auto xl:top-full xl:mb-0 xl:mt-3 xl:origin-top-right">
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <h2 className="font-serif text-base font-semibold">{companion.name}</h2>
              <button type="button" aria-label="收起成长陪伴" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="rounded-full p-1 text-stone-500 hover:bg-stone-100"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-6">我会沿着你分享的经历，陪你梳理行动、判断和结果，找到值得继续验证的能力线索。</p>
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">对话与附件保留在同一段经历记录中。能力卡是否收录，由你确认。</p>
            <button type="button" onClick={() => { setOpen(false); onContinue(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm text-white hover:bg-black">
              {inConversation ? '继续当前对话' : '回到经历对话'}<ArrowRight className="h-4 w-4" />
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
