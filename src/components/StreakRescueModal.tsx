import React, { useState } from 'react';
import { X, Flame, ShieldAlert, Sparkles, BookOpen, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserGamificationState } from '../types/farmacia';

interface StreakRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserGamificationState;
  onRepairWithGems: () => boolean;
  onStartRecoveryLesson: () => void;
  onEquipFreeze: () => boolean;
}

export const StreakRescueModal: React.FC<StreakRescueModalProps> = ({
  isOpen,
  onClose,
  state,
  onRepairWithGems,
  onStartRecoveryLesson,
  onEquipFreeze,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isBroken = state.streakStatus === 'BROKEN' && (state.brokenStreakDays || 0) > 0;
  const isFrozen = state.streakFrozenYesterday;

  // Calcular tiempo restante de la ventana de 48 horas si está rota
  const getRemainingHours = () => {
    if (!state.brokenStreakTimestamp) return 48;
    const elapsedMs = Date.now() - state.brokenStreakTimestamp;
    const remainingMs = Math.max(0, 48 * 60 * 60 * 1000 - elapsedMs);
    return Math.floor(remainingMs / (1000 * 60 * 60));
  };

  const handleGemRepair = () => {
    const success = onRepairWithGems();
    if (success) {
      setSuccessMessage('¡Racha restaurada con éxito!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } else {
      setErrorMessage(`Gemas insuficientes. Tienes ${state.gems} de 300 requeridas.`);
      setTimeout(() => setErrorMessage(null), 2500);
    }
  };

  const handleEquipFreeze = () => {
    const success = onEquipFreeze();
    if (success) {
      setSuccessMessage('¡Protector de racha equipado en tu inventario!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      setErrorMessage(
        state.freezeEquipped >= 2
          ? 'Ya tienes el inventario máximo de 2 protectores equipados.'
          : `Gemas insuficientes. Tienes ${state.gems} de 200 requeridas.`
      );
      setTimeout(() => setErrorMessage(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-bold text-white">
              {isBroken ? 'Rescate de Racha Sanitaria' : 'Ciclo de Racha y Protección'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Section */}
        <div className="p-6 text-center bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800">
          {isBroken ? (
            <div>
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/10 animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                ¡Tu racha de {state.brokenStreakDays} días se ha roto!
              </h3>
              <p className="text-xs text-rose-300 font-semibold mb-2">
                Ventana de Rescate Activa: Te quedan {getRemainingHours()} horas para recuperarla.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No pierdas tu progreso hacia la convocatoria SEREMI. Puedes repararla con gemas o mediante una lección de rescate intensiva.
              </p>
            </div>
          ) : isFrozen ? (
            <div>
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border-2 border-teal-500/40 text-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/10">
                <span className="text-3xl">❄️</span>
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                ¡Protector de Racha Activado!
              </h3>
              <p className="text-xs text-teal-300 font-semibold mb-2">
                Tu racha de {state.streakDays} días fue salvada anoche.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Se consumió 1 Streak Freeze de tu inventario. Realiza una lección hoy para mantener la racha activa.
              </p>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
                <Flame className="w-8 h-8 fill-amber-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                Racha Activa: {state.streakDays} Días
              </h3>
              <p className="text-xs text-amber-300 font-semibold mb-2">
                {state.streakSavedToday
                  ? '✓ Meta cumplida hoy. Racha asegurada hasta mañana.'
                  : state.streakStatus === 'AT_RISK'
                  ? '⚠️ En Riesgo: Completa una lección antes de las 23:59 hrs.'
                  : 'Completa al menos 1 lección (≥10 XP) antes de medianoche.'}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="p-5 space-y-3 flex-1 text-xs">
          {isBroken ? (
            <>
              {/* Opción 1: Reparar con Gemas */}
              <div
                onClick={handleGemRepair}
                className={`p-3.5 bg-slate-950/80 border rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
                  state.gems >= 300
                    ? 'border-amber-500/40 hover:border-amber-500 hover:bg-slate-800/60'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Reparación de Racha Inmediata</h4>
                    <p className="text-[11px] text-slate-400">
                      Restaura tu racha intacta de {state.brokenStreakDays} días.
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs shrink-0">
                  300 💎
                </button>
              </div>

              {/* Opción 2: Lección de Rescate Intensiva */}
              <div
                onClick={() => {
                  onClose();
                  onStartRecoveryLesson();
                }}
                className="p-3.5 bg-slate-950/80 hover:bg-slate-800/60 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Lección de Rescate Sanitario</h4>
                    <p className="text-[11px] text-slate-400">
                      Responde 5 preguntas de normativa chilena sin fallar para recuperar tu racha gratis.
                    </p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl shrink-0">
                  Gratis
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Inventario de Streak Freeze */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <span className="text-xl">❄️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Protector de Racha (Streak Freeze)</h4>
                    <p className="text-[11px] text-slate-400">
                      Equipados: <strong>{state.freezeEquipped} de 2</strong> (automático en PRO)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEquipFreeze}
                  disabled={state.freezeEquipped >= 2}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all ${
                    state.freezeEquipped >= 2
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                  }`}
                >
                  {state.freezeEquipped >= 2 ? 'Lleno' : 'Equipar (200 💎)'}
                </button>
              </div>

              {/* Explicación de la Máquina de Estados */}
              <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">Reglas Oficiales del Ciclo de Racha:</p>
                <p>1. <strong>Activa:</strong> Completa al menos 1 lección o test antes de las 23:59 hrs.</p>
                <p>2. <strong>En Riesgo:</strong> Pasadas las 18:00 hrs sin actividad, se activa alerta prioritaria.</p>
                <p>3. <strong>Congelada:</strong> Si olvidas un día, el Streak Freeze protege tu racha automáticamente.</p>
                <p>4. <strong>Reparación:</strong> Tienes 48 hrs para restaurar una racha rota con gemas o lección de rescate.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Zona horaria del examen: <span className="text-slate-300 font-mono">{state.timezone}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
