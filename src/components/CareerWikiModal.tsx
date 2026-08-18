import React from 'react';
import { motion } from 'motion/react';
import { CAREER_WIKI_ENTRIES } from '../data/mockData';
import { X, Building2, Sparkles, MapPin, DollarSign, Clock, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface CareerWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: string) => void;
}

export const CareerWikiModal: React.FC<CareerWikiModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
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
        className="relative z-10 w-full max-w-3xl max-h-[88vh] bg-white rounded-[32px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4.5 h-4.5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base font-serif craft-serif">
                  行业专家 Agent · 真实职场情报库
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 shadow-2xs">
                  产品 2 负责
                </span>
              </div>
              <p className="text-xs text-stone-500">回答具体行业、城市、公司类型和岗位真实情况，所有事实严格标明来源与更新时间</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 custom-scrollbar">
          {CAREER_WIKI_ENTRIES.map((entry, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-stone-50/80 hover:bg-white shadow-2xs hover:shadow-md transition-all space-y-3.5 border border-stone-200/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-base font-serif craft-serif">{entry.role}</h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shadow-2xs">
                    {entry.match}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onSelectRole(entry.role);
                    onClose();
                  }}
                  className="craft-btn-black text-xs px-3.5 py-1.5 font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>选择此岗位推演</span>
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                {entry.description}
              </p>

              {/* City & Salary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 shadow-2xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-700">城市分布：</span>
                    <span className="text-stone-600">{entry.cityDistribution}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 shadow-2xs flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-700">真实薪酬区间：</span>
                    <span className="text-emerald-800 font-bold">{entry.salaryRange}</span>
                  </div>
                </div>
              </div>

              {/* Company Types breakdown */}
              {entry.companyTypes && (
                <div className="p-3 rounded-xl bg-white/90 shadow-2xs space-y-1.5 text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>不同公司类型要求差异：</span>
                  </span>
                  <ul className="space-y-1 text-stone-600 pl-1 text-[11px] leading-relaxed">
                    <li>• <span className="font-semibold text-stone-800">大厂：</span>{entry.companyTypes.bigTech}</li>
                    <li>• <span className="font-semibold text-stone-800">独角兽：</span>{entry.companyTypes.unicorn}</li>
                    <li>• <span className="font-semibold text-stone-800">初创：</span>{entry.companyTypes.startup}</li>
                  </ul>
                </div>
              )}

              {/* Core Skills */}
              <div>
                <p className="text-xs font-bold text-stone-800 mb-1.5">核心胜任力要求：</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.coreSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-white text-stone-800 font-medium shadow-2xs border border-stone-200/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Citations & Timestamps */}
              {entry.citation && (
                <div className="pt-2 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-purple-900 bg-purple-50/60 p-2 rounded-xl">
                  <div className="flex items-center gap-1.5 font-medium">
                    <FileText className="w-3 h-3 text-purple-700 shrink-0" />
                    <span>数据来源：{entry.citation.source}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-700 font-mono font-bold">
                    <Clock className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>更新时间：{entry.citation.updatedAt}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
          <span>行业专家 Agent 持续追踪前沿招聘市场动态</span>
          <button
            onClick={onClose}
            className="craft-btn-black px-6 py-2 text-xs font-bold cursor-pointer shadow-sm"
          >
            完成浏览
          </button>
        </div>
      </motion.div>
    </div>
  );
};
