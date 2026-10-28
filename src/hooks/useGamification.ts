import { useState, useEffect, useCallback } from 'react';
import { UserGamificationState, BadgeInfo, StreakStateEnum } from '../types/farmacia';
import { BADGES_CATALOG } from '../data/badgesData';

const STORAGE_KEY = 'farmatest_gamification_state_v2';
const HEART_REGEN_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 horas por corazón (25h de 0 a 5)
const STREAK_REPAIR_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 horas de ventana para rescate de racha

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_STATE: UserGamificationState = {
  streakDays: 4,
  lastActiveDate: getYesterdayString(),
  freezeEquipped: 1, // 1 protector precargado de bienvenida
  streakSavedToday: false,
  streakStatus: 'ACTIVE',
  streakFrozenYesterday: false,
  brokenStreakDays: 0,
  brokenStreakTimestamp: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago',
  gems: 380,
  xp: 450,
  hearts: 5,
  maxHearts: 5,
  lastHeartRegenTimestamp: Date.now(),
  activeBoost: null,
  boostExpiresAt: null,
  isPro: false,
  weeklySimulacroUnlockedByAd: false,
  weeklySimulacroUnlockedUntil: null,
  completedLessonIds: ['les_leg_01'],
  unlockedBadges: ['badge_streak_3', 'badge_legislation_master'],
  simulacrosCompletedCount: 1,
  perfectScoresCount: 0,
};

