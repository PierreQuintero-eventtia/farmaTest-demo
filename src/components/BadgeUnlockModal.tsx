import React from 'react';
import { Sparkles, Trophy, Flame, Zap, Award, Target, Scale, Sun, Moon, CheckCircle2, ArrowRight } from 'lucide-react';
import { BadgeInfo } from '../types/farmacia';

interface BadgeUnlockModalProps {
  badge: BadgeInfo | null;
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const renderBadgeIcon = (iconName: string) => {
    const props = { className: 'w-10 h-10' };
    switch (iconName) {
      case 'Flame':
        return <Flame {...props} className="w-10 h-10 text-amber-400 fill-amber-400/40" />;
      case 'Zap':
        return <Zap {...props} className="w-10 h-10 text-amber-400 fill-amber-400/40" />;
      case 'Award':
        return <Award {...props} className="w-10 h-10 text-emerald-400" />;
      case 'Target':
        return <Target {...props} className="w-10 h-10 text-teal-400" />;
      case 'Trophy':
        return <Trophy {...props} className="w-10 h-10 text-amber-400 fill-amber-400/40" />;
      case 'Sparkles':
        return <Sparkles {...props} className="w-10 h-10 text-amber-300" />;
      case 'Scale':
        return <Scale {...props} className="w-10 h-10 text-emerald-400" />;
      case 'Sun':
        return <Sun {...props} className="w-10 h-10 text-amber-400" />;
      case 'Moon':
        return <Moon {...props} className="w-10 h-10 text-indigo-400" />;
      default:
        return <Trophy {...props} className="w-10 h-10 text-emerald-400" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'amber':
        return 'from-amber-500/30 to-amber-900/40 border-amber-500/50 text-amber-400 shadow-amber-500/20';
      case 'emerald':
        return 'from-emerald-500/30 to-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20';
      case 'teal':
        return 'from-teal-500/30 to-teal-900/40 border-teal-500/50 text-teal-400 shadow-teal-500/20';
      case 'indigo':
        return 'from-indigo-500/30 to-indigo-900/40 border-indigo-500/50 text-indigo-400 shadow-indigo-500/20';
      default:
        return 'from-emerald-500/30 to-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700 rounded-3xl p-6 text-center text-white shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Header */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>¡Hito Sanitario Desbloqueado!</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Badge Icon Emblem */}
        <div className="my-4 flex justify-center">
          <div
            className={`w-24 h-24 rounded-3xl bg-gradient-to-b ${getColorClasses(
              badge.color
            )} border-2 flex items-center justify-center shadow-xl relative animate-bounce`}
            style={{ animationDuration: '2s' }}
          >
            {renderBadgeIcon(badge.icon)}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Badge Details */}
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
          {badge.category}
        </span>

        <h3 className="text-xl font-black text-white mt-2 mb-1 tracking-tight">
          {badge.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-5 max-w-xs mx-auto">
          {badge.description}
        </p>

        {/* Rewards earned card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-5">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Recompensas Obtenidas</p>
          <div className="flex items-center justify-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              +{badge.rewardXp} XP
            </span>
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              +{badge.rewardGems} Gemas
            </span>
            {badge.rewardFreeze && (
              <span className="flex items-center gap-1 text-teal-400 bg-teal-950/60 border border-teal-500/30 px-2.5 py-1 rounded-xl">
                ❄️ +1 Freeze
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
        >
          <span>¡Reclamar e Ir al Dashboard!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
