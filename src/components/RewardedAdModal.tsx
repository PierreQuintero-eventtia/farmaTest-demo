import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, X, Award, Shield, Volume2 } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardType: 'HEARTS' | 'SIMULACRO';
  onClose: () => void;
  onRewardGranted: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  rewardType,
  onClose,
  onRewardGranted,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setIsCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    onRewardGranted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header of Ad */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              Anuncio Recompensado
            </span>
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                Recompensa en {secondsLeft}s
              </span>
            ) : (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video Player Canvas Mockup */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-6 text-center">
          {/* Animated Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            Droguerías y Distribución Farmacéutica Chile
          </h3>
          <p className="text-xs text-slate-300 max-w-xs">
            Certificación en Buenas Prácticas de Almacenamiento y Cadena de Frío para Droguerías y Farmacias Comunitarias.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            <span>Patrocinador Oficial de Capacitación</span>
          </div>
        </div>

        {/* Bottom Reward Call-to-Action */}
        <div className="p-4 bg-slate-900 flex flex-col items-center text-center">
          {isCompleted ? (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {rewardType === 'HEARTS'
                    ? '¡Has recargado 5 Vidas!'
                    : '¡Simulacro SEREMI Oficial Desbloqueado!'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Gracias por apoyar FarmaTest. Puedes continuar tu preparación inmediatamente.
              </p>
              <button
                onClick={handleClaimReward}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Reclamar Recompensa y Continuar</span>
              </button>
            </div>
          ) : (
            <div className="w-full text-center">
              <p className="text-xs text-slate-400 mb-1">
                Viendo anuncio para {rewardType === 'HEARTS' ? 'recargar vidas' : 'desbloquear tu simulacro semanal'}...
              </p>
              <p className="text-[11px] text-slate-500">
                La recompensa se liberará al terminar la cuenta regresiva.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
