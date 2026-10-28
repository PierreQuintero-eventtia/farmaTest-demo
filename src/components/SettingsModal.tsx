import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Bell,
  Smartphone,
  LogOut,
  Check,
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Send,
  Zap,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Radio,
  Copy,
  Trash2,
} from 'lucide-react';
import { UserProfile, UserGamificationState, StudyScheduleSettings } from '../types/farmacia';
import { requestFCMTokenAndRegister, dispatchTestFCMReminder } from '../lib/fcm';

interface SettingsModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  state: UserGamificationState;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenPaywall: () => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void> | void;
  onReplaySplash: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  profile,
  state,
  onClose,
  onUpdateProfile,
  onOpenPaywall,
  onLogout,
  onDeleteAccount,
  onReplaySplash,
}) => {
  const [activeTab, setActiveTab] = useState<'PERFIL' | 'HORARIOS' | 'PLAN' | 'APP'>('PERFIL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Form states - Perfil
  const [editName, setEditName] = useState(profile?.name || 'Camila Morales');
  const [editRegion, setEditRegion] = useState(profile?.region || 'Región Metropolitana de Santiago');

  // Form states - Notificaciones & Momento Ideal
  const defaultSchedule: StudyScheduleSettings = {
    enabled: true,
    idealTime: '21:00',
    smartDetection: true,
    detectedPeakSlot: state.unlockedBadges.includes('badge_early_bird')
      ? 'Mañana (08:30 hrs - Madrugador)'
      : 'Noche (21:00 hrs - Turno de Guardia)',
    activeDays: [1, 2, 3, 4, 5, 6, 0], // Lunes a Domingo
    soundEnabled: true,
  };

  const [schedule, setSchedule] = useState<StudyScheduleSettings>(
    profile?.studySchedule || defaultSchedule
  );

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(
    profile?.fcmToken || (typeof window !== 'undefined' ? localStorage.getItem('farmatest_fcm_token') : null)
  );
  const [fcmRegistering, setFcmRegistering] = useState(false);
  const [fcmCopied, setFcmCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<{
    title: string;
    body: string;
  } | null>(null);

  // Check browser notification permission on mount and attempt token check
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
      const stored = localStorage.getItem('farmatest_fcm_token');
      if (stored) {
        setFcmToken(stored);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Detección del Momento Ideal basado en insignias y actividad
  const detectedTime = state.unlockedBadges.includes('badge_early_bird')
    ? '08:30'
    : state.unlockedBadges.includes('badge_night_owl')
    ? '21:30'
    : '21:00';

  const detectedSlotLabel = state.unlockedBadges.includes('badge_early_bird')
    ? '08:30 hrs (Madrugador SEREMI)'
    : state.unlockedBadges.includes('badge_night_owl')
    ? '21:30 hrs (Turno de Guardia Nocturno)'
    : '21:00 hrs (Pico de Mayor Concentración)';

  // Solicitar permiso nativo de Notificaciones Push y registrar Token FCM
  const handleRequestPermission = async () => {
    setFcmRegistering(true);
    try {
      const res = await requestFCMTokenAndRegister(profile?.id);
      setBrowserPermission(res.permission);
      if (res.token) {
        setFcmToken(res.token);
        // Sincronizar en el servidor express
        await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile?.id || 'guest_user',
            fcmToken: res.token,
            idealTime: schedule.idealTime,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error solicitando permiso o registrando FCM:', e);
    } finally {
      setFcmRegistering(false);
    }
  };

  // Disparar notificación de prueba vía FCM y navegador
  const handleSendTestNotification = async () => {
    const title = '🔔 FarmaTest Chile · ¡Tu Momento Ideal de Estudio!';
    const body = `Hola ${profile?.name?.split(' ')[0] || 'Auxiliar'}, son las ${
      schedule.idealTime
    } hrs. Tómate 5 minutos con el D.S. 466 para asegurar tu racha de ${state.streakDays} días.`;

    // 1. Notificación nativa si el navegador lo permite
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/assets/icon-192.png',
        });
      } catch (err) {
        console.warn('No se pudo emitir la notificación nativa:', err);
      }
    }

    // 2. Disparar al endpoint del backend FCM
    if (profile?.id) {
      await dispatchTestFCMReminder(profile.id, title, body).catch(() => {});
    }

    // 3. Notificación visual en pantalla (Preview Toast)
    setPreviewNotification({ title, body });
    setTestNotificationSent(true);
    setTimeout(() => {
      setTestNotificationSent(false);
    }, 3500);
  };

  const handleCopyFcmToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setFcmCopied(true);
      setTimeout(() => setFcmCopied(false), 2000);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setSchedule((prev) => {
      const exists = prev.activeDays.includes(dayIndex);
      const newDays = exists
        ? prev.activeDays.filter((d) => d !== dayIndex)
        : [...prev.activeDays, dayIndex];
      return { ...prev, activeDays: newDays };
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    onUpdateProfile({
      ...profile,
      name: editName,
      region: editRegion,
      notificationsEnabled: schedule.enabled,
      streakRemindersEnabled: schedule.enabled,
      studySchedule: schedule,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const dayLabels = [
    { id: 1, label: 'L' },
    { id: 2, label: 'M' },
    { id: 3, label: 'X' },
    { id: 4, label: 'J' },
    { id: 5, label: 'V' },
    { id: 6, label: 'S' },
    { id: 0, label: 'D' },
  ];

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
    } catch (e) {
      console.warn('Error al eliminar cuenta:', e);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal de Confirmación de Borrado Permanente de Cuenta */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1.5">
              ¿Eliminar tu Cuenta Definitivamente?
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed max-w-xs">
              Esta acción borrará de forma permanente tu perfil, historial de simulacros, racha de{' '}
              <strong className="text-amber-400">{state.streakDays} días</strong> y datos en la base de datos Firestore. Serás redirigido a la pantalla de inicio de sesión.
            </p>
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 active:scale-98"
              >
                {isDeletingAccount ? (
                  <span>Eliminando cuenta en Firestore...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar mi Cuenta y Datos</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Configuración y Cuenta</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 bg-slate-950/60 p-1 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('PERFIL')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'PERFIL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('HORARIOS')}
            className={`py-2 rounded-xl font-semibold transition-all relative flex items-center justify-center gap-1 ${
              activeTab === 'HORARIOS'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Push</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('PLAN')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'PLAN' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plan
          </button>
          <button
            onClick={() => setActiveTab('APP')}
            className={`py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'APP' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            App
          </button>
        </div>

        {/* In-App Floating Push Notification Preview */}
        {previewNotification && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-xl animate-fadeIn flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Vista Previa Push · Ahora
                </span>
                <button
                  onClick={() => setPreviewNotification(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-white">{previewNotification.title}</h4>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                {previewNotification.body}
              </p>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* ========================================================================= */}
          {/* TAB 1: PERFIL */}
          {/* ========================================================================= */}
          {activeTab === 'PERFIL' && (
            <form onSubmit={handleSaveAll} className="space-y-3.5">
              <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-base shrink-0">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">{profile?.name || 'Usuario FarmaTest'}</h3>
                  <p className="text-[11px] text-slate-400">{profile?.email || 'estudiante@farmatest.cl'}</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Región SEREMI</label>
                <input
                  type="text"
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Cambios Guardados!</span>
                  </>
                ) : (
                  <span>Guardar Datos de Perfil</span>
                )}
              </button>

              {/* Zona Peligrosa: Eliminar Cuenta */}
              <div className="pt-2 border-t border-slate-800">
                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-rose-300 text-xs">Eliminar Cuenta</h5>
                    <p className="text-[10px] text-slate-400">
                      Borra tu usuario, progreso y datos de Firestore permanentemente
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GESTIÓN DE NOTIFICACIONES PUSH & MOMENTO IDEAL DE ESTUDIO */}
          {/* ========================================================================= */}
          {activeTab === 'HORARIOS' && (
            <div className="space-y-4">
              {/* Master Switch Push */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Recordatorios Push de Estudio</h4>
                    <p className="text-[11px] text-slate-400">
                      Notificaciones para proteger racha y repasar normativa
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setSchedule((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Detección Inteligente del Momento Ideal */}
              <div className="p-4 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-extrabold text-white text-xs">
                      Detección Inteligente de Actividad
                    </h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={schedule.smartDetection}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, smartDetection: e.target.checked }))
                    }
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Analiza tus horarios de mayor rendimiento en lecciones y simulacros para recordarte estudiar en tu ventana de máxima concentración.
                </p>

                <div className="p-3 bg-slate-900/90 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-semibold block uppercase tracking-wider">
                      Momento Ideal Detectado
                    </span>
                    <strong className="text-xs font-bold text-white">{detectedSlotLabel}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSchedule((prev) => ({
                        ...prev,
                        idealTime: detectedTime,
                        detectedPeakSlot: detectedSlotLabel,
                      }))
                    }
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-[11px] rounded-lg transition-all"
                  >
                    Aplicar ({detectedTime})
                  </button>
                </div>
              </div>

              {/* Selector de Hora Exacta */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">Hora del Recordatorio:</span>
                  </div>
                  <input
                    type="time"
                    value={schedule.idealTime}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, idealTime: e.target.value }))
                    }
                    className="bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm px-2.5 py-1 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Presets Rápidos */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, idealTime: '08:00' }))}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      schedule.idealTime === '08:00'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🌅 08:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, idealTime: '13:30' }))}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      schedule.idealTime === '13:30'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🥪 13:30 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, idealTime: '21:00' }))}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      schedule.idealTime === '21:00'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🌙 21:00 PM
                  </button>
                </div>
              </div>

              {/* Días Activos de la Semana */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">Días de Recordatorio:</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {schedule.activeDays.length === 7 ? 'Todos los días' : `${schedule.activeDays.length} días/sem`}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {dayLabels.map((d) => {
                    const isSelected = schedule.activeDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleDay(d.id)}
                        className={`h-9 rounded-xl font-bold text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estado de Permiso del Navegador */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Permiso en este Dispositivo:
                  </span>
                  {browserPermission === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Permitido
                    </span>
                  ) : browserPermission === 'denied' ? (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Bloqueado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400">Pendiente</span>
                  )}
                </div>

                {browserPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    disabled={fcmRegistering}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{fcmRegistering ? 'Conectando con FCM...' : 'Habilitar Permiso de Notificaciones'}</span>
                  </button>
                )}
              </div>

              {/* Módulo Firebase Cloud Messaging (FCM) */}
              <div className="p-3.5 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-white text-[11px]">Firebase Cloud Messaging (FCM)</h5>
                      <span className="text-[9px] text-slate-400 block">Service Worker: /firebase-messaging-sw.js</span>
                    </div>
                  </div>

                  {fcmToken ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Conectado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Sin vincular
                    </span>
                  )}
                </div>

                {fcmToken ? (
                  <div className="space-y-1.5">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="truncate mr-2 font-mono text-[10px] text-slate-300">
                        {fcmToken.slice(0, 24)}...
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyFcmToken}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 text-[10px] flex items-center gap-1 px-1.5 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{fcmCopied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Token persistido en Firestore (<code className="text-emerald-400">/users/{profile?.id?.slice(0, 8)}/fcmToken</code>). El servidor despachará recordatorios incluso con la app cerrada.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Permite que Firebase te envíe recordatorios en segundo plano cuando sea tu momento ideal ({schedule.idealTime} hrs).
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      disabled={fcmRegistering}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{fcmRegistering ? 'Obteniendo Token FCM...' : 'Vincular este Dispositivo con FCM'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botón de Prueba en Tiempo Real */}
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {testNotificationSent
                    ? '¡Notificación Emitida!'
                    : 'Probar Notificación de Recordatorio Ahora'}
                </span>
              </button>

              {/* Botón Guardar Horarios */}
              <button
                type="button"
                onClick={handleSaveAll}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Horarios y Push Guardados!</span>
                  </>
                ) : (
                  <span>Guardar Configuración de Recordatorios</span>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PLAN & SUSCRIPCIÓN */}
          {/* ========================================================================= */}
          {activeTab === 'PLAN' && (
            <div className="space-y-3 pt-0 mt-0">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Estado de tu Cuenta</span>
                  {state.isPro ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
                      PRO Activo
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      Plan Gratuito
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-white">
                  {state.isPro ? 'Membresía FarmaTest PRO' : 'Acceso Estándar con Anuncios'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {state.isPro
                    ? 'Tienes acceso ilimitado a los 5 cursos oficiales, Tutor IA con legislación SEREMI, simulacros contrarreloj y cero anuncios.'
                    : 'Acceso a 2 cursos teóricos. Desbloquea simulacros y vidas mediante anuncios de video.'}
                </p>

                {/* Desglose de beneficios para eliminar cualquier espacio en blanco */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${state.isPro ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>5 Cursos de Farmacología y Legislación SEREMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${state.isPro ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Tutor IA con Decretos 466, 404 y 405 (Exclusivo PRO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${state.isPro ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Vidas y simulacros ilimitados sin anuncios</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaywall();
                  }}
                  className="w-full mt-2 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{state.isPro ? 'Gestionar o Cambiar Plan' : 'Mejorar a FarmaTest PRO'}</span>
                </button>
              </div>

              {/* In-app Currency & Freeze Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gemas Acumuladas</span>
                  <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                    {state.gems}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Protector Racha</span>
                  <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                    {state.freezeEquipped} equipados
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: APP & APK */}
          {/* ========================================================================= */}
          {activeTab === 'APP' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                  <span>Información Técnica de la App</span>
                </div>
                <div className="space-y-1 text-slate-300 text-xs">
                  <p>Versión: <strong className="text-white font-mono">1.2.0 (PWA + APK Ready)</strong></p>
                  <p>Framework: <strong className="text-white">React 19 + Express Server</strong></p>
                  <p>Tutor IA: <strong className="text-white">Google Gemini 3.8 Flash (Server-Side)</strong></p>
                  <p>Normativa: <strong className="text-white">SEREMI de Salud Chile / ISP</strong></p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">Pantalla Inicial (Splash Screen)</h4>
                <p className="text-[11px] text-slate-300">
                  Puedes volver a ver la animación de bienvenida inicial en cualquier momento.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplaySplash();
                  }}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <span>▶ Reproducir Pantalla de Inicio (Splash)</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">¿Cómo convertirla en APK?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Esta app ya incluye el archivo <strong>GUIA_EXPORTAR_APK.md</strong> en el proyecto con las instrucciones para subirla a Google Play Store mediante TWA (PWABuilder) o empaquetarla con Capacitor en 5 minutos.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions: Cerrar Sesión & Eliminar Cuenta */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-rose-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Cuenta Definitivamente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
