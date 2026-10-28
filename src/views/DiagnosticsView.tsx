import React from 'react';
import { Target, CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, Bot } from 'lucide-react';
import { SimulacroResult, QuestionCategory, FarmaciaQuestion } from '../types/farmacia';
import { CATEGORIES_CONFIG } from '../data/coursesData';

interface DiagnosticsViewProps {
  lastResult: SimulacroResult | null;
  isPro: boolean;
  onOpenAiExplain: (question: FarmaciaQuestion, selectedOptionId?: string) => void;
  onStartNewSimulacro: () => void;
  onNavigateToCourses: () => void;
  onOpenPaywall: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  lastResult,
  isPro,
  onOpenAiExplain,
  onStartNewSimulacro,
  onNavigateToCourses,
  onOpenPaywall,
}) => {
  if (!lastResult) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center space-y-3 select-none">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <Target className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white">Sin Diagnóstico Disponible</h2>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-tight">
            Rinde tu primer Simulacro Oficial SEREMI para generar tu mapa de brechas y radar de debilidades.
          </p>
        </div>
        <button
          onClick={onStartNewSimulacro}
          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <span>Comenzar Simulacro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const { puntajePorcentaje, aprobado, correctas, incorrectas, omitidas, brechasPorCategoria } = lastResult;

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header Resultado */}
      <div
        className={`shrink-0 border rounded-2xl p-3 text-white shadow-lg relative overflow-hidden ${
          aprobado
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Diagnóstico Oficial SEREMI
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Meta: 70%</span>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
            {puntajePorcentaje}%
          </div>

          <div className="flex flex-col">
            <span
              className={`text-xs sm:text-sm font-extrabold flex items-center gap-1 ${
                aprobado ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {aprobado ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APROBADO PARA CERTIFICACIÓN</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>REQUIERE REFORZAMIENTO</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-300">
              {correctas} correctas · {incorrectas} incorrectas · {omitidas} omitidas
            </span>
          </div>
        </div>
      </div>

      {/* Radar de Brechas por Materia (Flex-1) */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Rendimiento por Materia:
          </span>

          <div className="space-y-1.5">
            {(Object.keys(brechasPorCategoria) as QuestionCategory[]).map((cat) => {
              const item = brechasPorCategoria[cat];
              const info = CATEGORIES_CONFIG.find((c) => c.id === cat);
              const isCrit = item.porcentaje < 70;

              return (
                <div key={cat} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 font-medium truncate max-w-[200px]">
                      {info?.shortName || cat} ({info?.decreeReference})
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isCrit ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.correctas}/{item.total} ({item.porcentaje}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCrit ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones de Refuerzo */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onStartNewSimulacro}
            className="h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Repetir Examen</span>
          </button>

          <button
            onClick={onNavigateToCourses}
            className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reforzar Materias</span>
          </button>
        </div>
      </div>
    </div>
  );
};
