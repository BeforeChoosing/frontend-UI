import React, { useEffect, useState } from 'react';
import { ScreenMode, SkillCard, UserAuth } from './types';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ExperienceInputScreen } from './components/ExperienceInputScreen';
import { AbilityCardVerificationScreen } from './components/AbilityCardVerificationScreen';
import { CareerExploreScreen } from './components/CareerExploreScreen';
import { DynamicTrialTaskScreen } from './components/DynamicTrialTaskScreen';
import { AuthModal } from './components/AuthModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CareerWikiModal } from './components/CareerWikiModal';
import { ExampleShowcaseModal } from './components/ExampleShowcaseModal';
import { FigmaGuideModal } from './components/FigmaGuideModal';
import { UserProfileScreen } from './components/UserProfileScreen';
import { StageTransition } from './components/StageTransition';
import { AppModeSwitcher } from './components/AppModeSwitcher';
import { useProfileCards } from './hooks/useProfileCards';
import type { ApiCareerRecommendation, ApiExperienceSummary, ProfileCardPatchRequest, TrialTaskId } from './types/api';
import { loadDemoProgress, saveDemoProgress, trialStepKey } from './services/demoProgress';
import { createCareerSelectionSignature } from './services/careerRecommendationState';
import { loadAppMode, saveAppMode, type AppMode } from './services/appMode';
import {
  DEMO_CAREER_RECOMMENDATION,
  DEMO_EXPERIENCE_TEXT,
  DEMO_PROFILE_EVIDENCE,
  DEMO_SKILL_CARDS,
} from './data/demoMode';
import { AnimatePresence, MotionConfig } from 'motion/react';

function mergeCardsById(existing: SkillCard[], incoming: SkillCard[]): SkillCard[] {
  const cardsById = new Map(existing.map(card => [card.id, card]));
  incoming.forEach(card => cardsById.set(card.id, card));
  return Array.from(cardsById.values());
}

