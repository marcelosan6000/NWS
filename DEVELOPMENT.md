# DESARROLLO & DEPLOYMENT

## Setup Local

### Requisitos
```bash
Node.js >= 16
npm >= 8
Git
```

### Instalación
```bash
git clone https://github.com/marcelosan6000/NWS.git
cd NWS

# Instalar dependencias (opcional, solo si usas build tools)
npm install

# Copy configuración
cp .env.example .env.local
```

### Variables de Entorno (`.env.local`)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=neurowave-studio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=neurowave-studio
VITE_FIREBASE_STORAGE_BUCKET=neurowave-studio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

VITE_MAX_USERS=50
VITE_ENABLE_QUOTAS=true
VITE_ENVIRONMENT=development
```

### Servidor Local

**Opción 1: Python (sin dependencias)**
```bash
python3 -m http.server 8000
```

**Opción 2: Node.js (http-server)**
```bash
npm install -g http-server
http-server
```

**Opción 3: Vite (recomendado para desarrollo)**
```bash
npm install -D vite
npm run dev
```

Acceder a `http://localhost:8000` (o puerto configurado)

## Firebase Setup

### 1. Crear Proyecto
1. Ir a https://console.firebase.google.com
2. Crear nuevo proyecto
3. Nombrar: "neurowave-studio"
4. Habilitar Analytics (opcional)

### 2. Configurar Authentication

```
Authentication → Sign-in method
```

Habilitar:
- ✅ Email/Password
- ✅ Google
- ✅ GitHub (requiere OAuth app)

**Para GitHub OAuth:**
1. Settings → Developer settings → OAuth Apps → New OAuth App
2. Application name: "NeuroWave Studio"
3. Homepage URL: `https://neurowave.studio` (o localhost:8000 para testing)
4. Authorization callback URL: `https://neurowave-studio.firebaseapp.com/__/auth/handler`
5. Copiar Client ID y Client Secret
6. Firebase Console → GitHub → Pegar credenciales

### 3. Configurar Firestore

```
Firestore Database → Create Database
```

Opciones:
- Location: `us-central1`
- Modo: **Production mode** (usaremos reglas personalizadas)

### 4. Deployar Reglas Firestore

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Select project
firebase use neurowave-studio

# Deploy rules
firebase deploy --only firestore:rules
```

**Contenido de `firebase/firestore.rules`:**

Ya está incluido en el repo. Verifica que esté correcto:

```
- users/{userId}: Solo el usuario puede acceder a sus datos
- sessions/{sessionId}: Solo el propietario puede leer/escribir
- presets/{presetId}: Lectura pública para autenticados
```

## Estructura de Datos Firestore

### Collection: `users`
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "Juan Pérez",
  "photoURL": "https://...",
  "plan": "free",
  "createdAt": "2026-06-22T10:30:00Z",
  "quotaUsedToday": {
    "downloads": 1,
    "downloadMinutes": 45,
    "renderMinutes": 50
  },
  "quotaResetAt": "2026-06-23T00:00:00Z",
  "totalDownloads": 5,
  "totalRenderMinutes": 250,
  "lastRenderAt": "2026-06-22T10:30:00Z",
  "settings": {
    "theme": "dark",
    "mode": "basic",
    "notifications": true
  }
}
```

### Collection: `sessions`
```json
{
  "uid": "user123",
  "sessionName": "Meditación 2026-06-22",
  "toneType": "isochronic",
  "targetFreq": 6.0,
  "duration": 3600,
  "format": "wav",
  "fileSize": 31457280,
  "lufs": -20.5,
  "createdAt": "2026-06-22T10:30:00Z",
  "downloadCount": 2,
  "config": {
    "baseFreq": 432,
    "waveform": "sine",
    "mainVol": -6,
    "attack": 15,
    "decay": 5,
    "sustain": 0.68,
    "release": 18
  }
}
```

### Collection: `presets` (opcional)
```json
{
  "id": "theta",
  "name": "Theta · Meditación",
  "description": "Ondas theta para meditación profunda",
  "category": "meditation",
  "config": { ... },
  "createdBy": "system",
  "public": true,
  "downloads": 42
}
```

