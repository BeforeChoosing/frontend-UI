import type {
  DragEvent as ReactDragEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { Check, RotateCcw, Sparkles } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import type { SkillCard } from '../types';

interface PlayableAbilityCardProps {
  key?: string;
  card: SkillCard;
  index: number;
  total: number;
  selected: boolean;
  onPlay: () => void;
  onOpenDetail: () => void;
  onDragStart: (event: ReactDragEvent<HTMLElement>) => void;
}

const categoryStyles: Record<string, { dot: string; wash: string; glow: string }> = {
  洞察分析: {
    dot: 'bg-emerald-500',
    wash: 'from-emerald-100/80 via-white to-cyan-100/60',
    glow: 'rgba(16,185,129,0.24)',
  },
  数据驱动: {
    dot: 'bg-blue-500',
    wash: 'from-blue-100/80 via-white to-indigo-100/60',
    glow: 'rgba(59,130,246,0.24)',
  },
  产品策略: {
    dot: 'bg-amber-500',
    wash: 'from-amber-100/80 via-white to-orange-100/60',
    glow: 'rgba(245,158,11,0.24)',
  },
  交互体验: {
    dot: 'bg-rose-500',
    wash: 'from-rose-100/80 via-white to-fuchsia-100/60',
    glow: 'rgba(244,63,94,0.22)',
  },
  技术落地: {
    dot: 'bg-purple-500',
    wash: 'from-purple-100/80 via-white to-violet-100/60',
    glow: 'rgba(139,92,246,0.24)',
  },
  协作沟通: {
    dot: 'bg-pink-500',
    wash: 'from-pink-100/80 via-white to-rose-100/60',
    glow: 'rgba(236,72,153,0.22)',
  },
};

export function PlayableAbilityCard({
  card,
  index,
  total,
  selected,
  onPlay,
  onOpenDetail,
  onDragStart,
}: PlayableAbilityCardProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 250,
    damping: 24,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), {
    stiffness: 250,
    damping: 24,
  });
  const sheenX = useTransform(pointerX, [-0.5, 0.5], ['-45%', '45%']);
  const sheenY = useTransform(pointerY, [-0.5, 0.5], ['-35%', '35%']);
  const fanRotation = (index - (total - 1) / 2) * 1.5;
  const style = categoryStyles[card.category] ?? {
    dot: 'bg-stone-500',
    wash: 'from-stone-100 via-white to-stone-50',
    glow: 'rgba(120,113,108,0.2)',
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (selected || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.article
      layout
      layoutId={selected ? undefined : `ability-card-${card.id}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${selected ? '收回' : '选择'}能力卡：${card.title}`}
      draggable={!selected}
      onDragStart={onDragStart}
      onClick={onPlay}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPlay();
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      initial={{ opacity: 0, y: 18, rotateZ: fanRotation }}
      animate={{
        opacity: selected ? 0.62 : 1,
        y: selected ? 3 : Math.abs(fanRotation) * 0.7,
        rotateZ: selected ? 0 : fanRotation,
        scale: selected ? 0.96 : 1,
      }}
      whileHover={selected
        ? { y: 0, scale: 0.985 }
        : { y: -13, scale: 1.045, zIndex: 40 }}
      whileTap={{ scale: selected ? 0.95 : 0.98 }}
      transition={{ type: 'spring', stiffness: 310, damping: 25 }}
      style={{
        rotateX: selected ? 0 : rotateX,
        rotateY: selected ? 0 : rotateY,
        transformPerspective: 850,
        transformStyle: 'preserve-3d',
        boxShadow: selected
          ? '0 4px 10px rgba(28,25,23,0.04)'
          : `0 12px 28px -18px ${style.glow}, 0 5px 14px rgba(28,25,23,0.07)`,
      }}
      className={`group w-[126px] sm:w-[142px] h-[148px] rounded-[20px] p-2.5 select-none flex flex-col justify-between relative overflow-hidden border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${
        selected
          ? 'border-stone-300/80 bg-stone-100 cursor-pointer'
          : `border-white/90 bg-gradient-to-br ${style.wash} cursor-grab active:cursor-grabbing`
      }`}
    >
      <div className="absolute inset-[4px] rounded-[16px] border border-white/80 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />

      {!selected && (
        <motion.div
          aria-hidden="true"
          style={{ x: sheenX, y: sheenY }}
          className="absolute -inset-12 rotate-12 bg-gradient-to-r from-transparent via-white/55 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        />
      )}

      <div className="relative z-10 flex items-center justify-between text-[9px]" style={{ transform: 'translateZ(18px)' }}>
        <div className="flex items-center gap-1 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <span className="text-stone-700 font-bold truncate">{card.category}</span>
        </div>
        <span className="font-mono text-stone-400">0{index + 1}</span>
      </div>

      <div className="relative z-10 my-auto py-1" style={{ transform: 'translateZ(26px)' }}>
        <div className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold text-stone-500">
          <Sparkles className="h-3 w-3" />
          <span>能力卡</span>
        </div>
        <h5 className="font-bold text-stone-950 text-[13px] leading-snug line-clamp-2">
          {card.title}
        </h5>
        <p className="text-[9px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
          {card.description}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[9px] text-stone-500 pt-1.5 border-t border-stone-900/5" style={{ transform: 'translateZ(18px)' }}>
        <span className="inline-flex items-center gap-1 font-medium">
          <Check className="h-3 w-3" />
          已确认
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetail();
          }}
          className="rounded-full px-1.5 py-0.5 text-stone-500 hover:bg-white/80 hover:text-stone-950 transition-colors cursor-pointer"
        >
          详情
        </button>
      </div>

      <AnimateSelectedOverlay selected={selected} />
    </motion.article>
  );
}

function AnimateSelectedOverlay({ selected }: { selected: boolean }) {
  if (!selected) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 rounded-[20px] bg-stone-950/76 text-white backdrop-blur-[2px]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
        <Check className="h-4 w-4 text-amber-300" />
      </div>
      <span className="text-xs font-bold">已上场</span>
      <span className="inline-flex items-center gap-1 text-[9px] text-white/70">
        <RotateCcw className="h-3 w-3" />
        点击收回
      </span>
    </motion.div>
  );
}
