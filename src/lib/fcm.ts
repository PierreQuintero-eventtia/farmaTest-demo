/**
 * fcm.ts - Servicio de Firebase Cloud Messaging (FCM) para FarmaTest Chile
 * 
 * Gestiona:
 * 1. Detección de soporte de Push & Service Worker en el dispositivo.
 * 2. Registro del Service Worker `/firebase-messaging-sw.js`.
 * 3. Obtención del FCM Registration Token del navegador/dispositivo.
 * 4. Sincronización del token en Firestore (`/users/{userId}.fcmToken`).
 * 5. Escucha de notificaciones push en primer plano (foreground listener).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';
import { saveUserFcmToken } from './firebase';

let messagingInstance: Messaging | null = null;

/**
 * Verifica si Firebase Cloud Messaging está soportado en este entorno de navegador
 */
export async function isFCMSupported(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }
    return await isSupported();
  } catch (err) {
    console.warn('Error verificando soporte de FCM:', err);
    return false;
  }
}

/**
 * Inicializa la instancia de Firebase Messaging
 */
export async function getFCMInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  const supported = await isFCMSupported();
  if (!supported) return null;

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn('No se pudo inicializar FCM Messaging:', err);
    return null;
  }
}

/**
 * Solicita permiso al usuario y obtiene el FCM Registration Token del dispositivo.
 * Si se pasa userId, lo guarda directamente en su documento de Firestore.
 */
export async function requestFCMTokenAndRegister(userId?: string): Promise<{
  token: string | null;
  permission: NotificationPermission;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { token: null, permission: 'denied', error: 'Notificaciones no soportadas en este navegador' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, permission, error: 'Permiso de notificaciones denegado por el usuario' };
    }

    const messaging = await getFCMInstance();
    if (!messaging) {
      return { token: null, permission, error: 'Firebase Cloud Messaging no compatible con este navegador' };
    }

    // Registrar o reutilizar el Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;

    // Obtener el Registration Token
    // Nota: Si el proyecto tiene VAPID key pública se usa; si no, FCM usa el senderId predeterminado
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
    }).catch(async (e) => {
      console.warn('Intento con ServiceWorker registration default:', e);
      // Fallback estándar si registration falla
      return await getToken(messaging);
    });

    if (token) {
      // Guardar en localStorage para acceso offline rápido
      localStorage.setItem('farmatest_fcm_token', token);

      // Si el usuario está autenticado, sincronizar con Firestore
      if (userId) {
        await saveUserFcmToken(userId, token);
      }

      return { token, permission: 'granted' };
    }

    return { token: null, permission: 'granted', error: 'No se pudo generar el token FCM' };
  } catch (err: any) {
    console.error('Error al registrar FCM Token:', err);
    return {
      token: null,
      permission: Notification.permission || 'denied',
      error: err.message || 'Error desconocido al registrar FCM',
    };
  }
}

/**
 * Escucha notificaciones push cuando la aplicación está en primer plano (Foreground)
 */
export async function subscribeToForegroundFCM(
  onNotificationReceived: (payload: { title: string; body: string; data?: any }) => void
): Promise<(() => void) | null> {
  const messaging = await getFCMInstance();
  if (!messaging) return null;

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensaje FCM recibido en primer plano:', payload);
      const title = payload.notification?.title || payload.data?.title || 'FarmaTest Chile';
      const body = payload.notification?.body || payload.data?.body || '¡Es hora de tu sesión de estudio!';
      
      onNotificationReceived({
        title,
        body,
        data: payload.data,
      });

      // Si el navegador tiene permiso, también mostrar notificación del sistema
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/icon-192.png',
        });
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Error suscribiendo al canal foreground de FCM:', err);
    return null;
  }
}

/**
 * Envía una petición al backend de FarmaTest para disparar un recordatorio de prueba vía API
 */
export async function dispatchTestFCMReminder(userId: string, title?: string, body?: string) {
  const response = await fetch('/api/notifications/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title: title || '💊 FarmaTest Recordatorio SEREMI',
      body: body || '¡Hola! Es tu hora programada de estudio para asegurar tu certificación sanitaria.',
    }),
  });

  return await response.json();
}
