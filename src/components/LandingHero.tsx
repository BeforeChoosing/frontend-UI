import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckSquare,
  Compass,
  Edit3,
  FileText,
  FolderKanban,
  GitBranch,
  GraduationCap,
  HelpCircle,
  History,
  Layers,
  MessageCircle,
  Route,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { HERO_FLOATING_CARDS } from '../data/mockData';
import type { SkillCard } from '../types';

interface LandingHeroProps {
  onStartExplore: () => void;
  onOpenWiki: () => void;
  onOpenExample: () => void;
  onOpenAbout: () => void;
  onSelectCard: (card: SkillCard) => void;
  onExploreDirection?: () => void;
  onOpenTrial?: () => void;
  onOpenReport?: () => void;
}

const iconButtonClass = 'flex flex-col items-center gap-2.5 group cursor-pointer';

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartExplore,
  onOpenWiki,
  onOpenExample,
  onOpenAbout,
  onSelectCard,
  onExploreDirection = onOpenExample,
  onOpenTrial = onOpenExample,
  onOpenReport = onOpenWiki,
}) => {
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': false,
    'task-3': false,
  });

  const toggleTask = (id: string) => {
    setCheckedTasks(previous => ({ ...previous, [id]: !previous[id] }));
  };

  return (
    <div className="w-full overflow-x-hidden">
      <main className="w-full pb-20 overflow-x-hidden flex-1">
        {/* 1. HERO SECTION */}
        <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold font-mono mb-4">
              <span>before.choosing</span>
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              <span>职业探索与能力验证平台</span>
            </div>

            <h1 className="craft-serif text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 tracking-tight leading-[1.16] mb-6">
              <span className="block md:whitespace-nowrap">before.choosing 不只是为一件事，</span>
              <span className="block">它是为你的事而生。</span>
            </h1>

            <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              把真实经历变成可确认的能力证据，把模糊选择变成可比较、可验证、会持续更新的职业方向。
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 pt-2 pb-10 flex-wrap">
              <button type="button" onClick={onStartExplore} className={iconButtonClass}>
                <span className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                  <FileText className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-700">经历证据</span>
              </button>

              <button type="button" onClick={() => onSelectCard(HERO_FLOATING_CARDS[0])} className={iconButtonClass}>
                <span className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                  <Layers className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-700">动态画像</span>
              </button>

              <button type="button" onClick={onExploreDirection} className={iconButtonClass}>
                <span className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                  <CheckSquare className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-700">方向探索</span>
              </button>

              <button type="button" onClick={onOpenTrial} className={iconButtonClass}>
                <span className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                  <Compass className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-700">试路任务</span>
              </button>

              <button type="button" onClick={onOpenReport} className={iconButtonClass}>
                <span className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                  <Edit3 className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-700">复盘更新</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                id="hero-craft-start-btn"
                onClick={onStartExplore}
                className="px-8 py-3.5 rounded-full bg-black text-white text-base font-medium hover:bg-stone-800 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
              >
                <span>开始探索</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. EXPERIENCE EVIDENCE */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
          <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 text-left">
                <span className="craft-chip-yellow text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3 font-mono">
                  01 · 看见自己
                </span>
                <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                  看见经历里<br />
                  真正做成的事
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  将你的日常经历与兴趣思考直接嵌进轻薄的卡片与工作台。Craft 风格让动态画像直接关联真实业务上下文，让最好的思考与职业验证无缝结合。
                </p>
                <button type="button" onClick={onStartExplore} className="px-6 py-2 rounded-full border border-stone-300 text-stone-800 bg-white hover:bg-stone-50 transition text-xs sm:text-sm cursor-pointer shadow-xs active:scale-[0.98]">
                  看看怎么整理
                </button>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="craft-card rounded-2xl p-5 bg-white/95 shadow-sm flex flex-col justify-between min-h-[160px] border border-stone-100">
                  <div className="flex items-center gap-2 text-stone-800 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-stone-600" />
                    <span>今日探索日程</span>
                  </div>
                  <div className="bg-stone-50/80 rounded-xl p-4 mt-3 border border-stone-100/80">
                    <div className="text-xs text-stone-500 font-medium font-mono">2026.08.17</div>
                    <div className="text-lg font-bold text-stone-900 mt-0.5">今天</div>
                    <div className="text-xs text-stone-600">周一 · 整理经历，试试方向</div>
                  </div>
                </div>

                <div className="craft-card rounded-2xl p-5 bg-white/95 shadow-sm flex flex-col justify-between min-h-[160px] border border-stone-100">
                  <div className="flex items-center justify-between text-stone-800 text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-stone-600" />
                      <span>待办能力项</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-normal">点击勾选</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <button type="button" onClick={() => toggleTask('task-1')} className="task-item flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition w-full text-left">
                      <span className={`task-checkbox w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-1'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                        {checkedTasks['task-1'] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className={checkedTasks['task-1'] ? 'line-through text-stone-400' : 'text-stone-700'}>梳理摄影纪实故事经历</span>
                    </button>

                    <button type="button" onClick={() => toggleTask('task-2')} className="task-item flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition w-full text-left">
                      <span className={`task-checkbox w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-2'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                        {checkedTasks['task-2'] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className={`flex-1 ${checkedTasks['task-2'] ? 'line-through text-stone-400' : 'text-stone-700'}`}>提取「共情洞察」能力卡</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/50">已提取</span>
                    </button>

                    <button type="button" onClick={() => toggleTask('task-3')} className="task-item flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition w-full text-left">
                      <span className={`task-checkbox w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-3'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                        {checkedTasks['task-3'] && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className={`flex-1 ${checkedTasks['task-3'] ? 'line-through text-stone-400' : 'text-stone-700'}`}>模拟 AI 需求分析 PRD</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-200/50">待验证</span>
                    </button>
                  </div>
                </div>

                <div className="craft-card rounded-2xl p-5 bg-white/95 shadow-sm flex flex-col justify-between min-h-[160px] border border-stone-100">
                  <div className="flex items-center gap-2 text-stone-800 text-sm font-medium mb-2">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>观察随笔</span>
                  </div>
                  <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100">
                    <div className="text-[11px] font-mono text-stone-400 mb-1">12:30 · 经历提炼</div>
                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-3">
                      “长期的街头纪实摄影让我对人的情绪变化格外敏感，这种同理心可以直接迁移到产品用户的痛点捕捉中。”
                    </p>
                  </div>
                </div>

                <div className="craft-card rounded-2xl p-5 bg-white/95 shadow-sm flex flex-col justify-between min-h-[160px] border border-stone-100">
                  <div className="flex items-center gap-2 text-stone-800 text-sm font-medium mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>实时洞察</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-amber-700 font-bold text-[11px]">14:00</span>
                      <span className="text-stone-700">选几张卡，看看先试什么</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-orange-700 font-bold text-[11px]">16:30</span>
                      <span className="text-stone-700">记录这次尝试带来的发现</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DIRECTION EXPLORATION */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
          <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 text-left">
                <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold font-mono">
                  02 · 看见选择
                </span>
                <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                  不急着告诉你答案，<br />
                  先把几个方向摆到桌面上
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  数字分身结合你已经确认的经历、能力证据、现实限制与阶段目标，整理出可比较的职业方向。每个方向都说明“为什么值得探索”，同时保留目前还不知道、还需要验证的部分。
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                    <span>已有证据：你做过什么、哪些能力已有支撑</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    </span>
                    <span>关键未知：现在还不能判断什么</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <span className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
                      <Route className="w-3.5 h-3.5 text-sky-600" />
                    </span>
                    <span>下一步：用一次低成本尝试继续验证</span>
                  </div>
                </div>

                <button type="button" onClick={onExploreDirection} className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-stone-800 transition text-xs sm:text-sm font-medium cursor-pointer shadow-xs active:scale-[0.98]">
                  开始探索方向
                </button>
              </div>

              <div className="lg:col-span-7">
                <div className="craft-doc-surface rounded-2xl bg-white p-4 sm:p-5 border border-stone-200/60">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                    <div>
                      <div className="text-[10px] font-mono text-stone-400">CAREER EXPLORATION</div>
                      <div className="text-sm font-semibold text-stone-900 mt-0.5">基于当前画像的方向比较</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">Profile V1</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-stone-900">AI 产品经理</span>
                        <span className="text-[10px] text-emerald-700 bg-white/80 border border-emerald-200 rounded-full px-2 py-0.5">优先探索</span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 mb-1.5">已有证据</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">信息整合</span>
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">跨角色沟通</span>
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">用户洞察</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-600 mb-1">关键未知</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">能否在资源受限时做需求优先级判断？</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-stone-900">用户研究</span>
                        <span className="text-[10px] text-stone-500">可继续比较</span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 mb-1.5">已有证据</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">观察访谈</span>
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">信息归纳</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-600 mb-1">关键未知</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">是否适应长周期、重复性的研究推进？</p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-stone-900">体验设计</span>
                        <span className="text-[10px] text-stone-500">保留观察</span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 mb-1.5">已有证据</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">用户视角</span>
                        <span className="px-2 py-1 rounded-lg bg-white text-[10px] text-stone-700 border border-stone-200">方案表达</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-600 mb-1">关键未知</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">复杂系统拆解与多约束权衡能力仍待验证。</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-stone-200 bg-[#FAF9F6] p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      当前不是“你最适合什么”的结论，而是一组基于现有证据的探索假设。下一步优先验证最影响选择的未知。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REAL TASK WORKBENCH */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
          <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="craft-doc-surface rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-stone-200/60">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    </div>
                    <div className="text-xs text-stone-400 font-mono">AI产品经理·试路任务.craft</div>
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-medium border border-sky-200/60">真实任务</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">待验证：需求优先级判断</span>
                    </div>
                    <h3 className="craft-serif text-xl font-medium text-stone-900">AI 产品经理：搜索改版方案</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      阅读用户反馈、业务目标与资源约束，在 30–60 分钟内做一次最小工作样本。过程中会加入动态变化，观察你如何取舍、调整与说明理由。
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-[#FAF9F6] border border-stone-200/60 p-3">
                        <div className="text-[10px] font-mono text-stone-400 mb-1">输入材料</div>
                        <div className="text-xs text-stone-800 font-medium">用户差评 × 12</div>
                        <div className="text-[10px] text-stone-500 mt-1">漏斗数据 / 资源限制 / 业务目标</div>
                      </div>
                      <div className="rounded-xl bg-[#FAF9F6] border border-stone-200/60 p-3">
                        <div className="text-[10px] font-mono text-stone-400 mb-1">动态约束</div>
                        <div className="text-xs text-stone-800 font-medium">开发资源缩减 40%</div>
                        <div className="text-[10px] text-stone-500 mt-1">需要重新排序方案优先级</div>
                      </div>
                    </div>

                    <div className="bg-stone-900 text-white p-3.5 rounded-xl text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">你的任务</span>
                        <span className="text-[10px] text-stone-400">30–60 min</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">给出 MVP 优先级、说明舍弃项，并解释在资源变化后为什么调整判断。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 text-left">
                <span className="craft-chip-blue text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3 font-mono">03 · 动手试试</span>
                <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                  不只想一想，<br />
                  去做一次再判断
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  当聊天和经历还不足以回答“我适不适合”时，系统把关键未知转化为一次低成本职业体验。真正重要的不是任务得几分，而是你在真实约束下怎么选择、调整和完成。
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                    <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-stone-700" /></div>
                    <span>真实岗位材料</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center"><MessageCircle className="w-3.5 h-3.5 text-amber-600" /></div>
                    <span>有限 AI 提示</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                    <div className="w-7 h-7 rounded-xl bg-sky-50 flex items-center justify-center"><Shuffle className="w-3.5 h-3.5 text-sky-600" /></div>
                    <span>动态约束变化</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckSquare className="w-3.5 h-3.5 text-emerald-600" /></div>
                    <span>过程行为证据</span>
                  </div>
                </div>

                <button type="button" onClick={onOpenTrial} className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-stone-800 transition text-xs sm:text-sm font-medium cursor-pointer shadow-xs active:scale-[0.98]">
                  进入试路工作台
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROFILE UPDATE */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
          <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 text-left">
                <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-semibold font-mono">04 · 让行动改变画像</span>
                <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                  你真正做过什么，<br />
                  会改变 AI 对你的理解
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  任务产出、过程选择与用户反馈不会直接变成“人格结论”。它们先成为新的候选行为证据，经你确认后写回画像，并改变下一轮职业判断所依据的 Profile。
                </p>
                <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-4">
                  <div className="text-[10px] font-mono text-orange-700 mb-1">变化说明</div>
                  <p className="text-xs text-stone-700 leading-relaxed">“需求优先级判断”从待验证变为“已有一次行为证据”；但“高频变化适应”仍保持未知。</p>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                  <div className="craft-doc-surface rounded-2xl border border-stone-200/70 p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div><div className="text-[10px] font-mono text-stone-400">BEFORE</div><div className="text-sm font-semibold text-stone-900">Profile V1</div></div>
                      <span className="text-[10px] text-stone-500">任务前</span>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-xl bg-stone-50 border border-stone-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">信息整合</span><span className="text-[10px] text-emerald-700">已确认</span></div></div>
                      <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">需求优先级判断</span><span className="text-[10px] text-amber-700">待验证</span></div></div>
                      <div className="rounded-xl bg-stone-50 border border-stone-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">高频变化适应</span><span className="text-[10px] text-stone-400">未知</span></div></div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-center gap-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-orange-600 hidden sm:block" />
                      <ArrowDown className="w-4 h-4 text-orange-600 sm:hidden" />
                    </div>
                    <span className="text-[9px] font-mono text-orange-600 text-center">NEW<br className="hidden sm:block" />EVIDENCE</span>
                  </div>

                  <div className="craft-doc-surface rounded-2xl border border-sky-200 p-4 bg-sky-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <div><div className="text-[10px] font-mono text-sky-500">AFTER</div><div className="text-sm font-semibold text-stone-900">Profile V2</div></div>
                      <span className="text-[10px] text-sky-700 bg-white border border-sky-200 rounded-full px-2 py-0.5">已更新</span>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-xl bg-white border border-stone-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">信息整合</span><span className="text-[10px] text-emerald-700">已确认</span></div></div>
                      <div className="rounded-xl bg-white border border-sky-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">需求优先级判断</span><span className="text-[10px] text-sky-700">获得行为证据</span></div><div className="text-[9px] text-stone-400 mt-1">来源：AI 产品经理试路任务 · 2026.08.17</div></div>
                      <div className="rounded-xl bg-white border border-stone-100 p-3"><div className="flex items-center justify-between"><span className="text-xs text-stone-700">高频变化适应</span><span className="text-[10px] text-stone-400">仍未知</span></div></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0"><History className="w-4 h-4 text-stone-600" /></div>
                  <div><div className="text-xs font-semibold text-stone-800">每次变化都能追溯</div><div className="text-[10px] text-stone-500 mt-0.5">来源、确认状态、更新时间与版本原因都保留在画像中。</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. LONG-TERM COMPANION */}
        <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block font-mono">LONG-TERM PROFILE</span>
          <h2 className="craft-serif text-3xl sm:text-5xl font-normal text-stone-900 mb-4">你的数字分身，会跟着经历一起变化</h2>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">长期陪伴不是一直聊天，而是在不同关键节点持续积累新证据、保留你的纠正，并让更新后的理解真正进入下一次选择。</p>

          <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 bg-white/75 border border-stone-200/60">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              <div className="hidden sm:block absolute top-7 left-[10%] right-[10%] h-px bg-stone-200" />

              <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2"><div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center"><BookOpen className="w-5 h-5 text-emerald-700" /></div><div className="text-left sm:text-center"><div className="text-xs font-semibold text-stone-900">课程</div><div className="text-[10px] text-stone-500 mt-1">第一次形成兴趣线索</div></div></div>
              <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2"><div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center"><FolderKanban className="w-5 h-5 text-amber-700" /></div><div className="text-left sm:text-center"><div className="text-xs font-semibold text-stone-900">项目</div><div className="text-[10px] text-stone-500 mt-1">获得更具体的能力证据</div></div></div>
              <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2"><div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center"><BriefcaseBusiness className="w-5 h-5 text-sky-700" /></div><div className="text-left sm:text-center"><div className="text-xs font-semibold text-stone-900">实习</div><div className="text-[10px] text-stone-500 mt-1">真实工作情境补充证据</div></div></div>
              <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2"><div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center"><GitBranch className="w-5 h-5 text-orange-700" /></div><div className="text-left sm:text-center"><div className="text-xs font-semibold text-stone-900">方向变化</div><div className="text-[10px] text-stone-500 mt-1">目标与现实限制被重新记录</div></div></div>
              <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2"><div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-rose-700" /></div><div className="text-left sm:text-center"><div className="text-xs font-semibold text-stone-900">求职</div><div className="text-[10px] text-stone-500 mt-1">用最新画像辅助关键选择</div></div></div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><div className="text-[10px] font-mono text-stone-400">01</div><div className="text-xs font-medium text-stone-800 mt-1">新增经历</div></div>
              <div><div className="text-[10px] font-mono text-stone-400">02</div><div className="text-xs font-medium text-stone-800 mt-1">形成新证据</div></div>
              <div><div className="text-[10px] font-mono text-stone-400">03</div><div className="text-xs font-medium text-stone-800 mt-1">更新画像</div></div>
              <div><div className="text-[10px] font-mono text-stone-400">04</div><div className="text-xs font-medium text-stone-800 mt-1">改变下一次判断</div></div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section className="px-4 sm:px-6 max-w-5xl mx-auto mb-6">
          <div className="craft-card rounded-[28px] sm:rounded-[36px] px-6 py-12 sm:px-12 sm:py-16 text-center bg-white border border-stone-200/70">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-5"><Sparkles className="w-5 h-5" /></div>
            <h2 className="craft-serif text-3xl sm:text-5xl font-normal text-stone-900 leading-tight mb-4">你的职业答案，<br className="sm:hidden" />不会一次形成。</h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto mb-8 leading-relaxed">从一段真实经历开始。先看见自己，再比较方向；不确定的地方，就用一次真实行动继续验证。</p>
            <button type="button" onClick={onStartExplore} className="px-8 py-3.5 rounded-full bg-black text-white text-sm sm:text-base font-medium hover:bg-stone-800 shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]">
              <span>开始整理我的经历</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-stone-400 border-t border-stone-200/40">
        <div className="max-w-5xl mx-auto px-4">
          <p>© 2026 before.choosing · 选择之前｜职业数字分身与试路验证</p>
        </div>
      </footer>
    </div>
  );
};
