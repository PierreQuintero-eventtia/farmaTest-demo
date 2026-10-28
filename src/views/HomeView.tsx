import React from 'react';
import {
  Flame,
  Clock,
  Play,
  BookOpen,
  Zap,
  Award,
  AlertTriangle,
  Heart,
  ChevronRight,
  Settings,
  Sparkles,
} from 'lucide-react';
import { UserGamificationState, FarmaciaQuestion } from '../types/farmacia';
import { FARMACIA_QUESTIONS } from '../data/questionsData';
import { BADGES_CATALOG, getBadgeProgress } from '../data/badgesData';

interface HomeViewProps {
  state: UserGamificationState;
  availableBoost: 'EARLY_BIRD' | 'NIGHT_OWL' | null;
  onNavigateTab: (tab: 'cursos' | 'simulacro' | 'diagnostico') => void;
  onOpenPaywall: () => void;
  onOpenAdForSimulacro: () => void;
  onStartDailyDrill: (questions: FarmaciaQuestion[]) => void;
  onOpenBadgesModal: () => void;
  onOpenStreakModal: () => void;
  onOpenHeartsModal: () => void;
  onOpenSettings?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  availableBoost,
  onNavigateTab,
  onOpenPaywall,
  onOpenAdForSimulacro,
  onStartDailyDrill,
  onOpenBadgesModal,
  onOpenStreakModal,
  onOpenHeartsModal,
  onOpenSettings,
}) => {
  const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // Lunes=0, Domingo=6

  const handleStartQuickDrill = () => {
    const shuffled = [...FARMACIA_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
    onStartDailyDrill(shuffled);
  };

  const unlockedCount = state.unlockedBadges?.length || 0;
  const nextBadge = BADGES_CATALOG.find((b) => !state.unlockedBadges?.includes(b.id)) || BADGES_CATALOG[0];
  const nextBadgeProgress = getBadgeProgress(nextBadge, state);

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* 1. Alertas de Estado Urgentes (Compactas en 1 sola línea) */}
      {state.streakStatus === 'BROKEN' && (state.brokenStreakDays || 0) > 0 ? (
        <button
          onClick={onOpenStreakModal}
          className="shrink-0 w-full bg-rose-950/80 border border-rose-500/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-rose-200 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-1.5 font-bold truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="truncate">Racha rota ({state.brokenStreakDays} días) · Ventana de 48h</span>
          </div>
          <span className="text-[10px] font-black text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded shrink-0 ml-1">
            Rescatar →
          </span>
        </button>
      ) : state.streakStatus === 'AT_RISK' && !state.streakSavedToday ? (
        <button
          onClick={handleStartQuickDrill}
          className="shrink-0 w-full bg-amber-950/80 border border-amber-500/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-amber-200 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-1.5 font-bold truncate">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate">¡Racha en riesgo! Salvar con 1 práctica</span>
          </div>
          <span className="text-[10px] font-black text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded shrink-0 ml-1">
            Salvar (3 min) →
          </span>
        </button>
      ) : !state.isPro && state.hearts <= 1 ? (
        <button
          onClick={onOpenHeartsModal}
          className="shrink-0 w-full bg-rose-950/70 border border-rose-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-rose-200 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            <span>{state.hearts === 0 ? 'Sin vidas' : 'Te queda 1 vida'} · Recarga gratis</span>
          </div>
          <span className="text-[10px] font-bold text-rose-300 bg-rose-900/50 px-2 py-0.5 rounded shrink-0">
            Recargar →
          </span>
        </button>
      ) : null}

      {/* 2. Tarjeta Resumen: Convocatoria SEREMI 2026 & Racha Activa */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/70 border border-slate-800 rounded-2xl p-3 sm:p-3.5 text-white shadow-lg shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Convocatoria SEREMI 2026
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-slate-300 text-[10px] bg-slate-950/70 px-2 py-0.5 rounded-full border border-slate-800 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>18 días</span>
            </div>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold transition-all active:scale-95"
              >
                <Settings className="w-3 h-3 text-amber-400" />
                <span>Ajustes</span>
              </button>
            )}
          </div>
        </div>

        {/* Racha & Mini Timeline interactivo */}
        <div
          onClick={onOpenStreakModal}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2 cursor-pointer hover:border-slate-700 active:scale-99 transition-all"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Racha de Estudio: <strong className="text-amber-400 font-mono text-xs">{state.streakDays} días</strong>
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium">
              {state.streakSavedToday ? '✓ Meta de hoy lista' : 'Práctica de hoy pendiente'}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((day, idx) => {
              const isPast = idx < todayDayIndex;
              const isToday = idx === todayDayIndex;
              const isCompleted = isPast || (isToday && state.streakSavedToday);

              return (
                <div
                  key={day}
                  className={`h-6 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${
                    isCompleted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                      : isToday
                      ? 'bg-slate-800 border border-dashed border-amber-400/70 text-slate-300 animate-pulse font-bold'
                      : 'bg-slate-900/60 text-slate-600 border border-slate-800/60'
                  }`}
                >
                  {isCompleted ? '🔥' : day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Tira de Logros & Insignias (1 sola línea ejecutiva) */}
      <button
        type="button"
        onClick={onOpenBadgesModal}
        className="shrink-0 w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center justify-between text-xs text-white hover:border-amber-500/40 active:scale-98 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white">Insignias SEREMI</span>
              <span className="text-[9px] font-mono bg-slate-800 px-1 rounded text-amber-300">
                {unlockedCount}/9
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none">
              Próxima: <strong className="text-slate-300">{nextBadge.title}</strong> ({nextBadgeProgress.current}/{nextBadgeProgress.max})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0">
          <span>Vitrina</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* 4. Módulo Principal: Simulacro Oficial SEREMI */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden min-h-[135px]">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
              Oficial SEREMI Chile
            </span>
            <span className="text-[10px] text-slate-400 font-mono">15 preguntas · 20 min</span>
          </div>

          <h2 className="text-sm sm:text-base font-extrabold text-white mt-1">
            Simulacro de Examen Completo
          </h2>
          <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
            Preguntas ponderadas de Legislación, Psicotrópicos, Almacenamiento y Farmacología con informe de brechas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('simulacro')}
          className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all mt-2"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Iniciar Simulacro Oficial</span>
        </button>
      </div>

      {/* 5. Acciones Rápidas Complementarias (2 Columnas) */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onNavigateTab('cursos')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center gap-2 text-left active:scale-98 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight truncate">Cursos y Decretos</div>
            <div className="text-[9px] text-slate-400 leading-tight truncate">D.S. 466, 404, 405</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleStartQuickDrill}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center gap-2 text-left active:scale-98 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight truncate">Práctica Rápida</div>
            <div className="text-[9px] text-slate-400 leading-tight truncate">5 preguntas (+XP)</div>
          </div>
        </button>
      </div>

      {/* 6. Barra de Estado PRO / Boost (Minimalista) */}
      <div className="shrink-0 flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800/60 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          {state.isPro ? (
            <span className="font-semibold text-amber-300">Plan PRO Activo · Tutor IA habilitado</span>
          ) : (
            <span>Plan Estándar SEREMI</span>
          )}
        </div>
        {!state.isPro && (
          <button
            onClick={onOpenPaywall}
            className="text-amber-400 font-bold hover:underline"
          >
            Mejorar a PRO →
          </button>
        )}
      </div>
    </div>
  );
};
