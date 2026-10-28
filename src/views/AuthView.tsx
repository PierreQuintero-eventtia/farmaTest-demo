import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/farmacia';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from '../lib/firebase';

interface AuthViewProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google Sign-In Real
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { user, error } = await signInWithGoogle();

    if (user) {
      // Consultar si ya tiene registro y onboarding previo en Firestore
      const existingDoc = await getUserProfileFromFirestore(user.uid);
      setLoading(false);

      if (existingDoc && existingDoc.onboardingCompleted) {
        onAuthSuccess(existingDoc);
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Auxiliar de Farmacia',
          email: user.email || 'usuario@farmacia.cl',
          region: existingDoc?.region || 'Región Metropolitana de Santiago',
          role: existingDoc?.role || 'SIN_ESPECIFICAR',
          targetExamDate: '15 de Noviembre 2026',
          notificationsEnabled: true,
          streakRemindersEnabled: true,
          onboardingCompleted: false, // Onboarding pendiente
        };
        // Guardar documento inicial en Firestore
        await saveUserProfileToFirestore(newProfile);
        onAuthSuccess(newProfile);
      }
    } else {
      setLoading(false);
      if (error) {
        setErrorMsg(error.includes('popup-closed-by-user') ? 'Ventana emergente cerrada antes de completar el inicio.' : error);
      }
    }
  };

  // Email Submit (Solo Correo y Contraseña con Validación Real en Base de Datos)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    if (isRegister) {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }

      try {
        // 1. Registrar usuario en la base de datos de cuentas
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.message || 'Error al registrar la cuenta.');
          setLoading(false);
          return;
        }

        const newProfile: UserProfile = data.profile;

        // 2. Intentar registrar también en Firebase Auth si está habilitado
        const { user } = await registerWithEmail(email, password);
        if (user) {
          newProfile.id = user.uid;
        }

        // 3. Persistir en Firestore
        await saveUserProfileToFirestore(newProfile);

        setLoading(false);
        // Llevar al nuevo usuario al Onboarding/Pre-test inicial
        onAuthSuccess(newProfile);
      } catch (err: any) {
        console.error('Error durante registro:', err);
        setErrorMsg('Ocurrió un error al procesar el registro. Intenta nuevamente.');
        setLoading(false);
      }
    } else {
      // Iniciar Sesión (Usuario recurrente)
      try {
        // 1. Consultar base de datos central de cuentas
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        // SI LA CUENTA NO EXISTE O FUE ELIMINADA, O SI LA CONTRASEÑA NO COINCIDE:
        if (!res.ok) {
          setLoading(false);
          setErrorMsg(data.message || 'Correo o contraseña incorrectos.');
          return;
        }

        let userProfile: UserProfile = data.profile;

        // 2. Intentar autenticar en Firebase Auth si aplica
        const { user } = await loginWithEmail(email, password);
        const searchId = user?.uid || userProfile.id;

        // 3. Cargar datos actualizados desde Firestore si existen
        try {
          const existingDoc = await getUserProfileFromFirestore(searchId);
          if (existingDoc) {
            userProfile = existingDoc;
          }
        } catch (e) {
          console.warn('Error leyendo Firestore:', e);
        }

        setLoading(false);
        onAuthSuccess(userProfile);
      } catch (err: any) {
        console.error('Error durante inicio de sesión:', err);
        setErrorMsg('Error de conexión al verificar credenciales.');
        setLoading(false);
      }
    }
  };

  // Demo Rápido para Pruebas Instantáneas
  const handleQuickDemoAccess = () => {
    const demoProfile: UserProfile = {
      id: `usr_demo_${Date.now()}`,
      name: 'Estudiante Farmacia',
      email: 'demo@farmatest.cl',
      region: 'Región Metropolitana de Santiago',
      role: 'SIN_ESPECIFICAR',
      targetExamDate: '15 de Noviembre 2026',
      notificationsEnabled: true,
      streakRemindersEnabled: true,
      onboardingCompleted: false, // Disparará el flujo de pre-test
    };
    onAuthSuccess(demoProfile);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 text-white flex flex-col justify-between px-3 sm:px-4 py-3 sm:py-4 max-w-md mx-auto select-none">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-1 mb-2 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20 mb-0.5">
          FT
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">
          FarmaTest <span className="text-emerald-400">Chile</span>
        </h1>
        <p className="text-[11px] text-slate-400 max-w-xs leading-tight">
          Preparación Examen de Competencias Auxiliar de Farmacia (SEREMI)
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 shrink-0">
        {/* Toggle Login / Register */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              !isRegister ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              isRegister ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Google Real Sign-In Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold">
            o con correo y clave
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Solo Correo y Contraseña */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
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
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>{isRegister ? 'Crear Cuenta' : 'Entrar a FarmaTest'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleQuickDemoAccess}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Probar Flujo Nuevo (Demo + Pre-test)</span>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Tus datos y avance se sincronizan con Google Cloud</span>
      </div>
    </div>
  );
};
