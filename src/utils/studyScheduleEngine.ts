/**
 * studyScheduleEngine.ts
 * 
 * Algoritmo Heurístico de Detección de Momento Ideal de Estudio
 * (Weighted Circadian Peak & Temporal Histogram Clustering)
 * 
 * Modela la densidad de probabilidad temporal del estudiante mediante:
 * 1. Partición en intervalos circadianos (Time-Buckets de 30 minutos).
 * 2. Ponderación por tipo de actividad y desempeño (simulacros, quizes, boosts).
 * 3. Factor de decaimiento temporal exponencial (Recency Half-Life de 14 días).
 * 4. Desplazamiento anticipatorio (Lead-Time de 15-30 min para inicio de sesión).
 */

import { UserGamificationState, UserProfile } from '../types/farmacia';

export interface ActivityLogEntry {
  timestamp: number; // Unix timestamp en ms
  type: 'SIMULACRO' | 'LESSON' | 'DAILY_DRILL' | 'BOOST_CLAIMED';
  accuracyPercent?: number; // 0 - 100
  durationMinutes?: number;
}

export interface IdealStudyTimeRecommendation {
  recommendedTime: string; // "HH:mm"
  displayLabel: string;
  confidenceScore: number; // 0.0 a 1.0
  dominantSlot: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
  heuristicReason: string;
}

// Ventanas predeterminadas para estudiantes del sector farmacéutico en Chile
const PHARMACY_SLOTS = {
  MORNING_EARLY_BIRD: { time: '08:30', label: '08:30 hrs (Madrugador SEREMI)', slot: 'MORNING' as const },
  AFTERNOON_LUNCH: { time: '13:30', label: '13:30 hrs (Colación / Mediodía)', slot: 'AFTERNOON' as const },
  NIGHT_GUARD: { time: '21:00', label: '21:00 hrs (Turno de Guardia / Post-Turno)', slot: 'NIGHT' as const },
  NIGHT_LATE: { time: '21:30', label: '21:30 hrs (Cierre de Local)', slot: 'NIGHT' as const },
};

/**
 * Ponderación de pesos por tipo de evento
 */
const EVENT_WEIGHTS = {
  SIMULACRO: 3.0,     // Examen completo refleja máxima concentración
  LESSON: 2.0,        // Lección teórica completada
  DAILY_DRILL: 1.5,   // Micro-entrenamiento
  BOOST_CLAIMED: 2.5, // Aprovechamiento intencional del boost horario
};

/**
 * Calcula el Momento Ideal de Estudio basado en el estado de gamificación,
 * insignias activas y distribución temporal de actividad.
 */
export function calculateIdealStudyTime(
  state: UserGamificationState,
  profile?: UserProfile | null,
  recentLogs: ActivityLogEntry[] = []
): IdealStudyTimeRecommendation {
  // Si no hay suficientes logs detallados, se aplica el modelo de inferencia por Badges y Estado
  if (recentLogs.length === 0) {
    const hasEarlyBirdBadge = state.unlockedBadges.includes('badge_early_bird');
    const hasNightOwlBadge = state.unlockedBadges.includes('badge_night_owl');
    const currentBoost = state.activeBoost;

    // Caso 1: Perfil Madrugador (Pre-turno o mañana)
    if (hasEarlyBirdBadge || currentBoost === 'EARLY_BIRD') {
      return {
        recommendedTime: PHARMACY_SLOTS.MORNING_EARLY_BIRD.time,
        displayLabel: PHARMACY_SLOTS.MORNING_EARLY_BIRD.label,
        confidenceScore: 0.88,
        dominantSlot: 'MORNING',
        heuristicReason: 'Insignia "Madrugador Sanitario" desbloqueada: mayor retención matutina antes del turno.',
      };
    }

    // Caso 2: Perfil Noctámbulo (Guardia o turno de noche)
    if (hasNightOwlBadge || currentBoost === 'NIGHT_OWL') {
      return {
        recommendedTime: PHARMACY_SLOTS.NIGHT_LATE.time,
        displayLabel: PHARMACY_SLOTS.NIGHT_LATE.label,
        confidenceScore: 0.92,
        dominantSlot: 'NIGHT',
        heuristicReason: 'Insignia "Turno de Guardia" activa: alta productividad en horario post-cierre de mostrador.',
      };
    }

    // Caso 3: Por defecto para trabajadores de farmacia en Chile (21:00 hrs)
    return {
      recommendedTime: PHARMACY_SLOTS.NIGHT_GUARD.time,
      displayLabel: PHARMACY_SLOTS.NIGHT_GUARD.label,
      confidenceScore: 0.75,
      dominantSlot: 'NIGHT',
      heuristicReason: 'Horario estándar de alta adherencia sanitaria (21:00 hrs) previo a la medianoche.',
    };
  }

  // Si existen logs continuos: Weighted Kernel Density / Time-Bucket Histogram
  // 48 buckets de 30 minutos a lo largo de las 24 horas
  const buckets = new Float32Array(48);
  const now = Date.now();
  const HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

  recentLogs.forEach((log) => {
    const date = new Date(log.timestamp);
    const halfHourIndex = date.getHours() * 2 + Math.floor(date.getMinutes() / 30);

    // Peso base del evento
    const baseWeight = EVENT_WEIGHTS[log.type] || 1.0;

    // Modificador de precisión (mayor acierto = mayor estado cognitivo de flujo)
    const accuracyMultiplier = log.accuracyPercent ? log.accuracyPercent / 100 : 1.0;

    // Decaimiento temporal exponencial: e^(-ln(2) * dt / HalfLife)
    const dt = Math.max(0, now - log.timestamp);
    const recencyWeight = Math.exp((-Math.LN2 * dt) / HALF_LIFE_MS);

    const totalContribution = baseWeight * (0.5 + 0.5 * accuracyMultiplier) * recencyWeight;
    buckets[halfHourIndex] += totalContribution;
  });

  // Encontrar el bucket con el valor máximo
  let maxScore = -1;
  let bestBucket = 42; // default 21:00 (bucket 42 / 2 = 21.0)
  for (let i = 0; i < 48; i++) {
    if (buckets[i] > maxScore) {
      maxScore = buckets[i];
      bestBucket = i;
    }
  }

  const peakHour = Math.floor(bestBucket / 2);
  const peakMinute = (bestBucket % 2) * 30;

  // Aplicar anticipación preventiva (Lead-Time de 15 minutos antes de la hora pico)
  let leadMinute = peakMinute - 15;
  let leadHour = peakHour;
  if (leadMinute < 0) {
    leadMinute += 60;
    leadHour = (leadHour - 1 + 24) % 24;
  }

  const formattedTime = `${String(leadHour).padStart(2, '0')}:${String(leadMinute).padStart(2, '0')}`;
  const dominantSlot: 'MORNING' | 'AFTERNOON' | 'NIGHT' =
    leadHour < 12 ? 'MORNING' : leadHour < 19 ? 'AFTERNOON' : 'NIGHT';

  return {
    recommendedTime: formattedTime,
    displayLabel: `${formattedTime} hrs (${dominantSlot === 'MORNING' ? 'Madrugador' : dominantSlot === 'AFTERNOON' ? 'Vespertino' : 'Nocturno'})`,
    confidenceScore: Math.min(0.98, 0.6 + maxScore * 0.05),
    dominantSlot,
    heuristicReason: `Máxima densidad de aciertos y actividad registrada en la ventana de las ${String(peakHour).padStart(2, '0')}:${String(peakMinute).padStart(2, '0')} hrs.`,
  };
}
