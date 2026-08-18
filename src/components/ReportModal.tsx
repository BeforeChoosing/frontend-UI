import React from 'react';
import { motion } from 'motion/react';
import { EvaluationReport, SkillCard } from '../types';
import { X, Award, Sparkles, CheckCircle2, TrendingUp, Compass, ArrowRight, Share2, Layers } from 'lucide-react';

interface ReportModalProps {
  report: EvaluationReport | null;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onViewAllCards: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onRestart,
  onViewAllCards,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      {/* Main Report Card in Craft.do luxury card layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base font-serif craft-serif">
                  复盘 Agent · 体验证据与画像更新评估
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 shadow-2xs">
                  产品 1 & 3 协同
                </span>
              </div>
              <p className="text-xs text-stone-500">产品 3 提炼任务证据 → 产品 1 写回能力画像与路径判断</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Top Score Banner */}
          <div className="p-6 rounded-[28px] bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 font-bold">
                  综合评级
                </span>
                <span className="text-xs text-stone-300">领先 96.4% 探索者</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1 font-serif craft-serif">
                Grade {report.grade} <span className="text-lg font-normal text-stone-300">({report.score} 分)</span>
              </h2>
              <p className="text-xs text-stone-300 mt-2 max-w-sm leading-relaxed">
                {report.summary}
              </p>
            </div>

            <div className="w-24 h-24 rounded-2xl bg-white/10 p-3 flex flex-col items-center justify-center text-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300 mb-1" />
              <span className="text-[10px] text-stone-300">已解锁能力卡</span>
              <span className="text-sm font-bold text-white">4 张永久卡</span>
            </div>
          </div>

          {/* 4 Dimension Bar Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-900" />
              <span>能力维度剖析</span>
            </h4>

            <div className="space-y-2.5">
              {report.radarScores.map((dim, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1.5">
                    <span>{dim.dimension}</span>
                    <span className="text-stone-900 font-mono">{dim.score} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200/80 overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full bg-stone-900 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 shadow-2xs">
              <h5 className="font-bold text-emerald-950 text-xs mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>显著职场优势</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {report.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 shadow-2xs">
              <h5 className="font-bold text-amber-950 text-xs mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>进阶成长建议</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Fit Advice Callout */}
          <div className="p-4 rounded-2xl bg-stone-100/80 shadow-2xs space-y-2">
            <div>
              <p className="text-xs font-bold text-stone-900 mb-0.5">岗位适配建议：</p>
              <p className="text-xs text-stone-700 leading-relaxed">{report.careerFitAdvice}</p>
            </div>

            {/* 复盘 Agent 写回说明 */}
            <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-xl space-y-1">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>复盘 Agent 画像写回解释：</span>
              </span>
              <p className="text-stone-600 leading-normal">
                根据第3阶段工作台产出及解题逻辑，产品 3 提炼出你具备高阶【Badcase精准归因】与【人机容错交互设计】的体验证据，产品 1 已将对应能力卡升级并同步写入你的个人能力图谱。
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50/80 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onViewAllCards}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-stone-700" />
            <span>查看我的能力卡包</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium shadow-2xs cursor-pointer"
            >
              重新探索
            </button>
            <button
              onClick={onClose}
              className="craft-btn-black flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
            >
              完成并保存
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