## Testing

### Usuarios de Testing

**Email/Password:**
```
email: test@neurowave.studio
password: TestPass123!
```

**Google Account:**
- Usar cuenta Google existente
- Primer login crea documento automáticamente

**GitHub Account:**
- Usar cuenta GitHub existente
- Requiere OAuth app configurada

### Test Cases

**Autenticación:**
- [ ] Registro con email
- [ ] Login con email
- [ ] Login con Google
- [ ] Login con GitHub
- [ ] Logout
- [ ] Persistencia de sesión

**Audio Synthesis:**
- [ ] Preview (10 seg) - Isochronic
- [ ] Preview (10 seg) - Binaural
- [ ] Render 1 min WAV
- [ ] Render 1 hora MP3
- [ ] Render con EQ
- [ ] Render con LFO
- [ ] Render con ruido rosa

**Quotas:**
- [ ] Rechaza duraciones > 1h (free)
- [ ] Rechaza 4ta descarga/día (free)
- [ ] Rechaza 181+ min/día (free)
- [ ] Reset a medianoche
- [ ] Actualización correcta en Firestore

**UI:**
- [ ] Modo básico oculta controles avanzados
- [ ] Modo avanzado muestra todos los parámetros
- [ ] Preset carga valores correctos
- [ ] Slider actualiza valores en tiempo real
- [ ] LUFS se muestra después de generar

## Deployment

### Firebase Hosting

```bash
# Build (si usas Vite)
npm run build

# Deploy
firebase deploy --only hosting
```

### GitHub Pages

```bash
# Build
npm run build

# Push a gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Vercel

```bash
vercel --prod
```

## Monitoreo & Logging

### Sentry (Error Tracking)

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: APP_CONFIG.app.environment,
  tracesSampleRate: 1.0
});
```

### Google Analytics

```javascript
// Enable in config.js
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
```

### Firestore Monitoring

```
Firebase Console → Firestore → Quotas
- Read operations
- Write operations
- Delete operations
- Database size
```

## Troubleshooting

### Firebase Auth falla
**Problema**: "FirebaseError: Firebase App named '[DEFAULT]' already exists"

**Solución**:
```javascript
// Usar getInstance en lugar de initializeApp
const app = getApp();
const auth = getAuth(app);
```

### CORS Error
**Problema**: "Access-Control-Allow-Origin"

**Solución**:
1. Firebase Console → Settings → Authorized domains
2. Agregar dominio actual
3. Para localhost: agregar `localhost:8000`

### Web Audio no funciona
**Problema**: "NotSupportedError: The operation is not supported"

**Solución**:
- Usar HTTPS en producción
- Localhost OK en desarrollo
- Algunos navegadores requieren user gesture para AudioContext

### Renderizado lento
**Problema**: UI se congela durante render

**Solución**:
1. Aumentar `CHUNK_SECONDS` (máximo 120)
2. Reducir `CHANNELS` (pero reduce calidad)
3. Implementar Web Workers (futuro)

## Performance Optimization

### Bundle Size
```bash
webbundle analyze
```

Actual:
- HTML: ~40 KB
- CSS: ~8 KB
- JS: ~180 KB (modular, lazy-loaded)
- LameJS: ~150 KB (cargar bajo demanda)

### Caché
```javascript
// Service Worker para offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Lazy Loading de Firebase
```javascript
// Cargar Firebase solo si está autenticado
const { initFirebase } = await import('./firebase-auth.js');
```

## Roadmap

### v1.1.0 (Próximas 2 semanas)
- [ ] Sistema de pagos Stripe
- [ ] Historial de sesiones
- [ ] Sincronización en nube

### v1.2.0 (1 mes)
- [ ] Web Workers para rendering paralelo
- [ ] Service Workers para offline
- [ ] Community presets compartidos

### v2.0.0 (3 meses)
- [ ] App móvil (React Native)
- [ ] Biofeedback en tiempo real
- [ ] Integraciones con wearables

---

**Última actualización**: Junio 2026
