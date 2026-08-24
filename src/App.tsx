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
import { useProfileCards } from './hooks/useProfileCards';
import type { ApiCareerRecommendation, ProfileCardPatchRequest, TrialTaskId } from './types/api';
import { loadDemoProgress, saveDemoProgress } from './services/demoProgress';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';

function mergeCardsById(existing: SkillCard[], incoming: SkillCard[]): SkillCard[] {
  const cardsById = new Map(existing.map(card => [card.id, card]));
  incoming.forEach(card => cardsById.set(card.id, card));
  return Array.from(cardsById.values());
}

export default function App() {
  const [initialProgress] = useState(loadDemoProgress);
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>(initialProgress.currentScreen);
  const [selectedTrialTaskId, setSelectedTrialTaskId] = useState<TrialTaskId>(initialProgress.selectedTrialTaskId);
  const [careerSelectedCardIds, setCareerSelectedCardIds] = useState<string[]>(initialProgress.careerSelectedCardIds);
  const [careerRecommendation, setCareerRecommendation] = useState<ApiCareerRecommendation | null>(initialProgress.careerRecommendation);
  const [careerRecommendationCardSignature, setCareerRecommendationCardSignature] = useState<string | null>(initialProgress.careerRecommendationCardSignature);
  const [unlockedCards, setUnlockedCards] = useState<SkillCard[]>([]);
  const [draftCards, setDraftCards] = useState<SkillCard[]>([]);
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
    saveDemoProgress({
      currentScreen,
      selectedTrialTaskId,
      careerSelectedCardIds,
      careerRecommendation,
      careerRecommendationCardSignature,
    });
  }, [careerRecommendation, careerRecommendationCardSignature, careerSelectedCardIds, currentScreen, selectedTrialTaskId]);

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

  // Dynamic subtle ambient glows matching Craft.do warm paper workspace
  const getScreenBackground = (screen: ScreenMode) => {
    if (screen === 'stage2' && isStageTwoFocusMode) {
      return 'bg-[#18181B]';
    }
    return 'bg-[#FAF9F6]';
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className={`min-h-screen ${getScreenBackground(currentScreen)} text-[#1C1A18] flex flex-col selection:bg-amber-100 selection:text-amber-900 transition-colors duration-500 relative overflow-x-hidden`}>
      
      {/* Subtle Craft Digital Paper Ambient Atmosphere (Soft, warm, restrained) */}
      {!(currentScreen === 'stage2' && isStageTwoFocusMode) && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle warm light glow top left */}
          <motion.div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-100/25 blur-3xl"
            animate={{ x: [0, 18, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Subtle stage-adaptive soft glow top right */}
          <motion.div
            animate={{ x: [0, -14, 0], y: [0, 16, 0], scale: [1.02, 0.98, 1.02] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-0 -right-20 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-700 ${
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
          unlockedCardCount={unlockedCards.length}
        />
      )}

      {/* Main Screen Router with smooth Craft editorial transitions */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
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
            <StageTransition key="input-experience">
              <ExperienceInputScreen
                onGenerateCards={(cards) => {
                  setDraftCards(cards);
                  setCurrentScreen('verify-cards');
                }}
                onBackToLanding={() => setCurrentScreen('landing')}
              />
            </StageTransition>
          )}

          {currentScreen === 'verify-cards' && (
            <StageTransition key="verify-cards">
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
            </StageTransition>
          )}

          {currentScreen === 'career-explore' && (
            <StageTransition key="career-explore">
              <CareerExploreScreen
                confirmedCards={persistedCards}
                profileReady={profileStatus === 'success'}
                initialSelectedCardIds={careerSelectedCardIds}
                initialRecommendation={careerRecommendation}
                initialRecommendationCardSignature={careerRecommendationCardSignature}
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
            <StageTransition key="stage2">
              <DynamicTrialTaskScreen
                taskId={selectedTrialTaskId}
                confirmedCards={persistedCards}
                onBackToExplore={() => setCurrentScreen('career-explore')}
                onEnterProfile={() => setCurrentScreen('profile')}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onTrialComplete={refreshProfile}
              />
            </StageTransition>
          )}


          {currentScreen === 'report' && (
            <StageTransition key="report">
              <UserProfileScreen
                persistedCards={persistedCards}
                profileEvidence={profileEvidence}
                profileVersion={profileVersion}
                profileUpdatedAt={profileUpdatedAt}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onUpdateCard={handleUpdateProfileCard}
                onDeleteCard={handleDeleteProfileCard}
                initialArchTab="reports"
              />
            </StageTransition>
          )}

          {currentScreen === 'profile' && (
            <StageTransition key="profile">
              <UserProfileScreen
                persistedCards={persistedCards}
                profileEvidence={profileEvidence}
                profileVersion={profileVersion}
                profileUpdatedAt={profileUpdatedAt}
                auth={auth}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onOpenCardDetail={(card) => setSelectedCard(card)}
                onUpdateCard={handleUpdateProfileCard}
                onDeleteCard={handleDeleteProfileCard}
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
