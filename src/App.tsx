import React, { useEffect, useState } from 'react';
import { ScreenMode, SkillCard, WorkplaceDoc, EvaluationReport, UserAuth } from './types';
import { HERO_FLOATING_CARDS, STAGE_ONE_TASK, STAGE_TWO_SIMULATION } from './data/mockData';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ExperienceInputScreen } from './components/ExperienceInputScreen';
import { AbilityCardVerificationScreen } from './components/AbilityCardVerificationScreen';
import { CareerExploreScreen } from './components/CareerExploreScreen';
import { StageOneValidation } from './components/StageOneValidation';
import { StageTwoSimulation } from './components/StageTwoSimulation';
import { ExperienceEndScreen } from './components/ExperienceEndScreen';
import { AuthModal } from './components/AuthModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CareerWikiModal } from './components/CareerWikiModal';
import { ExampleShowcaseModal } from './components/ExampleShowcaseModal';
import { FigmaGuideModal } from './components/FigmaGuideModal';
import { ReportModal } from './components/ReportModal';
import { UserProfileScreen } from './components/UserProfileScreen';
import { GlobalAIAgentWidget } from './components/GlobalAIAgentWidget';
import { useProfileCards } from './hooks/useProfileCards';
import { motion, AnimatePresence } from 'motion/react';

