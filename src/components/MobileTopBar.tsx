import React from 'react';
import { Flame, Heart, Sparkles, Zap, ShieldCheck, Settings, Award } from 'lucide-react';
import { UserGamificationState, UserProfile } from '../types/farmacia';

interface MobileTopBarProps {
  state: UserGamificationState;
  profile: UserProfile | null;
  availableBoost: 'EARLY_BIRD' | 'NIGHT_OWL' | null;
  onOpenPaywall: () => void;
  onOpenHeartsModal: () => void;
  onOpenStreakModal: () => void;
  onOpenBadgesModal: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  state,
  profile,
  availableBoost,
  onOpenPaywall,
  onOpenHeartsModal,
  onOpenStreakModal,
  onOpenBadgesModal,
  onOpenSettings,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-2.5 sm:px-3.5 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {/* Brand & Profile shortcut (Clickable to open Settings) */}
        <button
          type="button"
          onClick={profile ? onOpenSettings : onOpenAuth}
          className="flex items-center gap-1.5 p-1 -ml-1 rounded-xl hover:bg-slate-800/80 active:scale-95 transition-all text-left shrink-0"
          title="Abrir Configuración y Perfil"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-emerald-500/20 shrink-0">
            FT
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold tracking-tight text-slate-100 flex items-center gap-1 leading-tight">
              FarmaTest
              {state.isPro && (
                <span className="text-[9px] font-black px-1 py-0.2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded">
                  PRO
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[65px] sm:max-w-[85px] leading-tight">
              {profile ? profile.name.split(' ')[0] : 'SEREMI'}
            </span>
          </div>
        </button>

        {/* Gamification Stats & Controls (Compact to ensure Settings is always visible) */}
        <div className="flex items-center gap-1 text-xs font-medium">
          {/* Boost Indicator */}
          {availableBoost && (
            <div
              className="flex items-center gap-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold shrink-0"
              title={availableBoost === 'EARLY_BIRD' ? 'Boost Madrugador: 2x XP' : 'Boost Noctámbulo: 2x XP'}
            >
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
              <span>2x</span>
            </div>
          )}

          {/* Racha / Streak (Clickable) */}
          <button
            onClick={onOpenStreakModal}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg transition-transform active:scale-95 shrink-0 text-[11px] ${
              state.streakStatus === 'BROKEN'
                ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 animate-pulse'
                : state.streakStatus === 'AT_RISK'
                ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300'
                : state.streakSavedToday
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}
            title="Ciclo de Racha y Protección"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                state.streakSavedToday ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span className="font-mono font-bold">{state.streakDays}</span>
          </button>

          {/* Gemas */}
          <div
            className="flex items-center gap-0.5 bg-slate-800/80 px-1.5 py-0.5 rounded-lg text-emerald-400 shrink-0 text-[11px]"
            title="Gemas acumuladas"
          >
            <Sparkles className="w-3 h-3 fill-emerald-400/30" />
            <span className="font-mono font-semibold">{state.gems}</span>
          </div>

          {/* Vidas / Hearts (Clickable -> HeartsModal) */}
          <button
            onClick={onOpenHeartsModal}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg transition-transform active:scale-95 shrink-0 text-[11px] ${
              state.isPro
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : state.hearts === 0
                ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-slate-800 text-rose-400'
            }`}
            title={state.isPro ? 'Vidas infinitas activas' : 'Gestionar y recargar vidas'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                state.isPro || state.hearts > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
              }`}
            />
            <span className="font-mono font-bold">{state.isPro ? '∞' : state.hearts}</span>
          </button>

          {/* Badges / Insignias Button */}
          <button
            onClick={onOpenBadgesModal}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors shrink-0 active:scale-95"
            title="Ver Insignias y Logros"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Settings / Configuración - Destacado y SIEMPRE visible */}
          <button
            onClick={profile ? onOpenSettings : onOpenAuth}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
            title="Configuración de Perfil, Push y Cuenta"
            aria-label="Configuración"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
