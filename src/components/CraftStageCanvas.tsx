import React from 'react';
import { motion } from 'motion/react';
import { ScreenMode } from '../types';
import { Sparkles, Calendar, Edit3, Folder, Compass, CheckCircle2, Award, Zap } from 'lucide-react';

export type CraftStageTheme = 'yellow' | 'green' | 'blue' | 'peach' | 'neutral';

interface CraftStageCanvasProps {
  theme: CraftStageTheme;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  activeStageKey?: 'career-explore' | 'stage2' | 'report' | 'input-experience';
  onStageChange?: (screen: ScreenMode) => void;
  showHeroHeader?: boolean;
}

export const CraftStageCanvas: React.FC<CraftStageCanvasProps> = ({
  theme,
  title,
  subtitle,
  children,
  activeStageKey,
  onStageChange,
  showHeroHeader = false,
}) => {
  // Color configuration mapping directly to Craft.do 4 images
  const themeConfig = {
    yellow: {
      bgClass: 'bg-[#FCE677]', // Image 1: Craft Plan/套餐 (Yellow)
      accentColor: '#E6BC0E',
      brushOpacity: 'text-[#E8C423]/60',
      titleDark: 'text-[#2D2403]',
      pillActive: 'bg-white text-stone-900 shadow-md',
      tagBg: 'bg-[#F2D752] text-[#4A3C08]',
      stageName: '职业探索',
      stageDesc: '基于能力线索推演职业方向',
    },
    green: {
      bgClass: 'bg-[#96D4A7]', // Image 3: Craft Organize/整理 (Mint Green)
      accentColor: '#60AB76',
      brushOpacity: 'text-[#7BBF8E]/60',
      titleDark: 'text-[#0E2916]',
      pillActive: 'bg-white text-stone-900 shadow-md',
      tagBg: 'bg-[#7ECA92] text-[#0A2612]',
      stageName: '能力验证',
      stageDesc: '沉淀可追溯的结构化能力证据',
    },
    blue: {
      bgClass: 'bg-[#B8CEFA]', // Image 2: Craft Write/写作 (Periwinkle Blue)
      accentColor: '#7AA3EC',
      brushOpacity: 'text-[#96BAF7]/60',
      titleDark: 'text-[#0D1C3D]',
      pillActive: 'bg-white text-stone-900 shadow-md',
      tagBg: 'bg-[#A3BEF8] text-[#0A1633]',
      stageName: '工作台',
      stageDesc: '统一的实战模拟环境，模拟真实业务命题',
    },
    peach: {
      bgClass: 'bg-[#F4BF87]', // Image 4: Craft Customize/自定义 (Golden Peach)
      accentColor: '#E59B51',
      brushOpacity: 'text-[#EBA866]/60',
      titleDark: 'text-[#3B1E05]',
      pillActive: 'bg-white text-stone-900 shadow-md',
      tagBg: 'bg-[#EDB070] text-[#331802]',
      stageName: '能力报告',
      stageDesc: '形成基于证据的职业能力画像',
    },
    neutral: {
      bgClass: 'bg-[#FAF9F5]',
      accentColor: '#D6D3D1',
      brushOpacity: 'text-stone-300/40',
      titleDark: 'text-stone-900',
      pillActive: 'bg-stone-900 text-white shadow-md',
      tagBg: 'bg-stone-200 text-stone-800',
      stageName: '经历提取',
      stageDesc: '结构化提取过往真实项目与经验',
    }
  }[theme];

  return (
    <div className={`min-h-[calc(100vh-68px)] ${themeConfig.bgClass} flex flex-col justify-between relative overflow-hidden transition-colors duration-500`}>
      
      {/* BACKGROUND BRUSH TEXTURES (Exact organic strokes from Craft.do 4 images) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {theme === 'yellow' && (
          /* Yellow Brush Stripe Bars Pattern (Craft Image 1) */
          <svg className="absolute bottom-0 left-0 w-full h-[180px] sm:h-[240px] opacity-40" preserveAspectRatio="none" viewBox="0 0 1200 200">
            <path
              d="M0 80 Q 300 40, 600 70 T 1200 60 L 1200 200 L 0 200 Z"
              fill="#EAD049"
            />
            {/* Vertical stamp stripes from image 1 */}
            <g fill="#E2C538" opacity="0.6">
              <rect x="50" y="85" width="40" height="90" rx="10" />
              <rect x="150" y="75" width="45" height="100" rx="12" />
              <rect x="260" y="80" width="42" height="95" rx="10" />
              <rect x="370" y="70" width="48" height="105" rx="12" />
              <rect x="480" y="82" width="40" height="92" rx="10" />
              <rect x="590" y="72" width="46" height="102" rx="12" />
              <rect x="700" y="80" width="44" height="96" rx="10" />
              <rect x="810" y="74" width="45" height="100" rx="12" />
              <rect x="920" y="82" width="42" height="94" rx="10" />
              <rect x="1030" y="76" width="46" height="98" rx="12" />
              <rect x="1130" y="80" width="40" height="95" rx="10" />
            </g>
          </svg>
        )}

        {theme === 'blue' && (
          /* Blue Flowing Wave Ribbon Strokes (Craft Image 2) */
          <svg className="absolute bottom-0 left-0 w-full h-[220px] sm:h-[300px] opacity-45" preserveAspectRatio="none" viewBox="0 0 1200 240">
            <path
              d="M-20 200 C 150 140, 300 110, 520 180 C 720 240, 950 120, 1220 170 L 1220 240 L -20 240 Z"
              fill="#9BBDF6"
            />
            <path
              d="M-40 220 C 180 80, 420 190, 780 100 C 980 40, 1100 160, 1240 120 L 1240 240 L -40 240 Z"
              fill="#ABC8FA"
              opacity="0.7"
            />
          </svg>
        )}

        {theme === 'green' && (
          /* Green Organic Horizontal Brush Ribbons (Craft Image 3) */
          <svg className="absolute bottom-0 left-0 w-full h-[200px] sm:h-[260px] opacity-45" preserveAspectRatio="none" viewBox="0 0 1200 220">
            <path
              d="M-10 130 Q 350 90, 700 120 T 1210 100 L 1210 220 L -10 220 Z"
              fill="#79C58E"
            />
            <path
              d="M0 165 C 250 140, 550 170, 850 145 C 1050 125, 1150 150, 1210 140 L 1210 220 L 0 220 Z"
              fill="#8FD3A2"
              opacity="0.8"
            />
          </svg>
        )}

        {theme === 'peach' && (
          /* Peach Energetic Zigzag Scribble Waves (Craft Image 4) */
          <svg className="absolute bottom-0 left-0 w-full h-[220px] sm:h-[280px] opacity-45" preserveAspectRatio="none" viewBox="0 0 1200 240">
            <path
              d="M 50 190 Q 90 80, 130 180 T 210 175 T 290 185 T 370 170 T 450 180 T 530 165 T 610 180 T 690 170 T 770 185 T 850 165 T 930 180 T 1010 170 T 1090 185 T 1170 170 L 1200 240 L 0 240 Z"
              fill="#E8A35E"
            />
            <path
              d="M -20 210 C 200 150, 500 220, 800 160 C 1000 120, 1150 190, 1220 180 L 1220 240 L -20 240 Z"
              fill="#F2B777"
              opacity="0.75"
            />
          </svg>
        )}

      </div>

      {/* OPTIONAL HERO BANNER (Craft.do style big bold serif statement from screenshots) */}
      {showHeroHeader && title && (
        <div className="w-full max-w-4xl mx-auto text-center pt-6 sm:pt-10 pb-4 px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl sm:text-5xl md:text-6xl font-serif font-black ${themeConfig.titleDark} tracking-tight leading-tight craft-serif`}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-sm sm:text-base ${themeConfig.titleDark}/80 mt-3 font-medium max-w-xl mx-auto`}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      {/* MAIN STAGE CONTENT (Children) */}
      <div className="flex-1 flex flex-col justify-start relative z-10 w-full">
        {children}
      </div>

      {/* BOTTOM CRAFT.DO STAGE SWITCHER PILL (Exact 4-tab pill from images) */}
      {onStageChange && (
        <div className="w-full py-4 flex justify-center items-center relative z-20 px-4">
          <div className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full p-1.5 flex items-center gap-1 sm:gap-2 max-w-md">
            
            {/* 1. 职业探索 (Yellow - Image 1: 套餐/规划) */}
            <button
              onClick={() => onStageChange('career-explore')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeStageKey === 'career-explore'
                  ? 'bg-[#FBE472] text-[#2D2403] shadow-xs scale-105'
                  : 'text-stone-600 hover:text-black hover:bg-white/60'
              }`}
              id="craft-stage-btn-explore"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>职业探索</span>
            </button>

            {/* 2. 能力验证 (Green - Image 3: 整理/能力) */}
            <button
              onClick={() => onStageChange('stage2')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeStageKey === 'stage2'
                  ? 'bg-[#96D4A7] text-[#0E2916] shadow-xs scale-105'
                  : 'text-stone-600 hover:text-black hover:bg-white/60'
              }`}
              id="craft-stage-btn-stage2"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>试路验证</span>
            </button>

            {/* 3. 工作台 (Blue - Image 2: 写作/工作台) */}
            <button
              onClick={() => onStageChange('stage2')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeStageKey === 'stage2'
                  ? 'bg-[#B8CEFA] text-[#0D1C3D] shadow-xs scale-105'
                  : 'text-stone-600 hover:text-black hover:bg-white/60'
              }`}
              id="craft-stage-btn-stage2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>工作台</span>
            </button>

            {/* 4. 能力报告 (Peach - Image 4: 自定义/报告) */}
            <button
              onClick={() => onStageChange('report')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeStageKey === 'report'
                  ? 'bg-[#F4BF87] text-[#3B1E05] shadow-xs scale-105'
                  : 'text-stone-600 hover:text-black hover:bg-white/60'
              }`}
              id="craft-stage-btn-report"
            >
              <Award className="w-3.5 h-3.5" />
              <span>能力报告</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
