export type QuestionCategory =
  | 'LEGISLACION'
  | 'ALMACENAMIENTO'
  | 'PSICOTROPICOS'
  | 'FARMACOLOGIA'
  | 'DISPENSACION';

export interface CategoryInfo {
  id: QuestionCategory;
  name: string;
  shortName: string;
  description: string;
  decreeReference: string;
  isProOnly: boolean;
  color: string;
  iconName: string;
}

export interface FarmaciaQuestion {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  normativaReferencia: string; // Ej: "D.S. 466/84 Art. 38"
  enunciado: string;
  casoClinico?: string; // Situación simulada en mostrador
  opciones: {
    id: string;
    texto: string;
  }[];
  respuestaCorrecta: string;
  justificacionOficial: string;
  dificultad: 'BASICA' | 'INTERMEDIA' | 'AVANZADA';
}

export interface LessonSection {
  heading: string;
  content: string;
  keyPoints: string[];
  normativeBadge?: string;
}

export interface CourseLesson {
  id: string;
  category: QuestionCategory;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  isProOnly: boolean;
  sections: LessonSection[];
  quickCheckQuestionId: string;
}

export type StreakStateEnum = 'ACTIVE' | 'AT_RISK' | 'FROZEN' | 'BROKEN';

export interface UserGamificationState {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezeEquipped: number; // max 2 en cuenta free, automático en PRO
  streakSavedToday: boolean;
  streakStatus: StreakStateEnum;
  streakFrozenYesterday?: boolean; // Si un Streak Freeze se consumió para salvar la racha
  brokenStreakDays?: number; // Días de racha rota para la ventana de 48h de reparación
  brokenStreakTimestamp?: number | null; // Momento de la rotura para la ventana de 48h
  timezone?: string; // Zona horaria del dispositivo
  gems: number;
  xp: number;
  hearts: number; // max 5 (para lecciones y práctica)
  maxHearts: number;
  lastHeartRegenTimestamp: number;
  activeBoost: 'EARLY_BIRD' | 'NIGHT_OWL' | null;
  boostExpiresAt: number | null;
  isPro: boolean;
  weeklySimulacroUnlockedByAd: boolean;
  weeklySimulacroUnlockedUntil: number | null;
  completedLessonIds: string[];
  unlockedBadges: string[];
  simulacrosCompletedCount: number;
  perfectScoresCount: number;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  category: 'RACHA' | 'SIMULACRO' | 'ESTUDIO' | 'ESPECIAL';
  icon: string;
  color: string;
  requiredCount: number;
  rewardXp: number;
  rewardGems: number;
  rewardFreeze?: boolean;
}

export interface StudyScheduleSettings {
  enabled: boolean;
  idealTime: string; // "HH:mm", ej: "21:00"
  smartDetection: boolean; // Detección automática según horarios de mayor actividad
  detectedPeakSlot: string; // Ej: "Noche (20:00 - 22:00 hrs)"
  activeDays: number[]; // [0, 1, 2, 3, 4, 5, 6] (0=Domingo, 1=Lunes, etc.)
  soundEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  region: string;
  role: 'ASPIRANTE' | 'AUXILIAR_CADENA' | 'AUXILIAR_INDEPENDIENTE' | 'ESTUDIANTE' | 'SIN_ESPECIFICAR';
  targetExamDate: string;
  notificationsEnabled: boolean;
  streakRemindersEnabled: boolean;
  onboardingCompleted: boolean;
  preTestScore?: number;
  studySchedule?: StudyScheduleSettings;
  fcmToken?: string;
}

export interface CategoryBreakdown {
  total: number;
  correctas: number;
  porcentaje: number;
}

export interface SimulacroResult {
  id: string;
  timestamp: number;
  duracionSegundos: number;
  totalPreguntas: number;
  correctas: number;
  incorrectas: number;
  omitidas: number;
  puntajePorcentaje: number;
  aprobado: boolean; // >= 70% criterio SEREMI
  brechasPorCategoria: Record<QuestionCategory, CategoryBreakdown>;
  respuestasUsuario: Record<string, string>; // questionId -> selectedOptionId
  preguntas: FarmaciaQuestion[];
}
