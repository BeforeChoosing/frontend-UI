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
import { GrowthCompanionWidget } from './components/GrowthCompanionWidget';
import { useProfileCards } from './hooks/useProfileCards';
import type { ApiCareerRecommendation, ApiExperienceSummary, ProfileCardPatchRequest, TrialTaskId } from './types/api';
import { loadDemoProgress, saveDemoProgress } from './services/demoProgress';
import { createCareerSelectionSignature } from './services/careerRecommendationState';
import { loadAppMode, saveAppMode, type AppMode } from './services/appMode';
import { resetDemoReplayStorage } from './services/demoReplay';
import { resetPendingDemoTrialLoads } from './hooks/useDynamicTrialTask';
import {
  DEMO_CAREER_RECOMMENDATION,
  DEMO_EXPERIENCE_TEXT,
  DEMO_PROFILE_EVIDENCE,
  DEMO_SKILL_CARDS,
} from './data/demoMode';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { auditEvent, clearAccessToken, getAccessToken } from './api/client';
import { getCurrentUser, logout as logoutAccount } from './api/auth';
import type { AuthSession } from './api/auth';

function mergeCardsById(existing: SkillCard[], incoming: SkillCard[]): SkillCard[] {
  const cardsById = new Map(existing.map(card => [card.id, card]));
  incoming.forEach(card => cardsById.set(card.id, card));
  return Array.from(cardsById.values());
}

