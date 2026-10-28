import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Zap, BookOpen, Bot, FileText, Ban } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  isPro: boolean;
  onClose: () => void;
  onTogglePro: (status: boolean) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  isPro,
  onClose,
  onTogglePro,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'PASS_90'>('PASS_90');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header with Close */}
        <div className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-slate-950 p-6 text-white pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            Certificación Garantizada
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">FarmaTest PRO</h2>
          <p className="text-xs text-amber-100/90 mt-1">
            Aprueba el Examen de Auxiliar de Farmacia en tu primer intento con el preparador oficial más completo de Chile.
          </p>
        </div>

        {/* Plan Selector Buttons */}
        <div className="px-5 -mt-4 z-10 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setSelectedPlan('PASS_90')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPlan === 'PASS_90'
                ? 'bg-slate-800 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Pase 90 Días</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                -25%
              </span>
            </div>
            <div className="text-base font-extrabold text-white font-mono">$19.990 CLP</div>
            <div className="text-[10px] text-slate-400">Pago único (3 meses)</div>
          </button>

          <button
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPlan === 'MONTHLY'
                ? 'bg-slate-800 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">Mensual</div>
            <div className="text-base font-extrabold text-white font-mono">$7.990 CLP</div>
            <div className="text-[10px] text-slate-400">Renovación mensual</div>
          </button>
        </div>

        {/* Feature Comparison List */}
        <div className="px-5 py-4 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-start gap-3 text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Tutor IA con Decretos Chilenos Ilimitado</p>
              <p className="text-[11px] text-slate-400">
                Explicación paso a paso de cada error citando el D.S. 466, D.S. 404/405 y Código Sanitario.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">5 Cursos Temáticos Completos</p>
              <p className="text-[11px] text-slate-400">
                Desbloquea los módulos más difíciles: Psicotrópicos, Bioequivalencia y Dispensación.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Simulacros Oficiales y Vidas Infinitas</p>
              <p className="text-[11px] text-slate-400">
                Rinde exámenes contrarreloj cuando quieras sin esperas ni límites de intentos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <Ban className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">100% Libre de Publicidad</p>
              <p className="text-[11px] text-slate-400">
                Sin microbanners ni videos obligatorios. Concentración total en tu estudio.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Exportación de Simulacros a PDF</p>
              <p className="text-[11px] text-slate-400">
                Descarga cuadernillos tipo examen oficial con pauta de respuestas para imprimir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          {!isPro ? (
            <button
              onClick={() => {
                onTogglePro(true);
                onClose();
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Desbloquear FarmaTest PRO Ahora</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold">
                <Shield className="w-4 h-4" />
                <span>Tienes FarmaTest PRO Activo</span>
              </div>
              <button
                onClick={() => {
                  onTogglePro(false);
                  onClose();
                }}
                className="w-full text-[11px] text-slate-400 hover:text-slate-200 py-1"
              >
                (Modo Demo: Volver a Plan Gratuito para probar anuncios)
              </button>
            </div>
          )}
          <p className="text-[10px] text-center text-slate-500 mt-2">
            Garantía de satisfacción: Cancela en cualquier momento sin penalizaciones.
          </p>
        </div>
      </div>
    </div>
  );
};
