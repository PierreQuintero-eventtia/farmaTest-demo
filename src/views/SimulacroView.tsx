import React, { useState, useEffect } from 'react';
import { Clock, Flag, CheckCircle2, ArrowRight, ArrowLeft, Play, X, Shield, AlertTriangle } from 'lucide-react';
import { FarmaciaQuestion, SimulacroResult, UserGamificationState, QuestionCategory } from '../types/farmacia';
import { FARMACIA_QUESTIONS } from '../data/questionsData';

interface SimulacroViewProps {
  state: UserGamificationState;
  onOpenPaywall: () => void;
  onOpenAdForSimulacro: () => void;
  onFinishSimulacro: (result: SimulacroResult) => void;
}

export const SimulacroView: React.FC<SimulacroViewProps> = ({
  state,
  onOpenPaywall,
  onOpenAdForSimulacro,
  onFinishSimulacro,
}) => {
  const isUnlocked = state.isPro || state.weeklySimulacroUnlockedByAd;

  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<FarmaciaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(20 * 60); // 20 minutos
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const startExam = () => {
    const categories: QuestionCategory[] = [
      'LEGISLACION',
      'ALMACENAMIENTO',
      'PSICOTROPICOS',
      'FARMACOLOGIA',
      'DISPENSACION',
    ];

    let selected: FarmaciaQuestion[] = [];
    categories.forEach((cat) => {
      const pool = FARMACIA_QUESTIONS.filter((q) => q.category === cat);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      selected.push(...shuffled.slice(0, 3));
    });

    selected = selected.sort(() => 0.5 - Math.random());

    setExamQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setSecondsLeft(20 * 60);
    setIsExamActive(true);
    setShowExitConfirm(false);
    setShowFinishConfirm(false);
  };

  useEffect(() => {
    if (!isExamActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamActive]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleReview = (questionId: string) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleFinishExam = () => {
    setIsExamActive(false);

    let correctCount = 0;
    let incorrectCount = 0;
    let omittedCount = 0;

    const breakdown: Record<QuestionCategory, { total: number; correctas: number; porcentaje: number }> = {
      LEGISLACION: { total: 0, correctas: 0, porcentaje: 0 },
      ALMACENAMIENTO: { total: 0, correctas: 0, porcentaje: 0 },
      PSICOTROPICOS: { total: 0, correctas: 0, porcentaje: 0 },
      FARMACOLOGIA: { total: 0, correctas: 0, porcentaje: 0 },
      DISPENSACION: { total: 0, correctas: 0, porcentaje: 0 },
    };

    examQuestions.forEach((q) => {
      breakdown[q.category].total += 1;
      const ans = userAnswers[q.id];

      if (!ans) {
        omittedCount++;
      } else if (ans === q.respuestaCorrecta) {
        correctCount++;
        breakdown[q.category].correctas += 1;
      } else {
        incorrectCount++;
      }
    });

    (Object.keys(breakdown) as QuestionCategory[]).forEach((cat) => {
      const item = breakdown[cat];
      item.porcentaje = item.total > 0 ? Math.round((item.correctas / item.total) * 100) : 0;
    });

    const scorePercentage = Math.round((correctCount / examQuestions.length) * 100);
    const passed = scorePercentage >= 70;

    const result: SimulacroResult = {
      id: `sim_${Date.now()}`,
      duracionSegundos: 20 * 60 - secondsLeft,
      totalPreguntas: examQuestions.length,
      correctas: correctCount,
      incorrectas: incorrectCount,
      omitidas: omittedCount,
      puntajePorcentaje: scorePercentage,
      aprobado: passed,
      brechasPorCategoria: breakdown,
      preguntas: examQuestions,
      respuestasUsuario: userAnswers,
      timestamp: Date.now(),
    };

    onFinishSimulacro(result);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Vista durante el Examen Activo (100% viewport fijo)
  if (isExamActive && examQuestions.length > 0) {
    const currentQ = examQuestions[currentIndex];
    const currentAns = userAnswers[currentQ.id];
    const isMarked = markedForReview[currentQ.id];
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none relative">
        {/* Barra Superior del Examen */}
        <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300"
          >
            <X className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>

          {/* Temporizador */}
          <div
            className={`flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg ${
              secondsLeft < 180
                ? 'bg-rose-950 text-rose-400 border border-rose-500 animate-pulse'
                : 'bg-slate-950 text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeFormatted}</span>
          </div>

          {/* Marcar para revisar */}
          <button
            onClick={() => handleToggleReview(currentQ.id)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
              isMarked
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className={`w-3 h-3 ${isMarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isMarked ? 'Marcada' : 'Marcar'}</span>
          </button>
        </div>

        {/* Tarjeta de la Pregunta Actual (Flex-1) */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
          {/* Header pregunta */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Pregunta {currentIndex + 1} de {examQuestions.length}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-1.5 py-0.2 rounded border border-slate-800">
                {currentQ.normativaReferencia}
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
              {currentQ.enunciado}
            </h3>
          </div>

          {/* Opciones de Respuesta (4 Botones compactos) */}
          <div className="space-y-1.5 my-2">
            {currentQ.opciones.map((opt) => {
              const isSelected = currentAns === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full text-left p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs leading-tight flex items-start gap-2 transition-all active:scale-99 ${
                    isSelected
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="flex-1">{opt.texto}</span>
                </button>
              );
            })}
          </div>

          {/* Botones de Navegación de Preguntas */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              className="px-3 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400">
              {answeredCount}/{examQuestions.length} respondidas
            </span>

            {currentIndex < examQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((p) => Math.min(examQuestions.length - 1, p + 1))}
                className="px-3 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1 shadow"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowFinishConfirm(true)}
                className="px-3.5 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 flex items-center gap-1 shadow-lg shadow-emerald-500/20"
              >
                <span>Entregar</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal de Confirmación de Entrega */}
        {showFinishConfirm && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-xs w-full text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">¿Finalizar Simulacro?</h3>
              <p className="text-xs text-slate-300 leading-tight">
                Has respondido {answeredCount} de {examQuestions.length} preguntas. Obtendrás tu informe diagnóstico y brechas SEREMI.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="h-9 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Continuar
                </button>
                <button
                  onClick={handleFinishExam}
                  className="h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
                >
                  Entregar Examen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmación Salir */}
        {showExitConfirm && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-xs w-full text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">¿Abandonar Examen?</h3>
              <p className="text-xs text-slate-300 leading-tight">
                Si sales ahora, no se registrará puntaje oficial en tu historial.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="h-9 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    setIsExamActive(false);
                    setShowExitConfirm(false);
                  }}
                  className="h-9 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista Previa de Bienvenida al Simulacro (100% viewport fijo)
  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-2 select-none">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Simulador Oficial SEREMI
          </span>
          <span className="text-[10px] font-mono text-slate-400">Examen Auxiliar 2026</span>
        </div>
        <h1 className="text-sm sm:text-base font-extrabold text-white">
          Simulacro de Certificación Sanitaria
        </h1>
        <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
          15 preguntas ponderadas con tiempo cronometrado y radar diagnóstico de brechas.
        </p>
      </div>

      {/* Reglas y Criterios Oficiales (Flex-1) */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estructura de la Evaluación:
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Duración</span>
              <span className="font-mono font-bold text-white text-xs">20 Minutos</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Aprobación</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">70% Mínimo</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-300 block">Temas Ponderados:</span>
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">D.S. 466 (Farmacias)</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">D.S. 404/405 (Estupefacientes)</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Cadena de Frío</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Farmacología</span>
            </div>
          </div>
        </div>

        {/* Botón de Inicio */}
        <div className="pt-2 shrink-0">
          <button
            onClick={startExam}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Iniciar Examen Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
