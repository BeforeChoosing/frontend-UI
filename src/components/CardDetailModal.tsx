import React from 'react';
import { motion } from 'motion/react';
import { SkillCard } from '../types';
import { X, Sparkles, Layers, Briefcase, CheckCircle2 } from 'lucide-react';

interface CardDetailModalProps {
  card: SkillCard | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
}) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360, mass: 0.7 }}
        className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_28px_72px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,1)] p-6 sm:p-7 overflow-hidden will-change-transform transform-gpu"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category & Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold shadow-2xs">
            {card.category}
          </span>
          {card.isBackup && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 font-bold shadow-2xs">
              备用卡
            </span>
          )}
        </div>

        {/* Card Title */}
        <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2 font-serif craft-serif">
          {card.title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
          {card.description}
        </p>

        {/* Deep Details */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-50 shadow-2xs">
            <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              <span>能力深度解析</span>
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              {card.detail}
            </p>
          </div>

          {card.workplaceApplication && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 shadow-2xs">
              <h4 className="text-xs font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-700" />
                <span>可以用在哪些工作场景</span>
              </h4>
              <p className="text-xs text-purple-900 leading-relaxed">
                {card.workplaceApplication}
              </p>
            </div>
          )}

          {card.matchReason && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 shadow-2xs">
              <h4 className="text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>当前考题匹配判定</span>
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {card.matchReason}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="craft-btn-black w-full mt-6 py-2.5 text-xs font-bold shadow-md cursor-pointer"
        >
          收起卡片
        </button>
      </motion.div>
    </div>
  );
};
