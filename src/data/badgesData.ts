import { BadgeInfo, UserGamificationState } from '../types/farmacia';

export const BADGES_CATALOG: BadgeInfo[] = [
  {
    id: 'badge_streak_3',
    title: 'Hábito Constante',
    description: 'Estudia 3 días consecutivos sin perder tu racha.',
    category: 'RACHA',
    icon: 'Flame',
    color: 'amber',
    requiredCount: 3,
    rewardXp: 40,
    rewardGems: 15,
  },
  {
    id: 'badge_streak_7',
    title: 'Semana Imparable',
    description: 'Completa 7 días seguidos de estudio activo.',
    category: 'RACHA',
    icon: 'Zap',
    color: 'amber',
    requiredCount: 7,
    rewardXp: 120,
    rewardGems: 30,
    rewardFreeze: true,
  },
  {
    id: 'badge_streak_14',
    title: 'Disciplina SEREMI',
    description: 'Alcanza 14 días de racha ininterrumpida.',
    category: 'RACHA',
    icon: 'Award',
    color: 'emerald',
    requiredCount: 14,
    rewardXp: 250,
    rewardGems: 60,
  },
  {
    id: 'badge_sim_1',
    title: 'Bautismo Oficial',
    description: 'Rinde tu primer Simulacro Oficial SEREMI.',
    category: 'SIMULACRO',
    icon: 'Target',
    color: 'teal',
    requiredCount: 1,
    rewardXp: 50,
    rewardGems: 15,
  },
  {
    id: 'badge_sim_5',
    title: 'Maestro de Simulacros',
    description: 'Completa 5 simulacros oficiales contrarreloj.',
    category: 'SIMULACRO',
    icon: 'Trophy',
    color: 'indigo',
    requiredCount: 5,
    rewardXp: 200,
    rewardGems: 50,
  },
  {
    id: 'badge_perfect_score',
    title: 'Puntaje de Excelencia',
    description: 'Obtén un 90% o más de aprobación en un simulacro oficial.',
    category: 'SIMULACRO',
    icon: 'Sparkles',
    color: 'amber',
    requiredCount: 1,
    rewardXp: 150,
    rewardGems: 35,
  },
  {
    id: 'badge_legislation_master',
    title: 'Experto en D.S. 466',
    description: 'Completa las lecciones de Legislación y Código Sanitario.',
    category: 'ESTUDIO',
    icon: 'Scale',
    color: 'emerald',
    requiredCount: 1,
    rewardXp: 60,
    rewardGems: 20,
  },
  {
    id: 'badge_early_bird',
    title: 'Madrugador Sanitario',
    description: 'Estudia durante el Boost Matutino (06:00 a 12:00 hrs).',
    category: 'ESPECIAL',
    icon: 'Sun',
    color: 'amber',
    requiredCount: 1,
    rewardXp: 40,
    rewardGems: 15,
  },
  {
    id: 'badge_night_owl',
    title: 'Turno de Guardia',
    description: 'Estudia durante el Boost Noctámbulo (18:00 a 23:59 hrs).',
    category: 'ESPECIAL',
    icon: 'Moon',
    color: 'indigo',
    requiredCount: 1,
    rewardXp: 40,
    rewardGems: 15,
  },
];

// Función para calcular el progreso de cada insignia
export function getBadgeProgress(badge: BadgeInfo, state: UserGamificationState): { current: number; max: number; percent: number; isUnlocked: boolean } {
  const isUnlocked = state.unlockedBadges.includes(badge.id);

  let current = 0;
  const max = badge.requiredCount;

  switch (badge.id) {
    case 'badge_streak_3':
    case 'badge_streak_7':
    case 'badge_streak_14':
      current = Math.min(max, state.streakDays);
      break;
    case 'badge_sim_1':
    case 'badge_sim_5':
      current = Math.min(max, state.simulacrosCompletedCount || 0);
      break;
    case 'badge_perfect_score':
      current = Math.min(max, state.perfectScoresCount || 0);
      break;
    case 'badge_legislation_master':
      current = state.completedLessonIds.includes('les_leg_01') ? 1 : 0;
      break;
    case 'badge_early_bird':
    case 'badge_night_owl':
      current = isUnlocked ? 1 : 0;
      break;
    default:
      current = isUnlocked ? 1 : 0;
  }

  const percent = isUnlocked ? 100 : Math.round((current / max) * 100);

  return { current, max, percent, isUnlocked };
}
