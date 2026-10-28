import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { CourseLesson, UserGamificationState } from '../types/farmacia';
import { CATEGORIES_CONFIG, COURSES_LESSONS } from '../data/coursesData';
import { FARMACIA_QUESTIONS } from '../data/questionsData';

interface CoursesViewProps {
  state: UserGamificationState;
  onOpenPaywall: () => void;
  onLessonCompleted: (lessonId: string) => void;
  onConsumeHeart: () => boolean;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  state,
  onOpenPaywall,
  onLessonCompleted,
  onConsumeHeart,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const handleSelectLesson = (lesson: CourseLesson) => {
    if (lesson.isProOnly && !state.isPro) {
      onOpenPaywall();
      return;
    }
    setSelectedLesson(lesson);
    setSectionIndex(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
  };

  const handleCheckAnswer = (correctAnswerId: string) => {
    if (!selectedAnswer) return;
    setAnswerSubmitted(true);

    if (selectedAnswer !== correctAnswerId) {
      onConsumeHeart();
    } else if (selectedLesson) {
      onLessonCompleted(selectedLesson.id);
    }
  };

  // Modo Lectura de Lección (Pagina compacta de sección en sección para evitar scroll)
  if (selectedLesson) {
    const quickQuestion = FARMACIA_QUESTIONS.find((q) => q.id === selectedLesson.quickCheckQuestionId);
    const isCompleted = state.completedLessonIds.includes(selectedLesson.id);
    const totalSections = selectedLesson.sections.length + (quickQuestion ? 1 : 0);
    const isQuickQuizStep = sectionIndex === selectedLesson.sections.length;
    const currentSection = selectedLesson.sections[sectionIndex];

    return (
      <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-2 select-none">
        {/* Header de la Lección */}
        <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setSelectedLesson(null)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Paso {sectionIndex + 1} de {totalSections}
            </span>
          </div>

          <h1 className="text-xs sm:text-sm font-extrabold text-white truncate">
            {selectedLesson.title}
          </h1>
          <p className="text-[10px] text-slate-400 truncate">{selectedLesson.subtitle}</p>
        </div>

        {/* Contenido de la Sección Activa (Ajustado al alto restante) */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
          {!isQuickQuizStep && currentSection ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="font-bold text-white text-xs sm:text-sm">
                    {currentSection.heading}
                  </h2>
                  {currentSection.normativeBadge && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                      {currentSection.normativeBadge}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentSection.content}
                </p>

                {currentSection.keyPoints && currentSection.keyPoints.length > 0 && (
                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 space-y-1 mt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Puntos Clave SEREMI:
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-slate-200">
                      {currentSection.keyPoints.slice(0, 3).map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1">
                          <span className="text-emerald-400 font-bold">·</span>
                          <span className="leading-tight">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Botón de Siguiente Sección */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between mt-2 shrink-0">
                <button
                  disabled={sectionIndex === 0}
                  onClick={() => setSectionIndex((p) => Math.max(0, p - 1))}
                  className="px-3 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={() => setSectionIndex((p) => p + 1)}
                  className="px-4 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1 shadow-md"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : quickQuestion ? (
            /* Comprobación Rápida de la Lección */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Comprobación SEREMI (+40 XP)
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-2 leading-snug">
                  {quickQuestion.enunciado}
                </h3>

                <div className="space-y-1.5">
                  {quickQuestion.opciones.map((opt) => {
                    const isSelected = selectedAnswer === opt.id;
                    const isCorrect = opt.id === quickQuestion.respuestaCorrecta;

                    let btnStyle = 'bg-slate-800/70 border-slate-700 text-slate-200';
                    if (answerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-medium';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={answerSubmitted}
                        onClick={() => setSelectedAnswer(opt.id)}
                        className={`w-full text-left p-2 rounded-xl border text-[11px] leading-tight flex items-start gap-2 transition-all ${btnStyle}`}
                      >
                        <span className="font-mono font-bold text-[10px]">{opt.id}.</span>
                        <span className="flex-1">{opt.texto}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Comprobar o Terminar */}
              <div className="pt-2 border-t border-slate-800 mt-2 shrink-0">
                {!answerSubmitted ? (
                  <button
                    disabled={!selectedAnswer}
                    onClick={() => handleCheckAnswer(quickQuestion.respuestaCorrecta)}
                    className="w-full h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs"
                  >
                    Verificar Respuesta
                  </button>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 truncate">
                      {quickQuestion.justificacionOficial}
                    </p>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Finalizar y Volver al Catálogo
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Vista del Catálogo de Cursos (Fija, compacta, 100% viewport)
  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header del Catálogo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-white shrink-0">
        <h1 className="text-xs sm:text-sm font-extrabold tracking-tight">Cursos y Decretos Oficiales</h1>
        <p className="text-[10px] text-slate-300">
          Temario del examen de Auxiliar de Farmacia (SEREMI de Salud de Chile).
        </p>
      </div>

      {/* Lista Compacta de 5 Cursos Oficiales (Encaja sin scroll en la pantalla) */}
      <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-hidden">
        {COURSES_LESSONS.map((lesson) => {
          const catInfo = CATEGORIES_CONFIG.find((c) => c.id === lesson.category);
          const isCompleted = state.completedLessonIds.includes(lesson.id);
          const isLocked = lesson.isProOnly && !state.isPro;

          return (
            <div
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-98 ${
                isLocked
                  ? 'bg-slate-900/50 border-slate-800/80 opacity-80 hover:border-amber-500/40'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-bold text-emerald-400 font-mono">
                    {catInfo?.decreeReference}
                  </span>
                  {isCompleted && (
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Listo
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 px-1 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <h2 className="text-xs font-bold text-white truncate leading-tight">{lesson.title}</h2>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{lesson.subtitle}</p>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold">
                {isLocked ? (
                  <span className="text-amber-400">PRO →</span>
                ) : (
                  <span className="text-emerald-400">{isCompleted ? 'Repasar' : 'Iniciar'} →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini banner de apoyo */}
      <div className="shrink-0 p-1.5 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center justify-between text-[10px] text-slate-400">
        <span>Legislación farmacéutica oficial actualizada</span>
        <span className="text-emerald-400 font-mono">5/5 Unidades</span>
      </div>
    </div>
  );
};
