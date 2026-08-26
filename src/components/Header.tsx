import React from 'react';
import { ScreenMode } from '../types';
import { Sparkles, Layers, Compass, FileText, BookOpen, User, Palette } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  onOpenAuth: () => void;
  onOpenFigmaGuide: () => void;
  isLoggedIn: boolean;
  unlockedCardCount: number;
}

const STAGE_HEADER_PILLS: Record<ScreenMode, { label: string; bg: string; text: string; dot: string; stageNumber: string }> = {
  landing: { label: '产品概览', bg: 'bg-stone-100/90', text: 'text-stone-700', dot: 'bg-stone-400', stageNumber: '00' },
  auth: { label: '用户登录', bg: 'bg-stone-100/90', text: 'text-stone-700', dot: 'bg-stone-400', stageNumber: '00' },
  'input-experience': { label: '认识自己', bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60', text: 'text-emerald-900', dot: 'bg-emerald-500', stageNumber: '01' },
  'verify-cards': { label: '确认能力卡', bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60', text: 'text-emerald-900', dot: 'bg-emerald-500', stageNumber: '01' },
  'career-explore': { label: '探索方向', bg: 'bg-amber-50 text-amber-900 border border-amber-200/60', text: 'text-amber-950', dot: 'bg-amber-500', stageNumber: '02' },
  stage2: { label: '动手试试', bg: 'bg-sky-50 text-sky-900 border border-sky-200/60', text: 'text-sky-950', dot: 'bg-sky-500', stageNumber: '03' },
  report: { label: '回看成长', bg: 'bg-orange-50 text-orange-950 border border-orange-200/60', text: 'text-orange-950', dot: 'bg-orange-500', stageNumber: '04' },
  profile: { label: '个人档案', bg: 'bg-stone-100/90 text-stone-800 border border-stone-200/60', text: 'text-stone-800', dot: 'bg-stone-500', stageNumber: 'ME' },
};

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenAuth,
  onOpenFigmaGuide,
  isLoggedIn,
  unlockedCardCount,
}) => {
  const currentPill = STAGE_HEADER_PILLS[currentScreen] || STAGE_HEADER_PILLS.landing;

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto mb-3 pointer-events-auto">
      <div className="craft-nav-pill rounded-full px-4 sm:px-6 py-2 flex items-center justify-between transition-all duration-300">
        
        {/* Brand / Craft Style Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
            id="brand-logo-btn"
          >
            <div className="w-7 h-7 rounded-full bg-[#1C1A18] text-white flex items-center justify-center font-bold text-xs tracking-tighter group-hover:opacity-90 transition shadow-xs">
              b.
            </div>
            <span className="font-bold tracking-tight text-[15px] text-[#1C1A18] font-sans lowercase">
              before<span className="text-amber-500 font-bold">.</span>choosing
            </span>
          </button>

          {/* Current Stage Indicator Chip (Craft Minimal Stage Tag) */}
          <div className="hidden sm:flex items-center">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${currentPill.bg} transition-colors duration-300 shadow-2xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentPill.dot}`} />
              <span className="font-mono text-[10px] opacity-70">{currentPill.stageNumber}</span>
              <span>{currentPill.label}</span>
            </span>
          </div>

          {/* Craft Style Navigation Links with Soft Editorial Colors */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-medium">
            {/* Stage 1: Soft Green 认识自己 */}
            <button
              onClick={() => onNavigate('input-experience')}
              className={`transition cursor-pointer px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentScreen === 'input-experience' || currentScreen === 'verify-cards' 
                  ? 'text-emerald-950 font-semibold bg-emerald-100/70 border border-emerald-200/70 shadow-2xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              id="nav-input-tab"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span>认识自己</span>
            </button>

            {/* Stage 2: Soft Warm Yellow 探索方向 */}
            <button
              onClick={() => onNavigate('career-explore')}
              className={`transition cursor-pointer px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentScreen === 'career-explore'
                  ? 'text-amber-950 font-semibold bg-amber-100/70 border border-amber-200/70 shadow-2xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              id="nav-career-explore-tab"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <span>探索方向</span>
            </button>

            {/* Stage 3: Soft Blue 试路验证 */}
            <button
              onClick={() => onNavigate('stage2')}
              className={`transition cursor-pointer px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentScreen === 'stage2' 
                  ? 'text-sky-950 font-semibold bg-sky-100/70 border border-sky-200/70 shadow-2xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              id="nav-stage2-tab"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500/80" />
              <span>动手试试</span>
            </button>

            {/* Stage 4: Soft Coral Orange 复盘成长 */}
            <button
              onClick={() => onNavigate('report')}
              className={`transition cursor-pointer px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentScreen === 'report'
                  ? 'text-orange-950 font-semibold bg-orange-100/70 border border-orange-200/70 shadow-2xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              id="nav-report-tab"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80" />
              <span>回看成长</span>
            </button>
          </nav>
        </div>

        {/* Right Actions - Craft Style User & Black Tactile Pill CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Login / Auth Button */}
          {!isLoggedIn ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100/80 hover:bg-stone-200/80 transition cursor-pointer px-3 py-1.5 rounded-full border border-stone-200/60 shadow-2xs"
              id="header-login-btn"
            >
              <User className="w-3.5 h-3.5 text-stone-600" />
              <span>登录 / 注册</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-1.5 text-xs font-medium transition cursor-pointer px-2.5 py-1 rounded-full ${
                currentScreen === 'profile' 
                  ? 'bg-stone-900 text-white font-medium shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              id="user-profile-btn"
              title="进入个人成长文档"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentScreen === 'profile' ? 'bg-white text-stone-950' : 'bg-stone-200 text-stone-800'
              }`}>
                U
              </div>
              <span className="hidden sm:inline">成长文档</span>
            </button>
          )}

          {/* Craft Black Tactile Pill Button */}
          <button
            onClick={() => {
              if (currentScreen === 'landing') {
                onNavigate('input-experience');
              } else if (currentScreen === 'input-experience') {
                onNavigate('career-explore');
              } else if (currentScreen === 'career-explore') {
                onNavigate('stage2');
              } else {
                onNavigate('report');
              }
            }}
            className="craft-btn-black px-4 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap"
            id="craft-main-cta"
          >
            {currentScreen === 'landing' ? '开始探索' : '下一步'}
          </button>
        </div>

      </div>
    </header>
  );
};
