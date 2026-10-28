import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface MicroBannerAdProps {
  isPro: boolean;
  onOpenPaywall: () => void;
}

export const MicroBannerAd: React.FC<MicroBannerAdProps> = ({ isPro, onOpenPaywall }) => {
  if (isPro) return null; // Sin publicidad en PRO

  return (
    <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 my-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-xs">
            ISP
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
              <span>Publicidad</span>
              <span>·</span>
              <span className="text-emerald-400">Guía 2026</span>
            </div>
            <p className="text-xs text-slate-200 font-medium truncate">
              Manual Oficial de Preparación SEREMI para Farmacias
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPaywall}
          className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Quitar anuncios</span>
        </button>
      </div>
    </div>
  );
};
