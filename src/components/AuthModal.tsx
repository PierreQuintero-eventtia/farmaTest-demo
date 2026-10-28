import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, Briefcase, Sparkles, Check, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/farmacia';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('Camila Morales');
  const [email, setEmail] = useState('camila.farmacia@ejemplo.cl');
  const [password, setPassword] = useState('••••••••');
  const [region, setRegion] = useState('Región Metropolitana de Santiago');
  const [role, setRole] = useState<'ASPIRANTE' | 'AUXILIAR_CADENA' | 'AUXILIAR_INDEPENDIENTE' | 'ESTUDIANTE'>('ASPIRANTE');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || 'Estudiante FarmaTest',
      email: email || 'usuario@farmatest.cl',
      region,
      role,
      targetExamDate: '15 de Noviembre 2026',
      notificationsEnabled: true,
      streakRemindersEnabled: true,
      onboardingCompleted: true,
    };

    onLoginSuccess(newProfile);
    onClose();
  };

  const handleQuickDemoLogin = () => {
    const demoProfile: UserProfile = {
      id: 'usr_demo_123',
      name: 'Camila Morales',
      email: 'camila.morales@farmatest.cl',
      region: 'Región Metropolitana de Santiago',
      role: 'ASPIRANTE',
      targetExamDate: '15 de Noviembre 2026',
      notificationsEnabled: true,
      streakRemindersEnabled: true,
      onboardingCompleted: true,
    };
    onLoginSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              FT
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isRegisterMode ? 'Crear Cuenta de Postulante' : 'Iniciar Sesión'}
              </h2>
              <p className="text-[11px] text-slate-400">Accede a tus simulacros y guarda tu racha</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Entrar con Perfil Demo Inmediato (1 Clic)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold">
              o con tus datos
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Camila Morales Riquelme"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.cl"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Region and Role Selectors (for customized SEREMI exam context) */}
          <div className="grid grid-cols-1 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Región de Rendición SEREMI
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  {REGIONES_CHILE.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Tu Situación Actual
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  <option value="ASPIRANTE">Aspirante / Postulante Primera Vez</option>
                  <option value="AUXILIAR_CADENA">Auxiliar en Farmacia de Cadena (Ahumada/Cruz Verde/Salcobrand)</option>
                  <option value="AUXILIAR_INDEPENDIENTE">Auxiliar en Farmacia Independiente o Popular</option>
                  <option value="ESTUDIANTE">Estudiante de Técnico en Farmacia</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
          >
            <span>{isRegisterMode ? 'Crear Perfil y Comenzar' : 'Entrar a FarmaTest'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {isRegisterMode
                ? '¿Ya tienes cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta? Regístrate gratis aquí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