export default function App() {
  const [initialAppMode] = useState(loadAppMode);
  const [initialProgress] = useState(() => loadDemoProgress(
    initialAppMode,
    initialAppMode === 'demo'
      ? {
          draftCards: DEMO_SKILL_CARDS.slice(0, 3),
        }
      : {},
    window.localStorage,
    initialAppMode === 'use' ? null : undefined,
  ));
  const [appMode, setAppMode] = useState<AppMode>(initialAppMode);
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>(initialProgress.currentScreen);
  const [selectedTrialTaskId, setSelectedTrialTaskId] = useState<TrialTaskId>(initialProgress.selectedTrialTaskId);
  const [careerSelectedCardIds, setCareerSelectedCardIds] = useState<string[]>(initialProgress.careerSelectedCardIds);
  const [careerRecommendation, setCareerRecommendation] = useState<ApiCareerRecommendation | null>(initialProgress.careerRecommendation);
  const [careerRecommendationCardSignature, setCareerRecommendationCardSignature] = useState<string | null>(initialProgress.careerRecommendationCardSignature);
  const [unlockedCards, setUnlockedCards] = useState<SkillCard[]>([]);
  const [demoUnlockedCards, setDemoUnlockedCards] = useState<SkillCard[]>([]);
  const [draftCards, setDraftCards] = useState<SkillCard[]>(initialProgress.draftCards);
  const [draftExperience, setDraftExperience] = useState<ApiExperienceSummary | null>(initialProgress.draftExperience);
  const [demoReplayId, setDemoReplayId] = useState(0);
  const [profileFocusRequest, setProfileFocusRequest] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [isFigmaGuideOpen, setIsFigmaGuideOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SkillCard | null>(null);
  const [auth, setAuth] = useState<UserAuth>({
    isLoggedIn: false,
  });
  const [authChecking, setAuthChecking] = useState(initialAppMode === 'use');
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
  } = useProfileCards(appMode !== 'use' || auth.isLoggedIn);

  const restoreFormalProgress = (userId: string) => {
    const progress = loadDemoProgress('use', {}, window.localStorage, userId);
    setCurrentScreen(progress.currentScreen);
    setSelectedTrialTaskId(progress.selectedTrialTaskId);
    setCareerSelectedCardIds(progress.careerSelectedCardIds);
    setCareerRecommendation(progress.careerRecommendation);
    setCareerRecommendationCardSignature(progress.careerRecommendationCardSignature);
    setDraftCards(progress.draftCards);
    setDraftExperience(progress.draftExperience);
  };

  useEffect(() => {
    if (persistedCards.length > 0) {
      setUnlockedCards(prev => mergeCardsById(prev, persistedCards));
    }
  }, [persistedCards]);

  useEffect(() => {
    if (appMode === 'use' && !auth.user?.id) return;
    saveDemoProgress({
      currentScreen,
      selectedTrialTaskId,
      careerSelectedCardIds,
      careerRecommendation,
      careerRecommendationCardSignature,
      draftCards,
      draftExperience,
    }, appMode, window.localStorage, auth.user?.id);
  }, [appMode, auth.user?.id, careerRecommendation, careerRecommendationCardSignature, careerSelectedCardIds, currentScreen, draftCards, draftExperience, selectedTrialTaskId]);

  useEffect(() => {
    if (appMode !== 'use') return undefined;
    const describe = (element: Element) => {
      const target = element as HTMLElement;
      const label = target.dataset.auditAction || target.getAttribute('aria-label') || target.textContent?.trim() || target.tagName;
      return { label: label.slice(0, 120), target: target.id || target.getAttribute('name') || target.dataset.auditTarget || target.tagName.toLowerCase() };
    };
    const onClick = (event: Event) => {
      const element = (event.target as Element | null)?.closest('button,a,[role="button"]');
      if (!element) return;
      const info = describe(element);
      void auditEvent('ui_click', info.target, { label: info.label });
    };
    const onChange = (event: Event) => {
      const element = (event.target as Element | null)?.closest('input,select,textarea');
      if (!element) return;
      const info = describe(element);
      void auditEvent('ui_change', info.target, { label: info.label, control: element.tagName.toLowerCase() });
    };
    const onSubmit = (event: Event) => {
      const form = (event.target as Element | null)?.closest('form');
      if (!form) return;
      const info = describe(form);
      void auditEvent('ui_submit', info.target, { label: info.label });
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('change', onChange, true);
    document.addEventListener('submit', onSubmit, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('change', onChange, true);
      document.removeEventListener('submit', onSubmit, true);
    };
  }, [appMode]);

  useEffect(() => {
    if (appMode !== 'use') {
      setAuthChecking(false);
      setIsAuthOpen(false);
      return;
    }
    let active = true;
    setAuthChecking(true);
    const token = getAccessToken();
    if (!token) {
      setAuth({ isLoggedIn: false });
      setUnlockedCards([]);
      setAuthChecking(false);
      setIsAuthOpen(true);
      return () => {
        active = false;
      };
    }
    void getCurrentUser()
      .then((user) => {
        if (!active) return;
        restoreFormalProgress(user.id);
        setAuth({
          isLoggedIn: true,
          user: {
            id: user.id,
            name: user.display_name,
            email: user.email,
            unlockedCards: unlockedCards,
          },
        });
        setIsAuthOpen(false);
      })
      .catch(() => {
        if (!active) return;
        clearAccessToken();
        setAuth({ isLoggedIn: false });
        setUnlockedCards([]);
        setCurrentScreen('landing');
        setSelectedTrialTaskId('A-02');
        setCareerSelectedCardIds([]);
        setCareerRecommendation(null);
        setCareerRecommendationCardSignature(null);
        setDraftCards([]);
        setDraftExperience(null);
        setIsAuthOpen(true);
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [appMode]);

  useEffect(() => {
    const onAuthRequired = () => {
      if (appMode !== 'use') return;
      setAuth({ isLoggedIn: false });
      setUnlockedCards([]);
      setCurrentScreen('landing');
      setSelectedTrialTaskId('A-02');
      setCareerSelectedCardIds([]);
      setCareerRecommendation(null);
      setCareerRecommendationCardSignature(null);
      setDraftCards([]);
      setDraftExperience(null);
      setIsAuthOpen(true);
    };
    window.addEventListener('before-choosing:auth-required', onAuthRequired);
    return () => window.removeEventListener('before-choosing:auth-required', onAuthRequired);
  }, [appMode]);

  const handleAppModeChange = (nextMode: AppMode) => {
    if (nextMode === appMode) return;
    saveDemoProgress({
      currentScreen,
      selectedTrialTaskId,
      careerSelectedCardIds,
      careerRecommendation,
      careerRecommendationCardSignature,
      draftCards,
      draftExperience,
    }, appMode, window.localStorage, auth.user?.id);
    saveAppMode(nextMode);
    setAppMode(nextMode);
    if (nextMode === 'use' && !getAccessToken()) {
      setAuth({ isLoggedIn: false });
      setIsAuthOpen(true);
      setAuthChecking(false);
    }
    if (nextMode === 'demo') {
      setAuthChecking(false);
      setIsAuthOpen(false);
    }
    setIsStageTwoFocusMode(false);
    const progress = loadDemoProgress(
      nextMode,
      nextMode === 'demo'
        ? {
            draftCards: DEMO_SKILL_CARDS.slice(0, 3),
          }
        : {},
      window.localStorage,
      nextMode === 'use' ? auth.user?.id || null : undefined,
    );
    setCurrentScreen(progress.currentScreen);
    setSelectedTrialTaskId(progress.selectedTrialTaskId);
    setCareerSelectedCardIds(progress.careerSelectedCardIds);
    setCareerRecommendation(progress.careerRecommendation);
    setCareerRecommendationCardSignature(progress.careerRecommendationCardSignature);
    setDraftCards(progress.draftCards);
    setDraftExperience(progress.draftExperience);
  };

  const handleReplayDemo = () => {
    resetDemoReplayStorage();
    resetPendingDemoTrialLoads();
    setIsStageTwoFocusMode(false);
    setCurrentScreen('landing');
    setSelectedTrialTaskId('A-02');
    setCareerSelectedCardIds([]);
    setCareerRecommendation(null);
    setCareerRecommendationCardSignature(null);
    setUnlockedCards(persistedCards);
    setDemoUnlockedCards([]);
    setDraftCards(DEMO_SKILL_CARDS.slice(0, 3));
    setDraftExperience(null);
    setIsAuthOpen(false);
    setIsWikiOpen(false);
    setIsExampleOpen(false);
    setIsFigmaGuideOpen(false);
    setSelectedCard(null);
    setDemoReplayId(current => current + 1);
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

  const handleLoginSuccess = (session: AuthSession) => {
    restoreFormalProgress(session.user.id);
    setAuth({
      isLoggedIn: true,
      user: {
        id: session.user.id,
        name: session.user.display_name,
        email: session.user.email,
        unlockedCards: unlockedCards,
      },
    });
    setAuthChecking(false);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAccount();
    } finally {
      setAuth({ isLoggedIn: false });
      setUnlockedCards([]);
      setCurrentScreen('landing');
      setSelectedTrialTaskId('A-02');
      setCareerSelectedCardIds([]);
      setCareerRecommendation(null);
      setCareerRecommendationCardSignature(null);
      setDraftCards([]);
      setDraftExperience(null);
      if (appMode === 'use') setIsAuthOpen(true);
    }
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
          onLogout={handleLogout}
          onOpenFigmaGuide={() => setIsFigmaGuideOpen(true)}
          isLoggedIn={auth.isLoggedIn}
          unlockedCardCount={activeCards.length}
        />
      )}

      {!isStageTwoFocusMode && <AppModeSwitcher appMode={appMode} onChange={handleAppModeChange} onReplayDemo={handleReplayDemo} />}

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
            <StageTransition key={`input-experience-${appMode}-${auth.user?.id || 'anonymous'}-${demoReplayId}`}>
              <ExperienceInputScreen
                onGenerateCards={(cards, experience) => {
                  setDraftCards(cards);
                  setDraftExperience(experience);
                  setCurrentScreen('verify-cards');
                }}
                onBackToLanding={() => setCurrentScreen('landing')}
                demoMode={appMode === 'demo'}
                userId={auth.user?.id}
                demoCards={DEMO_SKILL_CARDS.slice(0, 3)}
                demoExperienceText={DEMO_EXPERIENCE_TEXT}
                focusRequest={profileFocusRequest}
              />
            </StageTransition>
          )}

          {currentScreen === 'verify-cards' && (
            <StageTransition key={`verify-cards-${appMode}-${demoReplayId}`}>
              <AbilityCardVerificationScreen
                initialCards={draftCards}
                initialExperience={draftExperience}
                allAccumulatedCards={appMode === 'demo' ? demoUnlockedCards : unlockedCards}
                onConfirmAndSaveToPool={async (newCards) => {
                  if (appMode === 'demo') {
                    setDemoUnlockedCards(prev => mergeCardsById(prev, newCards));
                    return;
                  }
                  const storedCards = await confirmCards(newCards);
                  setUnlockedCards(prev => mergeCardsById(prev, storedCards));
                }}
                onWithdrawConfirmedCard={async (cardId) => {
                  if (appMode === 'demo') {
                    setDemoUnlockedCards(prev => prev.filter(card => card.id !== cardId));
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
                storageNamespace={appMode}
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
            <StageTransition key={`stage2-${appMode}-${auth.user?.id || 'anonymous'}-${demoReplayId}`}>
              <DynamicTrialTaskScreen
                taskId={selectedTrialTaskId}
                confirmedCards={activeCards}
                demoMode={appMode === 'demo'}
                userId={auth.user?.id}
                onBackToExplore={() => setCurrentScreen('career-explore')}
                onEnterProfile={() => setCurrentScreen('profile')}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onTaskChange={setSelectedTrialTaskId}
                onTrialComplete={refreshProfile}
                onUpdateCardsFromTrial={async (cards) => {
                  if (appMode === 'demo') {
                    setDemoUnlockedCards(prev => mergeCardsById(prev, cards));
                    return;
                  }
                  const storedCards = await confirmCards(cards);
                  setUnlockedCards(prev => mergeCardsById(prev, storedCards));
                }}
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

      {!isStageTwoFocusMode && (appMode === 'demo' || auth.isLoggedIn) && (
        <GrowthCompanionWidget
          key={`growth-companion-${appMode}-${auth.user?.id || 'anonymous'}-${currentScreen}`}
          demoMode={appMode === 'demo'}
          userId={auth.user?.id}
          currentScreen={currentScreen}
          existingCardTitles={activeCards.map(card => card.title)}
          onContinue={() => {
            setCurrentScreen('input-experience');
            setProfileFocusRequest(value => value + 1);
          }}
        />
      )}

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthOpen || (appMode === 'use' && !authChecking && !auth.isLoggedIn)}
        onClose={() => {
          if (appMode !== 'use' || auth.isLoggedIn) setIsAuthOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        formalMode={appMode === 'use'}
        required={appMode === 'use' && !auth.isLoggedIn}
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
        onStartExample={() => {
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
