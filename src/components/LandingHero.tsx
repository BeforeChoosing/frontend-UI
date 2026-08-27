import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HERO_FLOATING_CARDS } from '../data/mockData';
import { SkillCard } from '../types';
import { 
  FileText, CheckSquare, Calendar, Sparkles, Edit3, 
  ArrowRight, Award, ChevronRight, Check, Compass, 
  Layers, Palette, Layout, ShieldCheck, UserCheck, Play, FolderKanban
} from 'lucide-react';

interface LandingHeroProps {
  onStartExplore: () => void;
  onOpenWiki: () => void;
  onOpenExample: () => void;
  onOpenAbout: () => void;
  onSelectCard: (card: SkillCard) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartExplore,
  onOpenWiki,
  onOpenExample,
  onOpenAbout,
  onSelectCard,
}) => {
  const [activeSkin, setActiveSkin] = useState<string>('paper');
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': false,
    'task-3': false,
  });

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cardSkins = [
    {
      id: 'market',
      title: 'Market Walks',
      theme: 'bg-[#EDE4DA] text-stone-800 border-[#D8CABE]',
      accent: 'border-t-4 border-[#8C6D58]',
      category: '人文洞察',
      desc: '深入市井观察用户自发行为与交互心理',
    },
    {
      id: 'infinity',
      title: 'Infinity Void',
      theme: 'bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] text-white border-indigo-950',
      accent: 'shadow-[0_10px_30px_rgba(30,27,75,0.4)]',
      category: '系统架构',
      desc: '构建高内聚低耦合的底层逻辑框架',
    },
    {
      id: 'paper',
      title: 'Paper Kraft',
      theme: 'bg-[#F5EBE1] text-[#4A3B32] border-[#E2D1C3]',
      accent: 'border-l-4 border-[#C8A27A]',
      category: '故事叙述',
      desc: '将零散片段打造成引人共鸣的完整叙事',
    },
    {
      id: 'savoir',
      title: 'Savoir-Faire',
      theme: 'bg-white text-stone-900 border-stone-200',
      accent: 'ring-2 ring-stone-900/10',
      category: '审美判断',
      desc: '在繁杂信息中保持敏锐直觉与克制表达',
    },
    {
      id: 'blogger',
      title: 'Graphite Pro',
      theme: 'bg-[#2A2B2E] text-stone-100 border-stone-700',
      accent: 'border-b-2 border-stone-400',
      category: '批判思考',
      desc: '多角度推敲方案的边界条件与极端异常',
    },
    {
      id: 'tour',
      title: 'The Tour',
      theme: 'bg-[#FEF08A] text-stone-900 border-amber-300',
      accent: 'ring-4 ring-amber-400/40',
      category: '敏捷执行',
      desc: '快速拆解复杂任务，即刻启动MVP验证',
    }
  ];

  return (
    <div className="w-full pb-20 overflow-x-hidden">
      
      {/* 1. HERO SECTION (Craft.do Title + 5 Icon Row) */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold font-mono mb-4">
            <span>before.choosing</span>
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            <span>把经历变成下一步</span>
          </div>

          <h1 className="craft-serif text-4xl sm:text-6xl md:text-7xl font-normal text-stone-900 tracking-tight leading-[1.18] mb-6">
            写下做过的事，<br />
            看清下一步往哪走。
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            从一段项目、实习或兴趣开始，整理出你真正做过的事，再用一个小任务试试职业方向。
          </p>

          {/* Craft 5 Outline Icons Row */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 pt-2 pb-10 flex-wrap">
            <button 
              onClick={onStartExplore}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                <FileText className="w-6 h-6 text-stone-800 stroke-[1.5]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700">写下经历</span>
            </button>

            <button 
              onClick={() => onSelectCard(HERO_FLOATING_CARDS[0])}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                <Layers className="w-6 h-6 text-stone-800 stroke-[1.5]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700">看看优势</span>
            </button>

            <button 
              onClick={onOpenExample}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                <CheckSquare className="w-6 h-6 text-stone-800 stroke-[1.5]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700">了解岗位</span>
            </button>

            <button 
              onClick={onOpenAbout}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                <Compass className="w-6 h-6 text-stone-800 stroke-[1.5]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700">动手试试</span>
            </button>

            <button 
              onClick={onOpenWiki}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center group-hover:border-stone-400 transition-colors">
                <Edit3 className="w-6 h-6 text-stone-800 stroke-[1.5]" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-700">回看成长</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onStartExplore}
              className="px-8 py-3.5 rounded-full bg-black text-white text-base font-medium hover:bg-stone-800 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              id="hero-craft-start-btn"
            >
              <span>从一段经历开始</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* 2. CRAFT EDITORIAL BENTO SHOWCASE (Clean Floating Paper Desk) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
        <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-5 text-left">
              <span className="craft-chip-yellow text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3">
                01 · 看见自己
              </span>
              <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                看见经历里<br />
                真正做成的事
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                我们会帮你整理行动、结果和还不确定的地方。每张卡都可以自己修改或删除。
              </p>
              <button
                onClick={onStartExplore}
                className="craft-btn-secondary px-6 py-2 text-xs sm:text-sm cursor-pointer"
              >
                看看怎么整理
              </button>
            </div>

            {/* Right 2x2 Craft Document Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Calendar / Date */}
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

              {/* Card 2: Interactive Tasks with soft tags */}
              <div className="craft-card rounded-2xl p-5 bg-white/95 shadow-sm flex flex-col justify-between min-h-[160px] border border-stone-100">
                <div className="flex items-center justify-between text-stone-800 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-stone-600" />
                    <span>待办能力项</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-normal">点击勾选</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div 
                    onClick={() => toggleTask('task-1')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition"
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-1'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                      {checkedTasks['task-1'] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={checkedTasks['task-1'] ? 'line-through text-stone-400' : 'text-stone-700'}>梳理摄影纪实故事经历</span>
                  </div>

                  <div 
                    onClick={() => toggleTask('task-2')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition"
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-2'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                      {checkedTasks['task-2'] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`flex-1 ${checkedTasks['task-2'] ? 'line-through text-stone-400' : 'text-stone-700'}`}>整理出「共情观察」</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/50">已提取</span>
                  </div>

                  <div 
                    onClick={() => toggleTask('task-3')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 rounded-lg transition"
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${checkedTasks['task-3'] ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'}`}>
                      {checkedTasks['task-3'] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`flex-1 ${checkedTasks['task-3'] ? 'line-through text-stone-400' : 'text-stone-700'}`}>试做一份 AI 需求方案</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-200/50">待验证</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Document Notes */}
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

              {/* Card 4: Reminders */}
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

      {/* 3. CRAFT DOCUMENT WORKBENCH SHOWCASE (Clean Paper Sheet + Editor) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20">
        <div className="craft-card rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-200/50 bg-white/70 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Mac-Style Document Inset */}
            <div className="lg:col-span-7">
              <div className="craft-doc-surface rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-stone-200/60">
                {/* Mac window 3 dots header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  </div>
                  <div className="text-xs text-stone-400 font-mono">
                    AI产品经理实战工作台.craft
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-medium border border-sky-200/60">
                    试做工作台
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="craft-serif text-xl font-medium text-stone-900">
                    AI 产品经理：搜索改版方案 PRD
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    读完用户反馈、接口耗时和漏斗数据后，完成一份清楚的改进方案：
                  </p>

                  <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-stone-200/60 text-xs space-y-1.5">
                    <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      核心策略一：改写与意图识别分级引擎
                    </div>
                    <p className="text-stone-600 text-[11px] pl-3">
                      针对 0 结果与长尾词查询，先接入轻量向量检索与模糊纠错，减少无结果跳出率。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Description */}
            <div className="lg:col-span-5 text-left">
              <span className="craft-chip-blue text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3">
                03 · 动手试试
              </span>
              <h2 className="craft-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight mb-4">
                不只想一想<br />
                也亲手做一次
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                打开一份小任务，看看资料、做出判断，再把这次真实表现记回个人档案。
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-stone-700" />
                  </div>
                  <span>任务资料</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span>按需提示</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-stone-700" />
                  </div>
                  <span>选择能力卡</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>完成后复盘</span>
                </div>
              </div>

              <button
                onClick={onOpenExample}
                className="craft-btn-black px-6 py-2.5 text-xs sm:text-sm cursor-pointer"
              >
                打开试做工作台
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CRAFT STYLE CARDS SKINS GALLERY (Exact Screenshot 7 Gallery) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-20 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
          卡片样式
        </span>
        <h2 className="craft-serif text-3xl sm:text-5xl font-normal text-stone-900 mb-4">
          选择喜欢的卡片样式
        </h2>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto mb-8 font-normal">
          样式只改变卡片的感觉，不会改变你确认过的内容。
          为每一张能力卡定制独特的质感与视觉外观。选择你喜欢的 Craft 主题皮肤：
        </p>

        {/* Skins Grid / Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
          {cardSkins.map((skin) => (
            <motion.div
              key={skin.id}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setActiveSkin(skin.id)}
              className={`craft-card p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between min-h-[170px] ${skin.theme} ${skin.accent} ${activeSkin === skin.id ? 'ring-2 ring-black ring-offset-2' : ''}`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 block mb-1">
                  {skin.category}
                </span>
                <h4 className="font-semibold text-sm mb-2">{skin.title}</h4>
                <p className="text-[11px] opacity-80 leading-relaxed line-clamp-3">
                  {skin.desc}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-[10px] opacity-60">
                <span>{activeSkin === skin.id ? '● 当前选中' : '选择皮肤'}</span>
                <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. USER STORIES / TESTIMONIALS (Screenshot 4) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-16 text-center">
        <h2 className="craft-serif text-2xl sm:text-4xl font-normal text-stone-900 mb-10">
          人们如何使用「选择之前」
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-left">
          
          <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartExplore}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3 overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform">
              <span className="text-3xl">📷</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 uppercase">JON, 摄影创作者</div>
            <p className="text-[11px] text-stone-500 mt-1">视觉构图、光影叙事、共情观察</p>
          </div>

          <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartExplore}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-100 flex items-center justify-center mb-3 overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform">
              <span className="text-3xl">🎨</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 uppercase">SEOYOUNG, 创作者</div>
            <p className="text-[11px] text-stone-500 mt-1">创意灵感、项目拆解、用户体验</p>
          </div>

          <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartExplore}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-sky-100 flex items-center justify-center mb-3 overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform">
              <span className="text-3xl">💼</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 uppercase">GIAN, 项目经理</div>
            <p className="text-[11px] text-stone-500 mt-1">工作报告、项目看板、敏捷协作</p>
          </div>

          <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartExplore}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-200 flex items-center justify-center mb-3 overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform">
              <span className="text-3xl">🚀</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 uppercase">STEPHEN, 跨界探索者</div>
            <p className="text-[11px] text-stone-500 mt-1">能力迁移、目标清单、潜能验证</p>
          </div>

          <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartExplore}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-rose-100 flex items-center justify-center mb-3 overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform">
              <span className="text-3xl">🎓</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 uppercase">AARON, 应届毕业生</div>
            <p className="text-[11px] text-stone-500 mt-1">课程梳理、项目大纲、岗位探索</p>
          </div>

        </div>
      </section>

      {/* 6. AWARDS & BOTTOM ROW (Screenshot 2) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pt-6 border-t border-stone-200/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs font-semibold text-stone-900">App Store 体验</div>
            <div className="text-[11px] text-stone-500">年度优秀交互范式</div>
          </div>
          <div>
            <div className="text-3xl leading-none mb-1 font-sans"></div>
            <div className="text-xs font-semibold text-stone-900">Apple 设计美学</div>
            <div className="text-[11px] text-stone-500">极简工艺与克制体验</div>
          </div>
          <div>
            <div className="text-2xl mb-1">⌨️</div>
            <div className="text-xs font-semibold text-stone-900">Webby 奖项</div>
            <div className="text-[11px] text-stone-500">涵盖多领域创新</div>
          </div>
          <div>
            <div className="text-2xl mb-1">📐</div>
            <div className="text-xs font-semibold text-stone-900">德国设计奖</div>
            <div className="text-[11px] text-stone-500">卓越沟通设计交互体验</div>
          </div>
        </div>
      </section>

    </div>
  );
};