export function useGamification() {
  const [state, setState] = useState<UserGamificationState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
      // Migrate from v1 if exists
      const oldStored = localStorage.getItem('farmatest_gamification_state_v1');
      if (oldStored) {
        return { ...DEFAULT_STATE, ...JSON.parse(oldStored) };
      }
    } catch (e) {
      console.warn('Error leyendo gamification state:', e);
    }
    return DEFAULT_STATE;
  });

  // Insignia recién desbloqueada para disparar celebración modal
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeInfo | null>(null);

  // Persistir en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error guardando gamification state:', e);
    }
  }, [state]);

  // =========================================================================
  // SISTEMA DE VIDAS / CORAZONES (Health System)
  // - 1 corazón cada 5 horas (18,000,000 ms)
  // - Máximo 5 corazones
  // =========================================================================
  useEffect(() => {
    if (state.isPro || state.hearts >= state.maxHearts) return;

    const checkRegen = () => {
      const now = Date.now();
      const elapsed = now - state.lastHeartRegenTimestamp;
      const heartsToAdd = Math.floor(elapsed / HEART_REGEN_INTERVAL_MS);

      if (heartsToAdd > 0) {
        setState((prev) => {
          const newHearts = Math.min(prev.maxHearts, prev.hearts + heartsToAdd);
          const remainder = elapsed % HEART_REGEN_INTERVAL_MS;
          return {
            ...prev,
            hearts: newHearts,
            lastHeartRegenTimestamp: now - remainder,
          };
        });
      }
    };

    checkRegen();
    const interval = setInterval(checkRegen, 15000); // Revisar cada 15 seg
    return () => clearInterval(interval);
  }, [state.isPro, state.hearts, state.maxHearts, state.lastHeartRegenTimestamp]);

  // =========================================================================
  // MÁQUINA DE ESTADOS DE LA RACHA (Streak Lifecycle)
  // 1. Activa: Completada hoy antes de las 23:59.
  // 2. En Riesgo: Son las 18:00+ y no se ha completado lección hoy.
  // 3. Congelada: Pasó el día sin lección, pero tenía Streak Freeze.
  // 4. Rota / En Recuperación: No tenía protector, ventana de 48h de reparación.
  // =========================================================================
  useEffect(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const currentHour = new Date().getHours();

    setState((prev) => {
      let updated = { ...prev };
      let changed = false;

      // 1. Si ya estudió hoy
      if (prev.lastActiveDate === today) {
        if (!prev.streakSavedToday || prev.streakStatus !== 'ACTIVE') {
          updated.streakSavedToday = true;
          updated.streakStatus = 'ACTIVE';
          changed = true;
        }
      }
      // 2. Si estudió ayer pero hoy aún no
      else if (prev.lastActiveDate === yesterday) {
        if (prev.streakSavedToday) {
          updated.streakSavedToday = false;
          changed = true;
        }
        // Pasadas las 18:00 entra en riesgo urgente
        const targetStatus: StreakStateEnum = currentHour >= 18 ? 'AT_RISK' : 'ACTIVE';
        if (prev.streakStatus !== targetStatus) {
          updated.streakStatus = targetStatus;
          changed = true;
        }
      }
      // 3. Pasó más de 1 día sin actividad (ayer no estudió)
      else if (prev.lastActiveDate < yesterday) {
        // ¿Tenía Streak Freeze disponible?
        if (prev.freezeEquipped > 0) {
          updated.freezeEquipped = Math.max(0, prev.freezeEquipped - 1);
          updated.lastActiveDate = yesterday; // Congelamos el día perdido
          updated.streakFrozenYesterday = true;
          updated.streakSavedToday = false;
          updated.streakStatus = 'FROZEN';
          changed = true;
        } else {
          // No tenía protector -> Racha rota con ventana de recuperación de 48h
          if (prev.streakDays > 0) {
            updated.brokenStreakDays = prev.streakDays;
            updated.brokenStreakTimestamp = Date.now();
            updated.streakDays = 0;
            updated.streakStatus = 'BROKEN';
            updated.streakSavedToday = false;
            changed = true;
          }
        }
      }

      // 4. Validar expiración de la ventana de 48 horas de recuperación
      if (
        updated.streakStatus === 'BROKEN' &&
        updated.brokenStreakTimestamp &&
        Date.now() - updated.brokenStreakTimestamp > STREAK_REPAIR_WINDOW_MS
      ) {
        updated.brokenStreakTimestamp = null;
        updated.brokenStreakDays = 0;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, []);

  // Chequeo de Boost Horario (Early Bird: 06:00-12:00 / Night Owl: 18:00-23:59)
  const getAvailableBoost = useCallback((): 'EARLY_BIRD' | 'NIGHT_OWL' | null => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      return 'EARLY_BIRD';
    } else if (currentHour >= 18 && currentHour <= 23) {
      return 'NIGHT_OWL';
    }
    return null;
  }, []);

  // Evaluador interno de insignias
  const evaluateBadges = useCallback(
    (
      currentState: UserGamificationState,
      extra?: { simulacroFinished?: boolean; scorePercent?: number; boostUsed?: 'EARLY_BIRD' | 'NIGHT_OWL' }
    ) => {
      let newlyAwarded: BadgeInfo | null = null;
      let bonusXp = 0;
      let bonusGems = 0;
      let bonusFreeze = 0;
      const newUnlocked = [...(currentState.unlockedBadges || [])];

      BADGES_CATALOG.forEach((badge) => {
        if (newUnlocked.includes(badge.id)) return;

        let shouldUnlock = false;

        switch (badge.id) {
          case 'badge_streak_3':
            shouldUnlock = currentState.streakDays >= 3;
            break;
          case 'badge_streak_7':
            shouldUnlock = currentState.streakDays >= 7;
            break;
          case 'badge_streak_14':
            shouldUnlock = currentState.streakDays >= 14;
            break;
          case 'badge_sim_1':
            shouldUnlock = (currentState.simulacrosCompletedCount || 0) >= 1;
            break;
          case 'badge_sim_5':
            shouldUnlock = (currentState.simulacrosCompletedCount || 0) >= 5;
            break;
          case 'badge_perfect_score':
            shouldUnlock =
              (currentState.perfectScoresCount || 0) >= 1 ||
              (extra?.scorePercent !== undefined && extra.scorePercent >= 90);
            break;
          case 'badge_legislation_master':
            shouldUnlock = currentState.completedLessonIds.includes('les_leg_01');
            break;
          case 'badge_early_bird':
            shouldUnlock = extra?.boostUsed === 'EARLY_BIRD' || getAvailableBoost() === 'EARLY_BIRD';
            break;
          case 'badge_night_owl':
            shouldUnlock = extra?.boostUsed === 'NIGHT_OWL' || getAvailableBoost() === 'NIGHT_OWL';
            break;
        }

        if (shouldUnlock) {
          newUnlocked.push(badge.id);
          bonusXp += badge.rewardXp;
          bonusGems += badge.rewardGems;
          if (badge.rewardFreeze) bonusFreeze += 1;
          if (!newlyAwarded) newlyAwarded = badge;
        }
      });

      if (newUnlocked.length > (currentState.unlockedBadges?.length || 0)) {
        if (newlyAwarded) {
          setNewlyUnlockedBadge(newlyAwarded);
        }

        return {
          ...currentState,
          unlockedBadges: newUnlocked,
          xp: currentState.xp + bonusXp,
          gems: currentState.gems + bonusGems,
          freezeEquipped: Math.min(2, (currentState.freezeEquipped || 0) + bonusFreeze),
        };
      }

      return currentState;
    },
    [getAvailableBoost]
  );

  // Consumir 1 corazón al fallar en lecciones o práctica
  const consumeHeart = useCallback((): boolean => {
    if (state.isPro) return true;
    if (state.hearts <= 0) return false;

    setState((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
      lastHeartRegenTimestamp: prev.hearts === prev.maxHearts ? Date.now() : prev.lastHeartRegenTimestamp,
    }));
    return true;
  }, [state.isPro, state.hearts, state.maxHearts]);

  // Recarga activa ("Practice to Earn Hearts"): lección de repaso exitosa otorga +1 corazón
  const earnHeartFromPractice = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
      xp: prev.xp + 15,
      gems: prev.gems + 5,
    }));
  }, []);

  // Recarga instantánea con Gemas (350 gemas por recarga completa)
  const refillHeartsWithGems = useCallback((cost = 350): boolean => {
    if (state.gems < cost) return false;

    setState((prev) => ({
      ...prev,
      gems: prev.gems - cost,
      hearts: prev.maxHearts,
      lastHeartRegenTimestamp: Date.now(),
    }));
    return true;
  }, [state.gems]);

  // Recarga completa (ej: tras video rewarded o activar PRO)
  const refillHearts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      lastHeartRegenTimestamp: Date.now(),
    }));
  }, []);

  // Calcular tiempo restante para el siguiente corazón
  const getNextHeartTimeRemaining = useCallback((): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } => {
    if (state.hearts >= state.maxHearts || state.isPro) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const elapsed = Date.now() - state.lastHeartRegenTimestamp;
    const remainingMs = Math.max(0, HEART_REGEN_INTERVAL_MS - (elapsed % HEART_REGEN_INTERVAL_MS));
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
  }, [state.hearts, state.maxHearts, state.isPro, state.lastHeartRegenTimestamp]);

  // Registrar actividad (lección o test completado) y procesar racha e insignias
  const registerActivity = useCallback(
    (earnedXp: number, earnedGems: number = 5) => {
      setState((prev) => {
        const today = getTodayString();
        const yesterday = getYesterdayString();
        const isAlreadyActiveToday = prev.lastActiveDate === today;

        let newStreak = prev.streakDays;
        if (!isAlreadyActiveToday) {
          if (prev.lastActiveDate === yesterday) {
            newStreak += 1;
          } else {
            // Si venía de una racha rota o congelada
            newStreak = Math.max(1, prev.streakDays === 0 ? 1 : prev.streakDays + 1);
          }
        }

        const boost = getAvailableBoost();
        const multiplier = boost ? 2 : 1;
        const totalXpGain = earnedXp * multiplier;

        const intermediateState: UserGamificationState = {
          ...prev,
          streakDays: newStreak,
          lastActiveDate: today,
          streakSavedToday: true,
          streakStatus: 'ACTIVE',
          streakFrozenYesterday: false,
          xp: prev.xp + totalXpGain,
          gems: prev.gems + earnedGems,
        };

        return evaluateBadges(intermediateState, { boostUsed: boost || undefined });
      });
    },
    [getAvailableBoost, evaluateBadges]
  );

  // Registrar finalización de un Simulacro Oficial
  const recordSimulacroCompleted = useCallback(
    (scorePercent: number) => {
      setState((prev) => {
        const isPerfect = scorePercent >= 90;
        const updatedState: UserGamificationState = {
          ...prev,
          simulacrosCompletedCount: (prev.simulacrosCompletedCount || 0) + 1,
          perfectScoresCount: (prev.perfectScoresCount || 0) + (isPerfect ? 1 : 0),
        };

        return evaluateBadges(updatedState, { simulacroFinished: true, scorePercent });
      });
    },
    [evaluateBadges]
  );

  // Reparación de Racha (Streak Repair) con Gemas (300 gemas) dentro de las 48 horas
  const repairStreakWithGems = useCallback((cost = 300): boolean => {
    if (state.gems < cost || !state.brokenStreakDays) return false;

    setState((prev) => ({
      ...prev,
      gems: prev.gems - cost,
      streakDays: prev.brokenStreakDays || 1,
      brokenStreakDays: 0,
      brokenStreakTimestamp: null,
      streakStatus: 'ACTIVE',
      streakSavedToday: true,
      lastActiveDate: getTodayString(),
    }));
    return true;
  }, [state.gems, state.brokenStreakDays]);

  // Reparación de Racha mediante Lección de Rescate Intensiva
  const repairStreakViaRecoveryLesson = useCallback(() => {
    setState((prev) => ({
      ...prev,
      streakDays: prev.brokenStreakDays || 1,
      brokenStreakDays: 0,
      brokenStreakTimestamp: null,
      streakStatus: 'ACTIVE',
      streakSavedToday: true,
      lastActiveDate: getTodayString(),
      xp: prev.xp + 50,
      gems: prev.gems + 15,
    }));
  }, []);

  // Descartar notificación de protector de racha usado anoche
  const dismissFrozenNotification = useCallback(() => {
    setState((prev) => ({ ...prev, streakFrozenYesterday: false }));
  }, []);

  // Equipar protector de racha gastando 200 gemas
  const equipStreakFreeze = useCallback((): boolean => {
    if (state.gems < 200 || state.freezeEquipped >= 2) return false;
    setState((prev) => ({
      ...prev,
      gems: prev.gems - 200,
      freezeEquipped: prev.freezeEquipped + 1,
    }));
    return true;
  }, [state.gems, state.freezeEquipped]);

  // Desbloquear simulacro semanal mediante anuncio
  const unlockWeeklySimulacroViaAd = useCallback(() => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    setState((prev) => ({
      ...prev,
      weeklySimulacroUnlockedByAd: true,
      weeklySimulacroUnlockedUntil: Date.now() + oneWeekMs,
    }));
  }, []);

  // Cambiar estado PRO
  const setProStatus = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isPro: active,
      hearts: active ? prev.maxHearts : prev.hearts,
      freezeEquipped: active ? 2 : prev.freezeEquipped,
    }));
  }, []);

  // Marcar lección teórica completada
  const markLessonCompleted = useCallback(
    (lessonId: string) => {
      setState((prev) => {
        if (prev.completedLessonIds.includes(lessonId)) return prev;
        const intermediateState: UserGamificationState = {
          ...prev,
          completedLessonIds: [...prev.completedLessonIds, lessonId],
          xp: prev.xp + 40,
          gems: prev.gems + 10,
        };
        return evaluateBadges(intermediateState);
      });
    },
    [evaluateBadges]
  );

  return {
    state,
    availableBoost: getAvailableBoost(),
    newlyUnlockedBadge,
    clearNewlyUnlockedBadge: () => setNewlyUnlockedBadge(null),
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
  };
}
