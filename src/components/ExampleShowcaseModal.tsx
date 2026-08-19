import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, CheckCircle2, ArrowRight, LayoutTemplate, Layers } from 'lucide-react';

interface ExampleShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExample: () => void;
}

export const ExampleShowcaseModal: React.FC<ExampleShowcaseModalProps> = ({
  isOpen,
  onClose,
  onStartExample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-lg">体验示例：AI 产品经理从 0 到 1</h3>
            <p className="text-xs text-stone-500">经典职场实战场景与能力卡演练链路</p>
          </div>
        </div>

        <div className="space-y-4 my-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <h4 className="font-semibold text-stone-900 mb-1">🎯 真实任务模拟的使用价值</h4>
            <p className="text-stone-600">
              传统的职业性格测试只提供抽象标签。「选择之前」采用 Craft 文档级工作桌面，将业务材料、岗位任务和过程评价放在同一条验证链路中，帮助用户基于实际产出理解岗位要求。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50">
                <span className="font-semibold text-purple-900 text-xs block mb-1">阶段 1：经历提取与能力确认</span>
                <p className="text-[11px] text-purple-800">
                从经历文字和材料中提取候选能力卡，由用户确认后写入能力库。
                </p>
            </div>
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
                <span className="font-semibold text-blue-900 text-xs block mb-1">阶段 2：岗位任务实战</span>
                <p className="text-[11px] text-blue-800">
                根据已确认能力卡加载任务库材料，完成结构化交付并接收 Rubric 评价。
                </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
          >
            返回
          </button>
          <button
            onClick={() => {
              onStartExample();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>立即进入完整体验</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
