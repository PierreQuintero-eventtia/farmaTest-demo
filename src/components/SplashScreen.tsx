import React, { useEffect, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 400); // 400ms fade transition
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950 text-white cursor-pointer transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-end">
        <span className="text-[10px] text-slate-500 font-mono">Toca para saltar</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
            <span className="text-4xl font-black text-slate-950 tracking-tighter">FT</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            FarmaTest <span className="text-emerald-400">Chile</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs">
            Preparador Inteligente para el Examen de Competencias de Auxiliar de Farmacia
          </p>
        </div>

        {/* Regulatory badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Normativa SEREMI de Salud · ISP Chile</span>
        </div>
      </div>

      {/* Footer loading state */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-36 h-1 rounded-full bg-slate-900 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Cargando temario y decretos...</span>
      </div>
    </div>
  );
};
