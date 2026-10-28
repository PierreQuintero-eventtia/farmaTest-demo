import React, { useState } from 'react';
import { X, Award, Flame, Zap, Target, Trophy, Sparkles, Scale, Sun, Moon, CheckCircle2, Lock, Gift, ChevronRight } from 'lucide-react';
import { UserGamificationState, BadgeInfo } from '../types/farmacia';
import { BADGES_CATALOG, getBadgeProgress } from '../data/badgesData';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserGamificationState;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, state }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNLOCKED' | 'IN_PROGRESS'>('ALL');

  if (!isOpen) return null;

  const totalBadges = BADGES_CATALOG.length;
  const unlockedCount = state.unlockedBadges?.length || 0;
  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: 'w-6 h-6' };
    if (!isUnlocked) {
      return <Lock className="w-5 h-5 text-slate-500" />;
    }

    switch (iconName) {
      case 'Flame':
        return <Flame {...props} className="w-6 h-6 text-amber-400 fill-amber-400/40" />;
      case 'Zap':
        return <Zap {...props} className="w-6 h-6 text-amber-400 fill-amber-400/40" />;
      case 'Award':
        return <Award {...props} className="w-6 h-6 text-emerald-400" />;
      case 'Target':
        return <Target {...props} className="w-6 h-6 text-teal-400" />;
      case 'Trophy':
        return <Trophy {...props} className="w-6 h-6 text-amber-400 fill-amber-400/40" />;
      case 'Sparkles':
        return <Sparkles {...props} className="w-6 h-6 text-amber-300" />;
      case 'Scale':
        return <Scale {...props} className="w-6 h-6 text-emerald-400" />;
      case 'Sun':
        return <Sun {...props} className="w-6 h-6 text-amber-400" />;
      case 'Moon':
        return <Moon {...props} className="w-6 h-6 text-indigo-400" />;
      default:
        return <Award {...props} className="w-6 h-6 text-emerald-400" />;
    }
  };

  const filteredBadges = BADGES_CATALOG.filter((badge) => {
    const isUnlocked = state.unlockedBadges?.includes(badge.id);
    if (activeFilter === 'UNLOCKED') return isUnlocked;
    if (activeFilter === 'IN_PROGRESS') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Insignias & Logros SEREMI</h2>
              <p className="text-[10px] text-slate-400">Recompensas por disciplina y excelencia</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Progress Overview Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white">Progreso de Colección:</span>
              <span className="font-mono text-xs font-black text-amber-400">
                {unlockedCount} de {totalBadges} ({completionPercentage}%)
              </span>
            </div>
            {/* Single continuous progress line */}
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total desbloqueado</span>
            <span className="text-xs font-extrabold text-emerald-400">
              +{unlockedCount * 70} XP
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 bg-slate-950/80 p-1 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({totalBadges})
          </button>
          <button
            onClick={() => setActiveFilter('UNLOCKED')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeFilter === 'UNLOCKED' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logradas ({unlockedCount})
          </button>
          <button
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeFilter === 'IN_PROGRESS' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendientes ({totalBadges - unlockedCount})
          </button>
        </div>

        {/* Badges List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {filteredBadges.map((badge) => {
            const progress = getBadgeProgress(badge, state);
            const isUnlocked = progress.isUnlocked;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-85'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Badge Icon Emblem */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border relative transition-all ${
                      isUnlocked
                        ? badge.color === 'amber'
                          ? 'bg-amber-500/20 border-amber-500/40 shadow-sm shadow-amber-500/10'
                          : badge.color === 'emerald'
                          ? 'bg-emerald-500/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : badge.color === 'teal'
                          ? 'bg-teal-500/20 border-teal-500/40 shadow-sm shadow-teal-500/10'
                          : 'bg-indigo-500/20 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-800/80 border-slate-700/60'
                    }`}
                  >
                    {renderBadgeIcon(badge.icon, isUnlocked)}
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Content & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {badge.category}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          ✓ Completada
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {progress.current} / {progress.max}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-0.5 truncate">
                      {badge.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
                      {badge.description}
                    </p>

                    {/* Progress Bar (if not unlocked) */}
                    {!isUnlocked && (
                      <div className="mb-2">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reward Tags */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60 text-[10px] font-semibold text-slate-400">
                      <Gift className="w-3 h-3 text-slate-500" />
                      <span>Recompensa:</span>
                      <span className="text-emerald-400 font-mono">+{badge.rewardXp} XP</span>
                      <span>·</span>
                      <span className="text-amber-400 font-mono">+{badge.rewardGems} 💎</span>
                      {badge.rewardFreeze && (
                        <>
                          <span>·</span>
                          <span className="text-teal-400">❄️ 1 Freeze</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Completa simulacros SEREMI y mantén tu racha diaria para desbloquear todas las insignias.
          </p>
        </div>
      </div>
    </div>
  );
};