export default function App() {
  const [initialAppMode] = useState(loadAppMode);
  const [initialProgress] = useState(loadDemoProgress);
  const demoSelectedCards = DEMO_SKILL_CARDS.slice(0, 4);
  const [appMode, setAppMode] = useState<AppMode>(initialAppMode);
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>(initialAppMode === 'demo' ? 'landing' : initialProgress.currentScreen);
  const [selectedTrialTaskId, setSelectedTrialTaskId] = useState<TrialTaskId>(initialAppMode === 'demo' ? 'A-02' : initialProgress.selectedTrialTaskId);
  const [careerSelectedCardIds, setCareerSelectedCardIds] = useState<string[]>(initialAppMode === 'demo' ? demoSelectedCards.map(card => card.id) : initialProgress.careerSelectedCardIds);
  const [careerRecommendation, setCareerRecommendation] = useState<ApiCareerRecommendation | null>(initialAppMode === 'demo' ? null : initialProgress.careerRecommendation);
  const [careerRecommendationCardSignature, setCareerRecommendationCardSignature] = useState<string | null>(initialAppMode === 'demo' ? null : initialProgress.careerRecommendationCardSignature);
  const [unlockedCards, setUnlockedCards] = useState<SkillCard[]>([]);
  const [draftCards, setDraftCards] = useState<SkillCard[]>(initialAppMode === 'demo' ? DEMO_SKILL_CARDS.slice(0, 3) : []);
  const [draftExperience, setDraftExperience] = useState<ApiExperienceSummary | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [isFigmaGuideOpen, setIsFigmaGuideOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SkillCard | null>(null);
  const {
    cards: persistedCards,
    version: profileVersion,
    updatedAt: profileUpdatedAt,
    evidence: profileEvidence,
    status: profileStatus,
    refresh: refreshProfile,
    confirmCards,
    updateCard,
    removeCard,
  } = useProfileCards();

  useEffect(() => {
    if (persistedCards.length > 0) {
      setUnlockedCards(prev => mergeCardsById(prev, persistedCards));
    }
  }, [persistedCards]);

  useEffect(() => {
    if (appMode !== 'use') return;
    saveDemoProgress({
      currentScreen,
      selectedTrialTaskId,
      careerSelectedCardIds,
      careerRecommendation,
      careerRecommendationCardSignature,
    });
  }, [appMode, careerRecommendation, careerRecommendationCardSignature, careerSelectedCardIds, currentScreen, selectedTrialTaskId]);

  const handleAppModeChange = (nextMode: AppMode) => {
    if (nextMode === appMode) return;
    saveAppMode(nextMode);
    setAppMode(nextMode);
    setIsStageTwoFocusMode(false);
    if (nextMode === 'demo') {
      const selectedCards = DEMO_SKILL_CARDS.slice(0, 4);
      window.localStorage.setItem(trialStepKey('A-02', 'demo'), '0');
      setCurrentScreen('landing');
      setSelectedTrialTaskId('A-02');
      setCareerSelectedCardIds(selectedCards.map(card => card.id));
      setCareerRecommendation(null);
      setCareerRecommendationCardSignature(null);
      setDraftCards(DEMO_SKILL_CARDS.slice(0, 3));
      setDraftExperience(null);
      return;
    }
    const progress = loadDemoProgress();
    setCurrentScreen(progress.currentScreen);
    setSelectedTrialTaskId(progress.selectedTrialTaskId);
    setCareerSelectedCardIds(progress.careerSelectedCardIds);
    setCareerRecommendation(progress.careerRecommendation);
    setCareerRecommendationCardSignature(progress.careerRecommendationCardSignature);
    setDraftCards([]);
    setDraftExperience(null);
  };

  const handleUpdateProfileCard = async (
    cardId: string,
    patch: ProfileCardPatchRequest,
  ) => {
    const storedCards = await updateCard(cardId, patch);
    setUnlockedCards(prev => mergeCardsById(prev, storedCards));
  };

  const handleDeleteProfileCard = async (cardId: string) => {
    await removeCard(cardId);
    setUnlockedCards(prev => prev.filter(card => card.id !== cardId));
  };
  
  const [auth, setAuth] = useState<UserAuth>({
    isLoggedIn: false,
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

  const [isStageTwoFocusMode, setIsStageTwoFocusMode] = useState<boolean>(false);
  const activeCards = appMode === 'demo' ? DEMO_SKILL_CARDS : persistedCards;

  // Dynamic subtle ambient glows matching Craft.do warm paper workspace
  const getScreenBackground = (screen: ScreenMode) => {
    if (screen === 'stage2' && isStageTwoFocusMode) {
      return 'bg-[#18181B]';
    }
    return 'bg-[#FAF9F6]';
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className={`min-h-screen ${getScreenBackground(currentScreen)} text-[#1C1A18] flex flex-col selection:bg-amber-100 selection:text-amber-900 transition-colors duration-150 relative overflow-x-hidden`}>
      
      {/* Subtle Craft Digital Paper Ambient Atmosphere (Soft, warm, restrained) */}
      {!(currentScreen === 'stage2' && isStageTwoFocusMode) && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle warm light glow top left */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-100/25 blur-3xl" />
          {/* Subtle stage-adaptive soft glow top right */}
          <div
            className={`absolute top-0 -right-20 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-150 ${
            currentScreen === 'input-experience' || currentScreen === 'verify-cards' ? 'bg-emerald-100/20' :
            currentScreen === 'career-explore' ? 'bg-amber-100/25' :
            currentScreen === 'stage2' ? 'bg-sky-100/20' :
            'bg-orange-100/20'
          }`}
          />
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
          unlockedCardCount={activeCards.length}
        />
      )}

      {!isStageTwoFocusMode && <AppModeSwitcher appMode={appMode} onChange={handleAppModeChange} />}

      {/* Main Screen Router with smooth Craft editorial transitions */}
      <main className="flex-1 relative z-10">
          <AnimatePresence initial={false}>
          {currentScreen === 'landing' && (
            <StageTransition key="landing">
              <LandingHero
                onStartExplore={() => setCurrentScreen('input-experience')}
                onOpenWiki={() => setIsWikiOpen(true)}
                onOpenExample={() => setCurrentScreen('stage2')}
                onOpenAbout={() => setIsExampleOpen(true)}
                onSelectCard={(card) => setSelectedCard(card)}
              />
            </StageTransition>
          )}

          {currentScreen === 'input-experience' && (
            <StageTransition key={`input-experience-${appMode}`}>
              <ExperienceInputScreen
                onGenerateCards={(cards, experience) => {
                  setDraftCards(cards);
                  setDraftExperience(experience);
                  setCurrentScreen('verify-cards');
                }}
                onBackToLanding={() => setCurrentScreen('landing')}
                demoMode={appMode === 'demo'}
                demoCards={DEMO_SKILL_CARDS.slice(0, 3)}
                demoExperienceText={DEMO_EXPERIENCE_TEXT}
              />
            </StageTransition>
          )}

          {currentScreen === 'verify-cards' && (
            <StageTransition key="verify-cards">
              <AbilityCardVerificationScreen
                initialCards={draftCards}
                initialExperience={draftExperience}
                allAccumulatedCards={unlockedCards}
                onConfirmAndSaveToPool={async (newCards) => {
                  if (appMode === 'demo') {
                    setUnlockedCards(prev => mergeCardsById(prev, newCards));
                    return;
                  }
                  const storedCards = await confirmCards(newCards);
                  setUnlockedCards(prev => mergeCardsById(prev, storedCards));
                }}
                onWithdrawConfirmedCard={async (cardId) => {
                  if (appMode === 'demo') {
                    setUnlockedCards(prev => prev.filter(card => card.id !== cardId));
                    return;
                  }
                  await handleDeleteProfileCard(cardId);
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
            </StageTransition>
          )}

          {currentScreen === 'career-explore' && (
            <StageTransition key="career-explore">
              <CareerExploreScreen
                confirmedCards={activeCards}
                profileReady={appMode === 'demo' || profileStatus === 'success'}
                initialSelectedCardIds={careerSelectedCardIds}
                initialRecommendation={careerRecommendation}
                initialRecommendationCardSignature={careerRecommendationCardSignature}
                demoRecommendation={appMode === 'demo' ? DEMO_CAREER_RECOMMENDATION : null}
                onStartStageTwo={(taskId) => {
                  setSelectedTrialTaskId(taskId);
                  setCurrentScreen('stage2');
                }}
                onSelectionChange={setCareerSelectedCardIds}
                onRecommendationChange={(nextRecommendation, cardSignature) => {
                  setCareerRecommendation(nextRecommendation);
                  setCareerRecommendationCardSignature(cardSignature);
                }}
                onOpenWikiModal={() => setIsWikiOpen(true)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
              />
            </StageTransition>
          )}

          {currentScreen === 'stage2' && (
            <StageTransition key={`stage2-${appMode}`}>
              <DynamicTrialTaskScreen
                taskId={selectedTrialTaskId}
                confirmedCards={activeCards}
                demoMode={appMode === 'demo'}
                onBackToExplore={() => setCurrentScreen('career-explore')}
                onEnterProfile={() => setCurrentScreen('profile')}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onTrialComplete={refreshProfile}
                onFocusModeChange={setIsStageTwoFocusMode}
              />
            </StageTransition>
          )}


          {currentScreen === 'report' && (
            <StageTransition key="report">
              <UserProfileScreen
                persistedCards={activeCards}
                profileEvidence={appMode === 'demo' ? DEMO_PROFILE_EVIDENCE : profileEvidence}
                profileVersion={appMode === 'demo' ? 4 : profileVersion}
                profileUpdatedAt={appMode === 'demo' ? DEMO_PROFILE_EVIDENCE[0].created_at : profileUpdatedAt}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onUpdateCard={appMode === 'use' ? handleUpdateProfileCard : undefined}
                onDeleteCard={appMode === 'use' ? handleDeleteProfileCard : undefined}
                readOnly={appMode === 'demo'}
                initialArchTab="reports"
              />
            </StageTransition>
          )}

          {currentScreen === 'profile' && (
            <StageTransition key="profile">
              <UserProfileScreen
                persistedCards={activeCards}
                profileEvidence={appMode === 'demo' ? DEMO_PROFILE_EVIDENCE : profileEvidence}
                profileVersion={appMode === 'demo' ? 4 : profileVersion}
                profileUpdatedAt={appMode === 'demo' ? DEMO_PROFILE_EVIDENCE[0].created_at : profileUpdatedAt}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onUpdateCard={appMode === 'use' ? handleUpdateProfileCard : undefined}
                onDeleteCard={appMode === 'use' ? handleDeleteProfileCard : undefined}
                readOnly={appMode === 'demo'}
                initialArchTab="insight"
              />
            </StageTransition>
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
          setCurrentScreen('stage2');
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
          else if (step === 3) setCurrentScreen('stage2');
          else if (step === 4) setCurrentScreen('stage2');
          else if (step === 5 || step === 6) setCurrentScreen('profile');
        }}
      />

      <CardDetailModal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard}
      />

    </div>
    </MotionConfig>
  );
}