function mergeCardsById(existing: SkillCard[], incoming: SkillCard[]): SkillCard[] {
  const cardsById = new Map(existing.map(card => [card.id, card]));
  incoming.forEach(card => cardsById.set(card.id, card));
  return Array.from(cardsById.values());
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('landing');
  const [unlockedCards, setUnlockedCards] = useState<SkillCard[]>(HERO_FLOATING_CARDS.slice(0, 3));
  const [draftCards, setDraftCards] = useState<SkillCard[]>(HERO_FLOATING_CARDS.slice(0, 3));
  const [activeSlottedCards, setActiveSlottedCards] = useState<(SkillCard | null)[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [isFigmaGuideOpen, setIsFigmaGuideOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SkillCard | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<WorkplaceDoc | null>(null);
  const { cards: persistedCards, confirmCards } = useProfileCards();

  useEffect(() => {
    if (persistedCards.length > 0) {
      setUnlockedCards(prev => mergeCardsById(prev, persistedCards));
    }
  }, [persistedCards]);
  
  const [auth, setAuth] = useState<UserAuth>({
    isLoggedIn: false,
  });

  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>({
    score: 96,
    grade: 'S',
    summary: '你的方案展现出卓越的AI产品经理业务直觉与结构化落地功底！准确通过数据与日志溯源，并提出了高ROI的交互闭环。',
    radarScores: [
      { dimension: '用户同理与痛点洞察', score: 98, description: '精准命中46%冗长回答抱怨，提出结论先行原则' },
      { dimension: 'AI架构与技术理解', score: 94, description: '提出意图识别分流与Prompt降耗，技术可行性高' },
      { dimension: '交互体验与微创新', score: 96, description: '引入主动追问澄清Pill芯片，显著提升人机交互流畅度' },
      { dimension: '商业价值与ROI度量', score: 95, description: '清晰量化Token降本25%与留存提升目标，具备商业闭环' }
    ],
    strengths: [
      '逻辑严密：从工单定性到漏斗定量，形成了完美的双向归因验证',
      '懂AI边界：没有盲目堆砌模型参数，而是善用交互卡片弥补模型的不确定性',
      '交付感强：PRD结构清晰，研发与设计同学能直接执行落地'
    ],
    recommendations: [
      '可进一步细化多模态（如表格与代码导出）的复制交互规格',
      '可增加灰度A/B测试方案的分组比例与防穿帮指标（Guardrail Metrics）'
    ],
    careerFitAdvice: '你非常适合AI产品经理（AI PM）及AI体验架构师岗位，具备极强的端到端产品定义力！'
  });

  const handleLoginSuccess = (email: string) => {
    setAuth({
      isLoggedIn: true,
      user: {
        name: email.split('@')[0] || '探索者',
        email: email,
        unlockedCards: unlockedCards,
      },
    });
  };

  const handleStageTwoSubmit = (report: EvaluationReport) => {
    setEvaluationReport(report);
    // Add new skill card
    const newCard: SkillCard = {
      id: 'card-prd-pro',
      title: 'AI产品落地与PRD交付',
      category: '协作沟通',
      description: '将大模型能力转化为清晰的高质量PRD与人机交互规格说明',
      detail: '具备完整的架构分流定义、主动澄清卡片交互与ROI度量能力。',
      icon: 'Award',
      colorTone: 'emerald',
      workplaceApplication: '在真实团队中带领研发与算法敏捷落地AI功能。'
    };
    if (!unlockedCards.some(c => c.id === newCard.id)) {
      setUnlockedCards([...unlockedCards, newCard]);
    }
    // Navigate to Experience End Screen matching Image 4
    setCurrentScreen('experience-end');
  };

  const [isStageTwoFocusMode, setIsStageTwoFocusMode] = useState<boolean>(false);

  // Dynamic subtle ambient glows matching Craft.do warm paper workspace
  const getScreenBackground = (screen: ScreenMode) => {
    if (screen === 'stage2' && isStageTwoFocusMode) {
      return 'bg-[#18181B]';
    }
    return 'bg-[#FAF9F6]';
  };

  return (
    <div className={`min-h-screen ${getScreenBackground(currentScreen)} text-[#1C1A18] flex flex-col selection:bg-amber-100 selection:text-amber-900 transition-colors duration-500 relative overflow-x-hidden`}>
      
      {/* Subtle Craft Digital Paper Ambient Atmosphere (Soft, warm, restrained) */}
      {!(currentScreen === 'stage2' && isStageTwoFocusMode) && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle warm light glow top left */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-100/25 blur-3xl" />
          {/* Subtle stage-adaptive soft glow top right */}
          <div className={`absolute top-0 -right-20 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-700 ${
            currentScreen === 'input-experience' || currentScreen === 'verify-cards' ? 'bg-emerald-100/20' :
            currentScreen === 'career-explore' || currentScreen === 'stage1' ? 'bg-amber-100/25' :
            currentScreen === 'stage2' ? 'bg-sky-100/20' :
            'bg-orange-100/20'
          }`} />
          {/* Subtle bottom center diffuse warmth */}
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-stone-200/20 blur-3xl" />
        </div>
      )}

      {/* Header - Only hidden when entering Focus Mode inside Stage 2 */}
      {!(currentScreen === 'stage2' && isStageTwoFocusMode) && (
        <Header
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            setIsStageTwoFocusMode(false);
            if (screen === 'auth') {
              setIsAuthOpen(true);
            } else {
              setCurrentScreen(screen);
            }
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenFigmaGuide={() => setIsFigmaGuideOpen(true)}
          isLoggedIn={auth.isLoggedIn}
          unlockedCardCount={unlockedCards.length}
        />
      )}

      {/* Main Screen Router with smooth Craft editorial transitions */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentScreen === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingHero
                onStartExplore={() => setCurrentScreen('input-experience')}
                onOpenWiki={() => setIsWikiOpen(true)}
                onOpenExample={() => setCurrentScreen('stage1')}
                onOpenAbout={() => setIsExampleOpen(true)}
                onSelectCard={(card) => setSelectedCard(card)}
              />
            </motion.div>
          )}

          {currentScreen === 'input-experience' && (
            <motion.div
              key="input-experience"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ExperienceInputScreen
                onGenerateCards={(cards) => {
                  setDraftCards(cards);
                  setCurrentScreen('verify-cards');
                }}
                onBackToLanding={() => setCurrentScreen('landing')}
              />
            </motion.div>
          )}

          {currentScreen === 'verify-cards' && (
            <motion.div
              key="verify-cards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <AbilityCardVerificationScreen
                initialCards={draftCards}
                allAccumulatedCards={unlockedCards}
                onConfirmAndSaveToPool={async (newCards) => {
                  const storedCards = await confirmCards(newCards);
                  setUnlockedCards(prev => mergeCardsById(prev, storedCards));
                }}
                onContinueSupplement={() => {
                  setCurrentScreen('input-experience');
                }}
                onStartCareerExplore={() => {
                  setCurrentScreen('career-explore');
                }}
                onModifyExperience={() => setCurrentScreen('input-experience')}
                onRegenerate={() => setCurrentScreen('input-experience')}
              />
            </motion.div>
          )}

          {currentScreen === 'career-explore' && (
            <motion.div
              key="career-explore"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <CareerExploreScreen
                unlockedCards={unlockedCards}
                onStartStageOne={(roleTitle) => {
                  setCurrentScreen('stage1');
                }}
                onStartStageTwo={() => {
                  setCurrentScreen('stage2');
                }}
                onOpenWikiModal={() => setIsWikiOpen(true)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onOpenAgentChat={(agentId) => {
                  window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: agentId || 'career_path' } }));
                }}
                onSlotsChange={(slots) => setActiveSlottedCards(slots)}
              />
            </motion.div>
          )}

          {currentScreen === 'stage1' && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StageOneValidation
                onAdvanceToStageTwo={() => setCurrentScreen('stage2')}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onBackToExplore={() => setCurrentScreen('career-explore')}
                onOpenAgentChat={(agentId) => {
                  window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: agentId || 'career_path' } }));
                }}
              />
            </motion.div>
          )}

          {currentScreen === 'stage2' && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StageTwoSimulation
                onOpenDoc={(doc) => setSelectedDoc(doc)}
                onBackToStageOne={() => {
                  setIsStageTwoFocusMode(false);
                  setCurrentScreen('stage1');
                }}
                onNavigate={(screen) => {
                  setIsStageTwoFocusMode(false);
                  setCurrentScreen(screen);
                }}
                onFocusModeChange={(isFocus) => setIsStageTwoFocusMode(isFocus)}
                onSubmitSuccess={(report) => {
                  setIsStageTwoFocusMode(false);
                  handleStageTwoSubmit(report);
                }}
              />
            </motion.div>
          )}

          {currentScreen === 'experience-end' && (
            <motion.div
              key="experience-end"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ExperienceEndScreen
                allAccumulatedCards={unlockedCards}
                onEnterProfile={() => {
                  setCurrentScreen('profile');
                }}
                onContinueExplore={() => setCurrentScreen('career-explore')}
                onAddExperience={() => setCurrentScreen('input-experience')}
                onOpenAgentChat={(agentId) => {
                  window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: agentId || 'review_reflection' } }));
                }}
                onUpdateDeckSuccess={(cards) => {
                  setUnlockedCards(prev => [...prev, ...cards.filter(c => !prev.some(p => p.id === c.id))]);
                }}
              />
            </motion.div>
          )}

          {currentScreen === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <UserProfileScreen
                unlockedCards={unlockedCards}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onOpenAgentChat={(agentId) => {
                  window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: agentId || 'review_reflection' } }));
                }}
                onStartNewTask={() => setCurrentScreen('stage2')}
                initialArchTab="reports"
              />
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <UserProfileScreen
                unlockedCards={unlockedCards}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onOpenAgentChat={(agentId) => {
                  window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: agentId || 'review_reflection' } }));
                }}
                onStartNewTask={() => setCurrentScreen('stage2')}
                initialArchTab="insight"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CareerWikiModal
        isOpen={isWikiOpen}
        onClose={() => setIsWikiOpen(false)}
        onSelectCareer={() => {
          setIsWikiOpen(false);
          setCurrentScreen('stage1');
        }}
      />

      <ExampleShowcaseModal
        isOpen={isExampleOpen}
        onClose={() => setIsExampleOpen(false)}
        onTryExperience={() => {
          setIsExampleOpen(false);
          setCurrentScreen('input-experience');
        }}
      />

      <FigmaGuideModal
        isOpen={isFigmaGuideOpen}
        onClose={() => setIsFigmaGuideOpen(false)}
        onSelectStep={(step) => {
          setIsFigmaGuideOpen(false);
          if (step === 1) setCurrentScreen('input-experience');
          else if (step === 2) setCurrentScreen('career-explore');
          else if (step === 3) setCurrentScreen('stage1');
          else if (step === 4) setCurrentScreen('stage2');
          else if (step === 5) setCurrentScreen('experience-end');
          else if (step === 6) setIsReportOpen(true);
        }}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={evaluationReport}
        onRestart={() => {
          setIsReportOpen(false);
          setCurrentScreen('career-explore');
        }}
        onViewAllCards={() => {
          setIsReportOpen(false);
          setCurrentScreen('profile');
        }}
      />

      <CardDetailModal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard}
      />

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        doc={selectedDoc}
      />

      {/* Global Conversational AI Agent Widget (Apple Liquid Glass Floating Copilot) */}
      <GlobalAIAgentWidget
        currentScreen={currentScreen}
        unlockedCards={unlockedCards}
        slottedCards={activeSlottedCards}
        onNavigateToScreen={(screen) => setCurrentScreen(screen)}
        onOpenWiki={() => setIsWikiOpen(true)}
      />

    </div>
  );
}
