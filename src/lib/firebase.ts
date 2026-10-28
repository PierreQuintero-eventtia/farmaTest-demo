import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, SimulacroResult } from '../types/farmacia';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In with Popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.warn('Google Sign-In Popup failed or blocked:', error);
    return { user: null, error: error.message || 'Error al iniciar con Google' };
  }
}

// Email/Password Sign-In
export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Credenciales inválidas' };
  }
}

// Email/Password Registration
export async function registerWithEmail(email: string, pass: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Error al crear la cuenta' };
  }
}

// Sign Out
export async function logoutUser() {
  await signOut(auth);
}

// =========================================================================
// FIRESTORE DATABASE SYNCHRONIZATION HELPERS
// =========================================================================

// Leer el perfil del usuario desde Firestore
export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Error al leer perfil desde Firestore:', error);
  }
  return null;
}

// Guardar o actualizar el perfil del usuario en Firestore (incluyendo onboardingCompleted y userId)
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', profile.id);
    await setDoc(
      userDocRef,
      {
        userId: profile.id,
        id: profile.id,
        name: profile.name,
        email: profile.email,
        region: profile.region,
        role: profile.role,
        targetExamDate: profile.targetExamDate,
        notificationsEnabled: profile.notificationsEnabled,
        streakRemindersEnabled: profile.streakRemindersEnabled,
        onboardingCompleted: profile.onboardingCompleted,
        preTestScore: profile.preTestScore ?? null,
        studySchedule: profile.studySchedule ?? null,
        fcmToken: profile.fcmToken ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Error al guardar perfil en Firestore:', error);
    return false;
  }
}

// Guardar token específico de FCM en el documento del usuario
export async function saveUserFcmToken(userId: string, fcmToken: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        fcmToken,
        fcmTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Error al guardar token FCM en Firestore:', error);
    return false;
  }
}

// Sincronizar el estado de Racha, Vidas e Inventario con la estructura exacta en Firestore
export async function syncGamificationToFirestore(
  userId: string,
  state: import('../types/farmacia').UserGamificationState
): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const nextRefillSeconds = Math.floor(
      (state.lastHeartRegenTimestamp + 5 * 60 * 60 * 1000) / 1000
    );

    const payload = {
      userId,
      streak: {
        count: state.streakDays,
        extendedToday: state.streakSavedToday,
        freezesEquipped: state.freezeEquipped,
        lastCompletedDate: state.lastActiveDate,
      },
      health: {
        currentHearts: state.hearts,
        maxHearts: state.maxHearts,
        nextRefillTimestamp: nextRefillSeconds,
      },
      inventory: {
        gems: state.gems,
        lingots: 0,
        activeBoosters: state.activeBoost
          ? [
              {
                type: state.activeBoost === 'EARLY_BIRD' ? 'EARLY_BIRD_DOUBLE_XP' : 'NIGHT_OWL_DOUBLE_XP',
                expiresAt: Math.floor((state.boostExpiresAt || Date.now() + 3600000) / 1000),
              },
            ]
          : [],
      },
      xp: state.xp,
      isPro: state.isPro,
      unlockedBadges: state.unlockedBadges || [],
      simulacrosCompletedCount: state.simulacrosCompletedCount || 0,
      perfectScoresCount: state.perfectScoresCount || 0,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('Error al sincronizar gamificación en Firestore:', error);
    return false;
  }
}

// Cargar estado de gamificación desde Firestore
export async function getGamificationFromFirestore(
  userId: string
): Promise<Partial<import('../types/farmacia').UserGamificationState> | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const partialState: Partial<import('../types/farmacia').UserGamificationState> = {};

      if (data.streak) {
        partialState.streakDays = data.streak.count ?? 0;
        partialState.streakSavedToday = data.streak.extendedToday ?? false;
        partialState.freezeEquipped = data.streak.freezesEquipped ?? 0;
        partialState.lastActiveDate = data.streak.lastCompletedDate ?? '';
      }

      if (data.health) {
        partialState.hearts = data.health.currentHearts ?? 5;
        partialState.maxHearts = data.health.maxHearts ?? 5;
      }

      if (data.inventory) {
        partialState.gems = data.inventory.gems ?? 0;
      }

      if (data.unlockedBadges) {
        partialState.unlockedBadges = data.unlockedBadges;
      }

      if (typeof data.xp === 'number') partialState.xp = data.xp;
      if (typeof data.isPro === 'boolean') partialState.isPro = data.isPro;
      if (typeof data.simulacrosCompletedCount === 'number') {
        partialState.simulacrosCompletedCount = data.simulacrosCompletedCount;
      }
      if (typeof data.perfectScoresCount === 'number') {
        partialState.perfectScoresCount = data.perfectScoresCount;
      }

      return partialState;
    }
  } catch (error) {
    console.warn('Error al leer gamificación desde Firestore:', error);
  }
  return null;
}

// Guardar resultado de simulacro en la subcolección del usuario
export async function saveSimulacroToFirestore(userId: string, result: SimulacroResult): Promise<boolean> {
  try {
    const simDocRef = doc(db, 'users', userId, 'simulacros', result.id);
    await setDoc(simDocRef, {
      id: result.id,
      userId,
      duracionSegundos: result.duracionSegundos,
      totalPreguntas: result.totalPreguntas,
      correctas: result.correctas,
      incorrectas: result.incorrectas,
      omitidas: result.omitidas,
      puntajePorcentaje: result.puntajePorcentaje,
      aprobado: result.aprobado,
      brechasPorCategoria: result.brechasPorCategoria,
      timestamp: result.timestamp,
    });
    return true;
  } catch (error) {
    console.warn('Error al guardar simulacro en Firestore:', error);
    return false;
  }
}

// Eliminar permanentemente la cuenta de usuario de Firestore y Firebase Auth
export async function deleteUserAccountFromFirestore(userId: string): Promise<boolean> {
  try {
    // 1. Eliminar documento del usuario en Firestore
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);

    // 2. Si el usuario actual de Auth coincide, eliminarlo de Firebase Authentication
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await auth.currentUser.delete().catch((err) => {
        console.warn('Firebase Auth user delete falló (puede requerir re-login reciente):', err);
      });
    }

    // 3. Cerrar sesión
    await signOut(auth).catch(() => {});
    return true;
  } catch (error) {
    console.warn('Error al eliminar cuenta en Firestore:', error);
    // Intentar cerrar sesión de todos modos
    await signOut(auth).catch(() => {});
    return false;
  }
}

export type { FirebaseUser };
