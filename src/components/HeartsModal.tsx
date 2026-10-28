import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles, Video, BookOpen, Zap, ShieldCheck, Clock } from 'lucide-react';
import { UserGamificationState } from '../types/farmacia';

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserGamificationState;
  getNextHeartTimeRemaining: () => { hours: number; minutes: number; seconds: number; totalSeconds: number };
  onRefillWithGems: () => boolean;
  onStartPracticeForHeart: () => void;
  onWatchAdForHearts: () => void;
  onOpenPaywall: () => void;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({
  isOpen,
  onClose,
  state,
  getNextHeartTimeRemaining,
  onRefillWithGems,
  onStartPracticeForHeart,
  onWatchAdForHearts,
  onOpenPaywall,
}) => {
  const [countdown, setCountdown] = useState(getNextHeartTimeRemaining());
  const [gemError, setGemError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown(getNextHeartTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, getNextHeartTimeRemaining]);

  if (!isOpen) return null;

  const handleGemRefill = () => {
    const success = onRefillWithGems();
    if (success) {
      onClose();
    } else {
      setGemError(true);
      setTimeout(() => setGemError(false), 2500);
    }
  };

  const isFull = state.hearts >= state.maxHearts;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-sm font-bold text-white">Vidas & Corazones</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Area */}
        <div className="p-6 text-center bg-gradient-to-b from-slate-950/80 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((heartIndex) => {
              const filled = state.isPro || heartIndex <= state.hearts;
              return (
                <div key={heartIndex} className="relative">
                  <Heart
                    className={`w-9 h-9 transition-all ${
                      filled
                        ? 'text-rose-500 fill-rose-500 drop-shadow-md'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                  {state.isPro && heartIndex === 3 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                      ∞
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="text-lg font-black text-white mb-1">
            {state.isPro
              ? '¡Vidas Infinitas Activas!'
              : isFull
              ? '¡Tus vidas están al máximo!'
              : `${state.hearts} de ${state.maxHearts} Vidas Disponibles`}
          </h3>

          {!state.isPro && !isFull && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-slate-300 text-xs mt-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Próximo corazón en:{' '}
                <strong className="font-mono text-white">
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </strong>
              </span>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            {state.isPro
              ? 'Con FarmaTest PRO puedes practicar sin preocuparte por fallar preguntas de normativa.'
              : 'Las vidas evitan responder al azar. Cada respuesta errónea en lecciones o práctica consume 1 corazón.'}
          </p>
        </div>

        {/* Recharge Options List */}
        {!state.isPro && (
          <div className="p-5 space-y-3 flex-1 text-xs">
            {/* Opción 1: Recarga Activa (Práctica de Repaso) */}
            <div
              onClick={() => {
                onClose();
                onStartPracticeForHeart();
              }}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Práctica de Repaso</h4>
                  <p className="text-[11px] text-slate-400">
                    Responde 5 preguntas de conceptos aprendidos para ganar +1 corazón gratis.
                  </p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl shrink-0">
                +1 ❤️ Gratis
              </span>
            </div>

            {/* Opción 2: Bypass con Gemas (350 Gemas) */}
            <div
              onClick={handleGemRefill}
              className={`p-3.5 bg-slate-950/80 border rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
                state.gems >= 350
                  ? 'border-amber-500/30 hover:border-amber-500/50 hover:bg-slate-800/60'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Recarga Inmediata al 100%</h4>
                  <p className="text-[11px] text-slate-400">
                    Restaura los 5 corazones instantáneamente con tus gemas de estudio.
                  </p>
                  {gemError && (
                    <p className="text-[10px] text-rose-400 font-semibold mt-1">
                      ¡Gemas insuficientes! Tienes {state.gems} de 350 requeridas.
                    </p>
                  )}
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs shrink-0">
                350 💎
              </button>
            </div>

            {/* Opción 3: Video Anuncio Recompensado */}
            <div
              onClick={() => {
                onClose();
                onWatchAdForHearts();
              }}
              className="p-3.5 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Ver Video Patrocinado</h4>
                  <p className="text-[11px] text-slate-400">
                    Mira un video corto de 5 segundos para rellenar tus 5 vidas.
                  </p>
                </div>
              </div>
              <span className="text-teal-400 font-bold bg-teal-950/60 border border-teal-500/30 px-2.5 py-1 rounded-xl shrink-0">
                +5 ❤️
              </span>
            </div>

            {/* Opción 4: Modo Infinito con FarmaTest PRO */}
            <div
              onClick={() => {
                onClose();
                onOpenPaywall();
              }}
              className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-xs">FarmaTest PRO</h4>
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                      VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Vidas infinitas ∞ permanentes, sin anuncios y con Tutor IA SEREMI.
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow">
                Activar
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            1 corazón se recarga de forma pasiva cada 5 horas (25 horas para 5 corazones).
          </p>
        </div>
      </div>
    </div>
  );
};
