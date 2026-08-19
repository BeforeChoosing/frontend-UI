import React from 'react';
import { motion } from 'motion/react';
import { X, FileCode2, Image, Copy, Link, Sparkles, Check, ChevronRight } from 'lucide-react';

interface FigmaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FigmaGuideModal: React.FC<FigmaGuideModalProps> = ({
  isOpen,
  onClose,
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

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Figma 交互流程同步规范</h3>
            <p className="text-xs text-stone-500">4 种最快、最高效的原型交互传递方式</p>
          </div>
        </div>

        <div className="space-y-3.5 my-6 text-xs sm:text-sm text-stone-700">
          {/* Method 1 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">方式 1：Frame 截图 / 导出图片批量拖入 (最直观推荐 ⭐⭐⭐)</h4>
              <p className="text-stone-600 text-xs leading-relaxed">
                在 Figma 中选中画板（Frame）或流程连线图，按 <code className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-mono text-[11px]">Cmd/Ctrl + Shift + C</code> 复制为 PNG，保存后作为设计说明附件提交。页面据此记录布局、视觉层级与状态分支。
              </p>
            </div>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">方式 2：复制文字 / FigJam 流程树描述</h4>
              <p className="text-stone-600 text-xs leading-relaxed">
                将 Figma 中的关键文案、卡片配置、弹窗触发逻辑或分支判断整理为列表，作为实现说明提交。开发时按照清单逐项映射为可交互功能模块。
              </p>
            </div>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">方式 3：分享公开 Figma 链接 + 页面要点说明</h4>
              <p className="text-stone-600 text-xs leading-relaxed">
                若有已设置“任何人可查看”的 Figma 链接，可直接发送链接，并附带简要说明（如“主要修改点在 Stage 1 的卡片筛选器”）。
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>当前页面已还原低保真稿中的 4 个核心页面。</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs cursor-pointer"
          >
            继续
          </button>
        </div>
      </motion.div>
    </div>
  );
};
