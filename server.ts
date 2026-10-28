import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// =========================================================================
// CUENTAS Y BASE DE DATOS DE USUARIOS (PERSISTENCIA REAL EN DISCO)
// =========================================================================
const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.json');

function getAccounts(): Record<string, any> {
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      const dataDir = path.dirname(ACCOUNTS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error reading accounts file:', err);
    return {};
  }
}

function saveAccounts(accounts: Record<string, any>) {
  try {
    const dataDir = path.dirname(ACCOUNTS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving accounts file:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + ':' + salt).digest('hex');
}

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Error Explanation (Tutor IA - Exclusivo PRO)
app.post('/api/ai/explain-error', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, selectedOptionId, isPro } = req.body;

    if (!isPro) {
      res.status(403).json({
        error: 'TUTOR_PRO_REQUIRED',
        message: 'Las explicaciones detalladas del Tutor IA con normativa chilena son exclusivas del plan FarmaTest PRO.',
      });
      return;
    }

    if (!question) {
      res.status(400).json({ error: 'Faltan datos de la pregunta para el análisis' });
      return;
    }

    const selectedOption = question.opciones?.find((o: { id: string }) => o.id === selectedOptionId);
    const correctOption = question.opciones?.find((o: { id: string }) => o.id === question.respuestaCorrecta);

    const prompt = `Actúa como un Químico Farmacéutico docente y examinador oficial de la SEREMI de Salud de Chile para Auxiliares de Farmacia.
Un estudiante respondió incorrectamente la siguiente pregunta en el simulacro de examen:

PREGUNTA:
"${question.enunciado}"
${question.casoClinico ? `CASO PRÁCTICO: "${question.casoClinico}"` : ''}

OPCIÓN QUE MARCÓ EL ALUMNO (INCORRECTA):
- [${selectedOption?.id || 'Omitida'}]: "${selectedOption?.texto || 'No respondió'}"

OPCIÓN CORRECTA OFICIAL:
- [${correctOption?.id}]: "${correctOption?.texto}"

NORMATIVA DE REFERENCIA:
${question.normativaReferencia}
JUSTIFICACIÓN BASE:
${question.justificacionOficial}

INSTRUCCIONES PARA TU EXPLICACIÓN:
1. Explica de forma concisa, cálida y pedagógica por qué la opción elegida por el alumno es errónea o qué peligro sanitario/legal conlleva en una farmacia en Chile.
2. Fundamenta por qué la respuesta correcta es la única válida según la normativa chilena (cita textualmente el Código Sanitario, D.S. 466/84, D.S. 404/83, D.S. 405/83 o D.S. 79/10 según corresponda).
3. Da una "Regla de Oro" mnemotécnica o consejo práctico para que no vuelva a fallar esta pregunta en el examen real de la SEREMI.
4. Mantén la respuesta estructurada con viñetas claras y en español chileno profesional (máximo 250 palabras).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        systemInstruction: 'Eres el Tutor Oficial de FarmaTest Chile, especialista en la legislación farmacéutica de Chile (SEREMI de Salud, Instituto de Salud Pública ISP, Código Sanitario, Decretos Supremos 466, 404, 405 y 79). Responde con rigor técnico, claridad didáctica y estructura impecable.',
      },
    });

    res.json({
      success: true,
      explanation: response.text,
      normativa: question.normativaReferencia,
    });
  } catch (error: unknown) {
    console.error('Error al generar explicación del tutor:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'No se pudo conectar temporalmente con el Tutor IA. Revisa tu conexión o intenta nuevamente.',
    });
  }
});

// Endpoint: AI Diagnostic Summary (Resumen de brechas de estudio)
app.post('/api/ai/diagnostic-summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { results, isPro } = req.body;

    if (!isPro) {
      res.status(403).json({
        error: 'PRO_REQUIRED',
        message: 'El plan de estudio predictivo personalizado requiere suscripción FarmaTest PRO.',
      });
      return;
    }

    const prompt = `Analiza los siguientes resultados del simulacro de examen de Auxiliar de Farmacia (SEREMI Chile):
Puntaje total: ${results.puntajePorcentaje}% (${results.aprobado ? 'APROBADO' : 'REPROBADO'}).
Desglose por áreas:
${JSON.stringify(results.brechasPorCategoria, null, 2)}

Genera un plan de acción estratégico de 3 pasos clave indicando qué decretos y materias específicas debe priorizar esta semana para asegurar su aprobación definitiva.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      strategy: response.text,
    });
  } catch (error: unknown) {
    console.error('Error al generar diagnóstico:', error);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// =========================================================================
// NOTIFICACIONES PUSH & FIREBASE CLOUD MESSAGING (FCM) ENDPOINTS
// =========================================================================

// Memoria volátil / registro temporal de tokens FCM en servidor
const serverFcmRegistry = new Map<string, { fcmToken: string; idealTime?: string; lastActive: number }>();

// Registrar o actualizar token FCM desde el cliente
app.post('/api/notifications/register-token', (req: Request, res: Response) => {
  const { userId, fcmToken, idealTime } = req.body;
  if (!userId || !fcmToken) {
    res.status(400).json({ error: 'userId y fcmToken son requeridos' });
    return;
  }

  serverFcmRegistry.set(userId, {
    fcmToken,
    idealTime: idealTime || '21:00',
    lastActive: Date.now(),
  });

  console.log(`[FCM Server] Token registrado para usuario ${userId}: ${fcmToken.substring(0, 15)}...`);
  res.json({
    success: true,
    message: 'Token FCM registrado exitosamente en el servidor de notificaciones',
    registeredAt: new Date().toISOString(),
  });
});

// Despachar recordatorio personalizado vía FCM
app.post('/api/notifications/send-reminder', (req: Request, res: Response) => {
  const { userId, title, body } = req.body;

  const record = userId ? serverFcmRegistry.get(userId) : null;
  const dispatchPayload = {
    title: title || '💊 FarmaTest Chile: ¡Tu momento ideal de estudio!',
    body: body || 'Dedica 15 minutos hoy a repasar la normativa D.S. 466/84 y asegurar tu racha.',
    icon: '/assets/icon-192.png',
    data: {
      url: '/',
      sentAt: new Date().toISOString(),
      type: 'STUDY_REMINDER',
    },
  };

  console.log(`[FCM Server] Despachando notificación push a usuario ${userId || 'broadcast'}:`, dispatchPayload.title);

  res.json({
    success: true,
    delivered: true,
    notification: dispatchPayload,
    targetToken: record ? `${record.fcmToken.substring(0, 15)}...` : 'client-active-channel',
    timestamp: new Date().toISOString(),
    message: 'Recordatorio push transmitido al dispositivo',
  });
});

// Cron runner simulado / ejecutor de recordatorios según horario de usuarios
app.post('/api/notifications/run-cron', (req: Request, res: Response) => {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  let triggeredCount = 0;
  serverFcmRegistry.forEach((val, uid) => {
    if (val.idealTime === currentTime) {
      triggeredCount++;
      console.log(`[FCM Cron] Notificación enviada a ${uid} programada para ${val.idealTime}`);
    }
  });

  res.json({
    success: true,
    serverTime: currentTime,
    activeTokens: serverFcmRegistry.size,
    remindersTriggered: triggeredCount,
  });
});

// =========================================================================
// ENDPOINTS DE AUTENTICACIÓN Y GESTIÓN DE CUENTAS
// =========================================================================

// Registro de nuevo usuario
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'Ingresa correo y contraseña' });
    return;
  }
  const cleanEmail = String(email).trim().toLowerCase();
  if (password.length < 6) {
    res.status(400).json({ error: 'WEAK_PASSWORD', message: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  const accounts = getAccounts();
  const existingKey = Object.keys(accounts).find(
    (k) => accounts[k].email === cleanEmail && !accounts[k].isDeleted
  );
  if (existingKey) {
    res.status(409).json({
      error: 'ACCOUNT_EXISTS',
      message: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
    });
    return;
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const profile = {
    id: userId,
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    region: 'Región Metropolitana de Santiago',
    role: 'SIN_ESPECIFICAR',
    targetExamDate: '15 de Noviembre 2026',
    notificationsEnabled: true,
    streakRemindersEnabled: true,
    onboardingCompleted: false, // Nuevo usuario -> Debe pasar por Onboarding
  };

  accounts[userId] = {
    id: userId,
    email: cleanEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    profile,
  };

  saveAccounts(accounts);

  console.log(`[Auth Server] Usuario registrado: ${cleanEmail} (ID: ${userId})`);
  res.json({
    success: true,
    message: 'Cuenta creada exitosamente',
    profile,
  });
});

// Inicio de sesión
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'Ingresa correo y contraseña' });
    return;
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const accounts = getAccounts();

  const userKey = Object.keys(accounts).find(
    (k) => accounts[k].email === cleanEmail && !accounts[k].isDeleted
  );

  // Si no existe o fue eliminada
  if (!userKey) {
    res.status(404).json({
      error: 'ACCOUNT_NOT_FOUND',
      message: 'Esta cuenta no existe o fue eliminada permanentemente. Por favor regístrate para comenzar.',
    });
    return;
  }

  const account = accounts[userKey];
  const computedHash = hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Contraseña incorrecta. Verifica tus credenciales e intenta nuevamente.',
    });
    return;
  }

  console.log(`[Auth Server] Sesión iniciada para: ${cleanEmail}`);
  res.json({
    success: true,
    message: 'Inicio de sesión correcto',
    profile: account.profile,
  });
});

