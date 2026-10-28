import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Heart, ArrowRight, Flame } from 'lucide-react';
import { FarmaciaQuestion } from '../types/farmacia';

interface DailyDrillModalProps {
  isOpen: boolean;
  questions: FarmaciaQuestion[];
  hearts: number;
  isPro: boolean;
  title?: string;
  mode?: 'DAILY' | 'PRACTICE_FOR_HEART' | 'STREAK_RECOVERY';
  onClose: () => void;
  onConsumeHeart: () => boolean;
  onCompleteDrill: (earnedXp: number, earnedGems: number) => void;
  onHeartEarned?: () => void;
  onRecoverySuccess?: () => void;
  onOpenAdForHearts: () => void;
}

export const DailyDrillModal: React.FC<DailyDrillModalProps> = ({
  isOpen,
  questions,
  hearts,
  isPro,
  title,
  mode = 'DAILY',
  onClose,
  onConsumeHeart,
  onCompleteDrill,
  onHeartEarned,
  onRecoverySuccess,
  onOpenAdForHearts,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleCheck = () => {
    if (!selectedOption) return;
    setHasChecked(true);

    const isCorrect = selectedOption === currentQ.respuestaCorrecta;
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      // In practice for heart, do not consume heart!
      if (mode !== 'PRACTICE_FOR_HEART') {
        const hasLives = onConsumeHeart();
        if (!hasLives && !isPro) {
          return;
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasChecked(false);
    } else {
      setIsFinished(true);
      if (mode === 'PRACTICE_FOR_HEART') {
        onHeartEarned?.();
      } else if (mode === 'STREAK_RECOVERY') {
        onRecoverySuccess?.();
      } else {
        const xpEarned = correctAnswersCount * 15 + 20;
        onCompleteDrill(xpEarned, 10);
      }
    }
  };

  const getBadgeLabel = () => {
    if (title) return title;
    if (mode === 'PRACTICE_FOR_HEART') return 'Práctica de Repaso (+1 ❤️)';
    if (mode === 'STREAK_RECOVERY') return 'Lección de Rescate de Racha';
    return `Express · ${currentIndex + 1} de ${questions.length}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 text-white shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              {getBadgeLabel()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>{isPro ? '∞' : hearts}</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Finished View */}
        {isFinished ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              {mode === 'PRACTICE_FOR_HEART' ? (
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-bounce" />
              ) : mode === 'STREAK_RECOVERY' ? (
                <Flame className="w-8 h-8 text-amber-500 fill-amber-500 animate-bounce" />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-base font-extrabold text-white">
              {mode === 'PRACTICE_FOR_HEART'
                ? '¡Has ganado +1 Corazón!'
                : mode === 'STREAK_RECOVERY'
                ? '¡Racha Sanitaria Rescatada!'
                : '¡Entrenamiento Diario Completado!'}
            </h3>

            <p className="text-xs text-slate-300">
              Acertaste <strong>{correctAnswersCount}</strong> de <strong>{questions.length}</strong> preguntas de normativa.
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-center gap-3">
              {mode === 'PRACTICE_FOR_HEART' ? (
                <span className="text-rose-400 font-bold">+1 ❤️ Recargado</span>
              ) : mode === 'STREAK_RECOVERY' ? (
                <span className="text-amber-400 font-bold">🔥 Racha Restaurada</span>
              ) : (
                <>
                  <span>+{correctAnswersCount * 15 + 20} XP</span>
                  <span>+10 Gemas</span>
                  <span>🔥 Racha al día</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Cerrar y Continuar
            </button>
          </div>
        ) : !isPro && hearts === 0 && !hasChecked && mode !== 'PRACTICE_FOR_HEART' ? (
          /* Sin Vidas View */
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-white">¡Te has quedado sin vidas!</h3>
            <p className="text-xs text-slate-300">
              Puedes esperar la recarga automática (1 cada 5 hrs) o ver un video publicitario de 5 segundos para recargar 5 vidas al instante.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAdForHearts();
              }}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Ver Video para Recargar Vidas
            </button>
          </div>
        ) : (
          /* Question View */
          <div className="space-y-3">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              {currentQ.categoryLabel} · {currentQ.normativaReferencia}
            </span>

            <p className="text-xs font-semibold text-slate-100 leading-relaxed">
              {currentQ.enunciado}
            </p>

            <div className="space-y-2 pt-1">
              {currentQ.opciones.map((op) => {
                const isSelected = selectedOption === op.id;
                const isCorrect = op.id === currentQ.respuestaCorrecta;

                let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';
                if (isSelected && !hasChecked) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/30';
                } else if (hasChecked) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  }
                }

                return (
                  <button
                    key={op.id}
                    disabled={hasChecked}
                    onClick={() => setSelectedOption(op.id)}
                    className={`w-full text-left p-3 rounded-2xl border text-xs leading-snug transition-all flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                      {op.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{op.texto}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Post-Answer */}
            {hasChecked && (
              <div
                className={`p-3 rounded-2xl border text-xs space-y-1 animate-fadeIn ${
                  selectedOption === currentQ.respuestaCorrecta
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedOption === currentQ.respuestaCorrecta ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>¡Correcto! Normativa SEREMI aplicada.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Incorrecto (-1 ❤️)</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentQ.justificacionOficial}
                </p>
              </div>
            )}

            {/* Bottom Action Button */}
            <div className="pt-2">
              {!hasChecked ? (
                <button
                  disabled={!selectedOption}
                  onClick={handleCheck}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow"
                >
                  Comprobar Respuesta
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Entrenamiento'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
