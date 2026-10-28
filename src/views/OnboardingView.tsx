import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, MapPin, Briefcase, Target, Shield, Clock } from 'lucide-react';
import { UserProfile, FarmaciaQuestion } from '../types/farmacia';
import { FARMACIA_QUESTIONS } from '../data/questionsData';

interface OnboardingViewProps {
  initialProfile: UserProfile;
  onCompleteOnboarding: (finalProfile: UserProfile) => void;
}

const REGIONES_CHILE = [
  'Región Metropolitana de Santiago',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de Antofagasta',
  'Región de Coquimbo',
  'Región de O’Higgins',
  'Región del Maule',
  'Región de La Araucanía',
  'Región de Los Lagos',
  'Región de Tarapacá',
  'Región de Los Ríos',
  'Región de Arica y Parinacota',
  'Región de Ñuble',
  'Región de Atacama',
  'Región de Aysén',
  'Región de Magallanes',
];

const ROLES_OPTIONS = [
  {
    id: 'ASPIRANTE',
    title: 'Aspirante por Primera Vez',
    desc: 'Sin experiencia previa, preparando el examen oficial desde cero.',
  },
  {
    id: 'AUXILIAR_CADENA',
    title: 'Farmacia de Cadena',
    desc: 'Experiencia en Cruz Verde, Salcobrand, Ahumada u operadoras.',
  },
  {
    id: 'AUXILIAR_INDEPENDIENTE',
    title: 'Farmacia Independiente o Comunal',
    desc: 'Atención en farmacias de barrio, comunitarias o botiquines.',
  },
  {
    id: 'ESTUDIANTE',
    title: 'Estudiante Técnico en Farmacia',
    desc: 'Cursando o egresado de carrera técnica de nivel superior.',
  },
  {
    id: 'SIN_ESPECIFICAR',
    title: 'Prefiero no especificar por ahora',
    desc: 'Acceder directamente con plan de preparación general.',
  },
] as const;

// 3 preguntas rápidas para el Pre-Test diagnóstico
const PRE_TEST_QUESTIONS: FarmaciaQuestion[] = [
  FARMACIA_QUESTIONS[0], // D.S. 466 Director Técnico
  FARMACIA_QUESTIONS[6], // Cadena de frío 2°C a 8°C
  FARMACIA_QUESTIONS[11], // Receta cheque 30 días
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialProfile,
  onCompleteOnboarding,
}) => {
  // Pasos:
  // 1: Región
  // 2: Rol
  // 3: Pre-Test Q1
  // 4: Pre-Test Q2
  // 5: Pre-Test Q3
  // 6: Resultado y Bienvenida
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [selectedRegion, setSelectedRegion] = useState(initialProfile.region || 'Región Metropolitana de Santiago');
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('SIN_ESPECIFICAR');
  const [preTestAnswers, setPreTestAnswers] = useState<Record<string, string>>({});

  const progressPercent = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finalizar e ir al Dashboard
      let score = 0;
      PRE_TEST_QUESTIONS.forEach((q) => {
        if (preTestAnswers[q.id] === q.respuestaCorrecta) {
          score += 1;
        }
      });

      const finalProfile: UserProfile = {
        ...initialProfile,
        region: selectedRegion,
        role: selectedRole,
        onboardingCompleted: true,
        preTestScore: score,
      };
      onCompleteOnboarding(finalProfile);
    }
  };

  const handleSkipToDashboard = () => {
    const finalProfile: UserProfile = {
      ...initialProfile,
      region: selectedRegion,
      role: selectedRole,
      onboardingCompleted: true,
    };
    onCompleteOnboarding(finalProfile);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#050914] text-white flex flex-col justify-between px-4 py-3 sm:py-4 max-w-md mx-auto select-none">
      {/* Top Header matching reference image: Back arrow, filled progress line, Step X of Y */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <button
            type="button"
            onClick={handleBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentStep > 1 ? 'hover:bg-slate-800 text-white' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-xs tracking-tight text-slate-200">
            Paso {currentStep} de {totalSteps}
          </span>
        </div>

        {/* Continuous horizontal progress bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
        {/* ================= STEP 1: REGIÓN ================= */}
        {currentStep === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                ¿En qué región de Chile rendirás tu examen?
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                La SEREMI de Salud organiza sus calendarios oficiales.
              </p>
            </div>

            {/* Visual Center Anchor */}
            <div className="flex justify-center py-2">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                <MapPin className="w-10 h-10" />
              </div>
            </div>

            {/* Region List with Checked State */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {REGIONES_CHILE.map((reg) => {
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between active:scale-98 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{reg}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: ROL SANITARIO ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
                ¿Cuál es tu situación o experiencia actual?
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Selecciona la opción que mejor describe tu trayectoria (o déjalo sin especificar).
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {ROLES_OPTIONS.map((opt) => {
                const isSelected = selectedRole === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRole(opt.id as any)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 active:scale-98 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1">
                      <span className="font-bold text-sm block text-white">{opt.title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEPS 3, 4, 5: PRE-TEST QUESTIONS ================= */}
        {currentStep >= 3 && currentStep <= 5 && (
          <div className="space-y-4 animate-fadeIn">
            {(() => {
              const qIndex = currentStep - 3;
              const q = PRE_TEST_QUESTIONS[qIndex];
              const selectedOption = preTestAnswers[q.id];

              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Pre-Test Diagnóstico {qIndex + 1} de 3
                    </span>
                    <button
                      type="button"
                      onClick={handleSkipToDashboard}
                      className="text-[11px] text-slate-400 hover:text-white underline font-medium"
                    >
                      Saltar al Dashboard
                    </button>
                  </div>

                  <h1 className="text-lg font-bold text-white leading-snug">
                    {q.enunciado}
                  </h1>

                  <div className="space-y-2.5 pt-2">
                    {q.opciones.map((op) => {
                      const isChecked = selectedOption === op.id;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() =>
                            setPreTestAnswers((prev) => ({
                              ...prev,
                              [q.id]: op.id,
                            }))
                          }
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 active:scale-98 ${
                            isChecked
                              ? 'bg-amber-500/15 border-amber-500 text-white font-semibold shadow-md shadow-amber-500/10'
                              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                              isChecked ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-700'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="flex-1 leading-relaxed">
                            <strong className="font-mono text-slate-200 mr-1.5">{op.id}.</strong>
                            <span>{op.texto}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ================= STEP 6: BIENVENIDA Y RESUMEN ================= */}
        {currentStep === 6 && (
          <div className="space-y-5 text-center animate-fadeIn py-4">
            {/* Visual Hero Icon Badge */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto text-slate-950 shadow-2xl shadow-emerald-500/30">
              <Sparkles className="w-12 h-12 fill-slate-950" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">¡Plan de Estudio Calibrado!</h1>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                Hemos configurado tus simulacros y material para la <strong>{selectedRegion}</strong>.
              </p>
            </div>

            {/* Highlighted Value Box matching reference screenshot */}
            <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-xs text-slate-200 font-semibold leading-snug">
                  Temario normativo verificado: D.S. 466, D.S. 404, D.S. 405 y Código Sanitario.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <p className="text-xs text-slate-200 font-semibold leading-snug">
                  Bonificación de bienvenida: +50 XP y racha inicial de 1 día activa.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Pinned Primary CTA Button */}
      <div className="shrink-0 pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
        >
          <span>{currentStep === totalSteps ? 'Entrar al Dashboard' : 'Continuar'}</span>
        </button>
      </div>
    </div>
  );
};
