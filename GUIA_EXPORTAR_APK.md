# 📱 Guía Oficial: Cómo Convertir FarmaTest Chile (PWA) a un APK Nativo para Android

Esta aplicación ha sido desarrollada con los estándares **Progressive Web App (PWA)** y **Mobile-First**. Esto te permite distribuirla tanto por navegador web como convertirla en una aplicación instalable `.apk` o `.aab` (Android App Bundle) para subirla a Google Play Store o compartirla directamente con tus alumnos.

A continuación tienes los dos métodos estándar recomendados por Google:

---

## Método 1 (El más rápido y recomendado por Google): TWA con PWABuilder (Sin instalar Android Studio)

Las **Trusted Web Activities (TWA)** son la tecnología nativa que Google utiliza para permitir que una PWA corra como app Android pura con rendimiento del 100%, pantalla completa, sin barra de URL y con actualizaciones automáticas.

### Pasos:
1. **Despliega tu app web**:
   - Una vez desplegada tu app en la web (obtendrás una URL HTTPS como `https://tufarmatest.com` o la URL de Cloud Run de AI Studio).
2. **Entra a PWABuilder**:
   - Ve a [pwabuilder.com](https://www.pwabuilder.com/).
   - Pega la URL de tu aplicación y haz clic en **Start**.
3. **Genera el paquete Android**:
   - PWABuilder verificará el `manifest.webmanifest` que ya dejamos configurado en la app.
   - En la sección **Android**, pulsa **Generate Package**.
   - Configura:
     - *Package ID*: ej. `com.farmatest.chile`
     - *App Name*: FarmaTest Chile
     - *Splash Screen Color*: `#0f172a` (azul oscuro) o `#059669` (verde farmacia)
     - *Signing Key*: Elige que genere una nueva clave de firma para ti.
4. **Descarga el ZIP**:
   - Descargarás un archivo comprimido que contiene:
     - `app-release-unsigned.apk` / `app-release-signed.apk` (para instalar directamente en teléfonos Android).
     - `app-release.aab` (el archivo que subes directamente a la consola de Google Play Store).
     - `assetlinks.json` (un archivito para colocar en tu dominio para verificar propiedad ante Google).

¡Listo! Cualquier cambio que hagas en tu código web se actualizará automáticamente en la app del teléfono de los usuarios sin que tengan que descargar una nueva versión del APK.

---

## Método 2: Capacitor de Ionic (Para integrar Google AdMob y Google Play Billing Nativos)

Si deseas compilar el APK en tu computadora con Android Studio y agregar plugins nativos de AdMob o notificaciones push locales:

### Pasos:
1. En la raíz de tu proyecto, instala Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Inicializa Capacitor:
   ```bash
   npx cap init "FarmaTest Chile" com.farmatest.chile --web-dir dist
   ```
3. Compila la app web:
   ```bash
   npm run build
   ```
4. Agrega la plataforma Android:
   ```bash
   npx cap add android
   ```
5. Sincroniza los archivos:
   ```bash
   npx cap sync
   ```
6. Abre el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
7. En Android Studio, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 💡 Ventajas de este Enfoque
- **Un solo código**: Mantienes una sola base de código para web, Android (APK) y Mac/iOS.
- **Microbanners y Rewarded Ads funcionales**: En la app web ya tienes simulado el sistema de rewarded ads para que la experiencia de monetización esté lista desde el día 1.