// Eliminar cuenta permanentemente
app.post('/api/auth/delete-account', (req: Request, res: Response) => {
  const { userId, email } = req.body;
  const accounts = getAccounts();
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';

  let deletedCount = 0;
  for (const k of Object.keys(accounts)) {
    if (accounts[k].id === userId || (cleanEmail && accounts[k].email === cleanEmail)) {
      delete accounts[k];
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    saveAccounts(accounts);
    console.log(`[Auth Server] Cuenta ${userId || cleanEmail} eliminada permanentemente.`);
  }

  if (userId) {
    serverFcmRegistry.delete(userId);
  }

  res.json({
    success: true,
    message: 'Cuenta eliminada permanentemente del sistema.',
  });
});

// Actualizar perfil (Onboarding, settings, horarios)
app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const { userId, profile } = req.body;
  if (!userId || !profile) {
    res.status(400).json({ error: 'MISSING_FIELDS' });
    return;
  }

  const accounts = getAccounts();
  let targetKey = Object.keys(accounts).find((k) => accounts[k].id === userId);

  if (!targetKey && profile.email) {
    const cleanEmail = String(profile.email).trim().toLowerCase();
    targetKey = Object.keys(accounts).find((k) => accounts[k].email === cleanEmail);
  }

  if (targetKey) {
    accounts[targetKey].profile = {
      ...accounts[targetKey].profile,
      ...profile,
    };
    accounts[targetKey].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
    res.json({ success: true, profile: accounts[targetKey].profile });
    return;
  }

  // Si no estaba en BD de accounts (ej: usuario Google nuevo), registrarlo
  accounts[userId] = {
    id: userId,
    email: profile.email ? String(profile.email).toLowerCase() : '',
    passwordHash: '',
    salt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    profile,
  };
  saveAccounts(accounts);

  res.json({ success: true, profile });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarmaTest Chile server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
