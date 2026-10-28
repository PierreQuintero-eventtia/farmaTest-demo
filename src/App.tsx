import React, { useState, useEffect } from 'react';
import { useGamification } from './hooks/useGamification';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { PaywallModal } from './components/PaywallModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { AiExplainModal } from './components/AiExplainModal';
import { DailyDrillModal } from './components/DailyDrillModal';
import { SplashScreen } from './components/SplashScreen';
import { SettingsModal } from './components/SettingsModal';
import { BadgesModal } from './components/BadgesModal';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { HeartsModal } from './components/HeartsModal';
import { StreakRescueModal } from './components/StreakRescueModal';
import { AuthView } from './views/AuthView';
import { OnboardingView } from './views/OnboardingView';
import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { SimulacroView } from './views/SimulacroView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { FarmaciaQuestion, SimulacroResult, UserProfile } from './types/farmacia';
import { auth, logoutUser, syncGamificationToFirestore, deleteUserAccountFromFirestore } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FARMACIA_QUESTIONS } from './data/questionsData';

const USER_PROFILE_KEY = 'farmatest_user_profile_v1';

export default function App() {
  const {
    state,
    availableBoost,
    newlyUnlockedBadge,
    clearNewlyUnlockedBadge,
    consumeHeart,
    refillHearts,
    refillHeartsWithGems,
    earnHeartFromPractice,
    getNextHeartTimeRemaining,
    registerActivity,
    recordSimulacroCompleted,
    repairStreakWithGems,
    repairStreakViaRecoveryLesson,
    dismissFrozenNotification,
    unlockWeeklySimulacroViaAd,
    equipStreakFreeze,
    setProStatus,
    markLessonCompleted,
  } = useGamification();

  // Paso 1: Pantalla Splash inicial
  const [showSplash, setShowSplash] = useState(true);

  // Paso 2: Perfil del Usuario autenticado
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error cargando perfil:', e);
    }
    return null;
  });

  // Modales de Gamificación & Retención
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isHeartsModalOpen, setIsHeartsModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Sincronizar estado con Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !profile) {
        const { getUserProfileFromFirestore } = await import('./lib/firebase');
        const firestoreProfile = await getUserProfileFromFirestore(firebaseUser.uid);
        if (firestoreProfile) {
          setProfile(firestoreProfile);
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(firestoreProfile));
        } else {
          const restoredProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Auxiliar de Farmacia',
            email: firebaseUser.email || 'usuario@farmacia.cl',
            region: 'Región Metropolitana de Santiago',
            role: 'SIN_ESPECIFICAR',
            targetExamDate: '15 de Noviembre 2026',
            notificationsEnabled: true,
            streakRemindersEnabled: true,
            onboardingCompleted: false,
          };
          setProfile(restoredProfile);
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(restoredProfile));
        }
      }
    });

    return () => unsubscribe();
  }, [profile]);

  // Sincronización continua de Racha, Vidas e Inventario con Firestore
  useEffect(() => {
    if (profile?.id) {
      syncGamificationToFirestore(profile.id, state);
    }
  }, [profile?.id, state]);

  // Manejar Login / Registro inicial
  const handleAuthSuccess = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
  };

  // Manejar Finalización del Onboarding & Pre-Test
  const handleCompleteOnboarding = (finalProfile: UserProfile) => {
    setProfile(finalProfile);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(finalProfile));
    
    // 1. Guardar en la base de datos de cuentas del servidor
    fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: finalProfile.id, profile: finalProfile }),
    }).catch((e) => console.warn('Error syncing profile with server:', e));

    // 2. Guardar en la base de datos de Firestore con onboardingCompleted: true
    import('./lib/firebase').then(({ saveUserProfileToFirestore }) => {
      saveUserProfileToFirestore(finalProfile);
    });
    // Bonificación de XP y racha inicial al completar el onboarding
    registerActivity(50, 15);
  };

  const [currentTab, setCurrentTab] = useState<NavTab>('inicio');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal de Anuncio Recompensado
  const [adModal, setAdModal] = useState<{
    isOpen: boolean;
    rewardType: 'HEARTS' | 'SIMULACRO';
  }>({
    isOpen: false,
    rewardType: 'HEARTS',
  });

  // Modal del Tutor IA
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    question: FarmaciaQuestion | null;
    selectedOptionId?: string;
  }>({
    isOpen: false,
    question: null,
  });

  // Modal de Entrenamiento Diario / Práctica / Rescate
  const [drillModal, setDrillModal] = useState<{
    isOpen: boolean;
    questions: FarmaciaQuestion[];
    title?: string;
    mode?: 'DAILY' | 'PRACTICE_FOR_HEART' | 'STREAK_RECOVERY';
  }>({
    isOpen: false,
    questions: [],
    mode: 'DAILY',
  });

  // Último resultado de simulacro
  const [lastResult, setLastResult] = useState<SimulacroResult | null>(null);

  const handleFinishSimulacro = (result: SimulacroResult) => {
    setLastResult(result);
    const xpGain = result.aprobado ? 150 : 80;
    registerActivity(xpGain, result.aprobado ? 30 : 10);
    // Registrar finalización del simulacro oficial para insignias
    recordSimulacroCompleted(result.puntajePorcentaje);
    setCurrentTab('diagnostico');
  };

  const handleRewardGranted = () => {
    if (adModal.rewardType === 'HEARTS') {
      refillHearts();
    } else {
      unlockWeeklySimulacroViaAd();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Error signing out:', e);
    }
    localStorage.removeItem(USER_PROFILE_KEY);
    setProfile(null);
  };

  const handleDeleteAccount = async () => {
    if (profile?.id) {
      // 1. Eliminar de la base de datos de cuentas en el servidor
      try {
        await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.id, email: profile.email }),
        });
      } catch (e) {
        console.warn('Error deleting account on server:', e);
      }

      // 2. Eliminar de Firestore y Firebase Auth
      await deleteUserAccountFromFirestore(profile.id);
    }

    // 3. Borrar completamente todos los rastros y datos en almacenamiento local
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem('farmatest_auth_user');
    localStorage.removeItem('farmatest_fcm_token');
    localStorage.removeItem('farmatest_gamification_state');
    localStorage.removeItem('farmatest_gamification_state_v1');
    localStorage.removeItem('farmatest_gamification_state_v2');
    localStorage.removeItem('farmatest_simulacro_history');

    // 4. Desactivar modales y resetear sesión -> Redirige a pantalla de Login
    setProfile(null);
    setIsSettingsOpen(false);
  };

  // Lanzar práctica de repaso para ganar vidas
  const handleStartPracticeForHeart = () => {
    const shuffled = [...FARMACIA_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
    setDrillModal({
      isOpen: true,
      questions: shuffled,
      title: 'Práctica de Repaso (+1 ❤️)',
      mode: 'PRACTICE_FOR_HEART',
    });
  };

  // Lanzar lección de rescate de racha
  const handleStartRecoveryLesson = () => {
    const shuffled = [...FARMACIA_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
    setDrillModal({
      isOpen: true,
      questions: shuffled,
      title: 'Lección de Rescate Sanitario',
      mode: 'STREAK_RECOVERY',
    });
  };

  // =========================================================================
  // FLUJO DE NAVEGACIÓN SOLICITADO:
  // 1. Splash Screen
  // 2. Pantalla de Autenticación (Solo Correo y Contraseña / Google)
  // 3. Pantallas de Pre-información y Pre-test (Región, Rol, 3 preguntas pre-test)
  // 4. Dashboard Principal
  // =========================================================================

  // Paso 1: Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Paso 2: Si no tiene sesión iniciada, mostrar AuthView (solo correo y contraseña)
  if (!profile) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Paso 3: Si tiene cuenta pero no ha completado el Onboarding/Pre-test
  if (!profile.onboardingCompleted) {
    return (
      <OnboardingView
        initialProfile={profile}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  // Paso 4: Dashboard Principal de la Aplicación (100% viewport, sin scroll vertical)
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-hidden">
      {/* Top App Bar */}
      <MobileTopBar
        state={state}
        profile={profile}
        availableBoost={availableBoost}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onOpenHeartsModal={() => setIsHeartsModalOpen(true)}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setProfile(null)}
      />

      {/* Main Screen Content - Flex 1 ajustado exactamente al alto restante */}
      <main className="flex-1 w-full max-w-md mx-auto overflow-hidden flex flex-col p-2.5 sm:p-3.5">
        {currentTab === 'inicio' && (
          <HomeView
            state={state}
            availableBoost={availableBoost}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenAdForSimulacro={() => setAdModal({ isOpen: true, rewardType: 'SIMULACRO' })}
            onStartDailyDrill={(questions) =>
              setDrillModal({ isOpen: true, questions, mode: 'DAILY' })
            }
            onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
            onOpenHeartsModal={() => setIsHeartsModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentTab === 'cursos' && (
          <CoursesView
            state={state}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onLessonCompleted={(lessonId) => {
              markLessonCompleted(lessonId);
              registerActivity(40, 10);
            }}
            onConsumeHeart={consumeHeart}
          />
        )}

        {currentTab === 'simulacro' && (
          <SimulacroView
            state={state}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenAdForSimulacro={() => setAdModal({ isOpen: true, rewardType: 'SIMULACRO' })}
            onFinishSimulacro={handleFinishSimulacro}
          />
        )}

        {currentTab === 'diagnostico' && (
          <DiagnosticsView
            lastResult={lastResult}
            isPro={state.isPro}
            onOpenAiExplain={(question, selectedOptionId) =>
              setAiModal({ isOpen: true, question, selectedOptionId })
            }
            onStartNewSimulacro={() => setCurrentTab('simulacro')}
            onNavigateToCourses={() => setCurrentTab('cursos')}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        )}
      </main>

      {/* Bottom Thumb Navigation Bar */}
      <BottomNavBar currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />

      {/* Modales Layer */}
      <PaywallModal
        isOpen={isPaywallOpen}
        isPro={state.isPro}
        onClose={() => setIsPaywallOpen(false)}
        onTogglePro={(status) => setProStatus(status)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        profile={profile}
        state={state}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
        }}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onReplaySplash={() => setShowSplash(true)}
      />

      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        state={state}
      />

      <BadgeUnlockModal
        badge={newlyUnlockedBadge}
        onClose={clearNewlyUnlockedBadge}
      />

      <HeartsModal
        isOpen={isHeartsModalOpen}
        onClose={() => setIsHeartsModalOpen(false)}
        state={state}
        getNextHeartTimeRemaining={getNextHeartTimeRemaining}
        onRefillWithGems={() => refillHeartsWithGems(350)}
        onStartPracticeForHeart={handleStartPracticeForHeart}
        onWatchAdForHearts={() => {
          setIsHeartsModalOpen(false);
          setAdModal({ isOpen: true, rewardType: 'HEARTS' });
        }}
        onOpenPaywall={() => {
          setIsHeartsModalOpen(false);
          setIsPaywallOpen(true);
        }}
      />

      <StreakRescueModal
        isOpen={isStreakModalOpen}
        onClose={() => {
          setIsStreakModalOpen(false);
          dismissFrozenNotification();
        }}
        state={state}
        onRepairWithGems={() => repairStreakWithGems(300)}
        onStartRecoveryLesson={handleStartRecoveryLesson}
        onEquipFreeze={equipStreakFreeze}
      />

      <RewardedAdModal
        isOpen={adModal.isOpen}
        rewardType={adModal.rewardType}
        onClose={() => setAdModal({ isOpen: false, rewardType: 'HEARTS' })}
        onRewardGranted={handleRewardGranted}
      />

      <AiExplainModal
        isOpen={aiModal.isOpen}
        question={aiModal.question}
        selectedOptionId={aiModal.selectedOptionId}
        isPro={state.isPro}
        onClose={() => setAiModal({ isOpen: false, question: null })}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      <DailyDrillModal
        isOpen={drillModal.isOpen}
        questions={drillModal.questions}
        title={drillModal.title}
        mode={drillModal.mode}
        hearts={state.hearts}
        isPro={state.isPro}
        onClose={() => setDrillModal({ isOpen: false, questions: [], mode: 'DAILY' })}
        onConsumeHeart={consumeHeart}
        onCompleteDrill={(xp, gems) => registerActivity(xp, gems)}
        onHeartEarned={() => earnHeartFromPractice()}
        onRecoverySuccess={() => repairStreakViaRecoveryLesson()}
        onOpenAdForHearts={() => setAdModal({ isOpen: true, rewardType: 'HEARTS' })}
      />
    </div>
  );
}
