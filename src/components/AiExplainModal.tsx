import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, AlertCircle, BookOpen, Lock, Loader2 } from 'lucide-react';
import { FarmaciaQuestion } from '../types/farmacia';

interface AiExplainModalProps {
  isOpen: boolean;
  question: FarmaciaQuestion | null;
  selectedOptionId?: string;
  isPro: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}

export const AiExplainModal: React.FC<AiExplainModalProps> = ({
  isOpen,
  question,
  selectedOptionId,
  isPro,
  onClose,
  onOpenPaywall,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !question) {
      setExplanation(null);
      setErrorMsg(null);
      return;
    }

    // Si el usuario no es PRO, no llamamos al backend; mostramos el paywall protector
    if (!isPro) return;

    let isMounted = true;
    async function fetchAiExplanation() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const response = await fetch('/api/ai/explain-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            selectedOptionId,
            isPro: true,
          }),
        });

        const data = await response.json();
        if (isMounted) {
          if (response.ok && data.success) {
            setExplanation(data.explanation);
          } else {
            setErrorMsg(data.message || 'No se pudo obtener la explicación del Tutor IA.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg('Error de red al conectar con el Tutor IA. Revisa tu conexión.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAiExplanation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, question, selectedOptionId, isPro]);

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Tutor IA Farmacéutico
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                  PRO
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{question.normativaReferencia}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Question Summary Box */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pregunta Analizada
            </span>
            <p className="font-semibold text-slate-100 text-xs leading-relaxed">
              {question.enunciado}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Respuesta Oficial: <strong className="text-emerald-400 font-mono">Opción {question.respuestaCorrecta}</strong>
              </span>
              <span className="text-slate-400">
                Tu elección: <strong className="text-rose-400 font-mono">Opción {selectedOptionId || 'Omitida'}</strong>
              </span>
            </div>
          </div>

          {/* Conditional View: Free Paywall Barrier vs PRO AI Analysis */}
          {!isPro ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">
                Explicación de Errores con IA Exclusiva de FarmaTest PRO
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-4">
                El Tutor IA analiza tu respuesta equivocada, te explica el riesgo sanitario y cita el decreto oficial chileno exacto para que nunca vuelvas a fallarla en el examen SEREMI.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenPaywall();
                }}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Desbloquear Tutor IA con FarmaTest PRO</span>
              </button>
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-200">
                El Químico Farmacéutico IA está analizando la normativa chilena...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Consultando D.S. 466, D.S. 404/405 y Código Sanitario
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-xs">Aviso del Sistema</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
                {/* Fallback to local official justification */}
                <div className="mt-3 pt-3 border-t border-rose-500/20 text-slate-200">
                  <p className="font-semibold text-[11px] text-emerald-400 mb-1">
                    Justificación Sanitaria Oficial:
                  </p>
                  <p className="text-xs text-slate-300">{question.justificacionOficial}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Fundamentación Sanitaria y Legal</span>
                </div>
                <div className="text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-line">
                  {explanation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs active:scale-95 transition-all"
          >
            Entendido, volver
          </button>
        </div>
      </div>
    </div>
  );
};
