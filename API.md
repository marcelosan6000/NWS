# API Reference

## State Management

### Acceder al estado global
```javascript
console.log(STATE); // Objeto global
```

### State Properties

```javascript
// Auth
STATE.user              // Firebase User object
STATE.userProfile       // Firestore user document
STATE.isAuthenticated   // Boolean
STATE.userMode          // 'basic' | 'advanced'

// Audio
STATE.toneType          // 'isochronic' | 'binaural'
STATE.targetFreq        // 0.5 - 40 Hz
STATE.baseFreq          // 100 - 1000 Hz
STATE.waveform          // 'sine' | 'triangle' | 'square' | 'sawtooth'
STATE.mainVol           // dB (-40 to 0)
STATE.duration          // Seconds (60 to 28800)

// Synthesis
STATE.attack            // Seconds (0 - 60)
STATE.decay             // Seconds (0 - 30)
STATE.sustain           // 0 - 1
STATE.release           // Seconds (0 - 60)

// Effects
STATE.lfo               // { enabled, waveform, freq, depth }
STATE.filter            // { enabled, type, freq, Q }
STATE.eq                // { enabled, bands: [...] }
STATE.noise             // { enabled, type, vol }
STATE.stereoWidth       // 0 - 1

// Voice
STATE.voice             // { enabled, script, vol, speed, voice }

// Rendering
STATE.isPlaying         // Boolean
STATE.isRendering       // Boolean
STATE.audioContext      // AudioContext instance
STATE.analyser          // AnalyserNode

// Session
STATE.sessionName       // String
STATE.outputFormat      // 'wav' | 'mp3'
STATE.oscillators       // Array<{ id, freq, waveform, vol }>
```

## Audio Engine API

### buildAudioGraph(ctx, duration, startTime, destination)

Constituye el grafo completo de síntesis de audio.

```javascript
const ctx = new OfflineAudioContext(2, 44100 * 60, 44100);
const { masterGain, output } = buildAudioGraph(ctx, 60, 0, ctx.destination);

// ctx es necesario para crear osciladores y filtros
// duration en segundos
// startTime para offline rendering (generalmente 0)
// destination es el nodo a conectar (por defecto ctx.destination)
```

### renderChunked(totalDuration, onProgress)

Renderiza audio en chunks para duraciones largas.

```javascript
await renderChunked(3600, ({ percent, chunk, totalChunks, elapsed, eta }) => {
  console.log(`Chunk ${chunk}/${totalChunks}: ${percent.toFixed(1)}%`);
});
```

**Returns**: Promise<AudioBuffer>

### stopAudio()

Detiene reproducción y limpia contexto de audio.

```javascript
stopAudio();
```

## Encoding API

### audioBufferToWav(buffer)

Convierte AudioBuffer a blob WAV 16-bit PCM.

```javascript
const buffer = await ctx.startRendering();
const blob = audioBufferToWav(buffer);
const url = URL.createObjectURL(blob);
```

**Returns**: Blob (audio/wav)

### audioBufferToMp3(buffer)

Convierte AudioBuffer a blob MP3 320 kbps.

```javascript
const blob = audioBufferToMp3(buffer);
// Requiere lamejs cargado desde CDN
```

**Returns**: Blob (audio/mp3)

## Rendering API

### generateAudio()

Pipeline completo: validación, renderizado, encoding, descarga.

```javascript
await generateAudio();
// Actualiza STATE.isRendering
// Verifica quotas
// Muestra progreso
// Descarga archivo
```

### previewAudio()

Renderiza 10 segundos con FFT en tiempo real.

```javascript
await previewAudio();
// Abre AudioContext
// Crea Analyser para FFT
// Sintetiza 10 segundos
// Inicia FFT animation
```

### stopAudioPlayback()

Detiene preview/rendering en progreso.

```javascript
stopAudioPlayback();
```

## Preset API

### loadPreset(presetId)

Carga preset predefinido en STATE.

```javascript
loadPreset('theta');  // Carga Theta - Meditación
loadPreset('alpha');  // Carga Alpha - Relajación
loadPreset('gamma');  // Carga Gamma - Enfoque

// IDs disponibles:
// 'delta', 'theta', 'alpha', 'beta', 'gamma',
// 'solfeggio528', 'solfeggio432', 'schumann', 'sleep', 'focus'
```

**Returns**: Boolean (true si se cargó exitosamente)

### getPresetsByCategory(category)

Obtiene presets de una categoría.

```javascript
const meditationPresets = getPresetsByCategory('meditation');
// Returns: Array<Preset>
```

### getAllCategories()

Obtiene todas las categorías disponibles.

```javascript
const cats = getAllCategories();
// Returns: ['sleep', 'meditation', 'relaxation', 'focus', 'healing', 'tuning', 'grounding']
```

## Firebase Auth API

### initFirebase()

Inicializa Firebase Auth y Firestore.

```javascript
await initFirebase();
// Configura listeners para cambios de auth state
```

### registerWithEmail(email, password)

Registra nuevo usuario con email.

```javascript
const result = await registerWithEmail('user@example.com', 'password123');
if (result.success) {
  console.log('User:', result.user);
} else {
  console.error('Error:', result.error);
}
```

**Returns**: `{ success: boolean, user?: User, error?: string }`

### loginWithEmail(email, password)

Inicia sesión con email.

```javascript
const result = await loginWithEmail('user@example.com', 'password123');
```

### loginWithGoogle()

Inicia sesión con Google.

```javascript
const result = await loginWithGoogle();
```

### loginWithGithub()

Inicia sesión con GitHub.

```javascript
const result = await loginWithGithub();
```

### logout()

Cierra sesión actual.

```javascript
await logout();
```

### getCurrentUser()

Obtiene usuario autenticado actual.

```javascript
const user = getCurrentUser();
if (user) {
  console.log(user.email);
}
```

**Returns**: User | null

### getUserProfile()

Obtiene perfil Firestore del usuario actual.

```javascript
const profile = await getUserProfile();
console.log(profile.plan);  // 'free' o 'pro'
console.log(profile.quotaUsedToday);
```

**Returns**: Promise<Object | null>

### canUserRender(durationSeconds)

Verifica si usuario puede renderizar con esa duración.

```javascript
const check = await canUserRender(3600);
if (check.allowed) {
  // Proceder con rendering
} else {
  console.error('Razón:', check.reason);
  // 'duration_too_long' | 'daily_downloads_exceeded' | 'daily_minutes_exceeded'
}
```

**Returns**: Promise<{ allowed: boolean, reason?: string }>

### updateQuotaUsage(downloads, downloadMinutes)

Actualiza uso de cuota de usuario.

```javascript
await updateQuotaUsage(1, 60);  // 1 descarga, 60 minutos
```

**Returns**: Promise<boolean>

## Utility Functions

### dbToLinear(db)

Convierte dB a amplitud lineal.

```javascript
dbToLinear(-6);   // 0.501...
dbToLinear(0);    // 1
dbToLinear(-20);  // 0.1
```

### formatDuration(seconds)

Formatea segundos a HH:MM:SS.

```javascript
formatDuration(3661);  // '01:01:01'
formatDuration(60);    // '00:01:00'
```

### calculateLUFS(buffer)

Calcula LUFS (loudness) del buffer.

```javascript
const lufs = calculateLUFS(audioBuffer);
console.log(lufs.integrated);  // LUFS integrado
console.log(lufs.peak);        // Pico en dB
console.log(lufs.dynamicRange); // Rango dinámico
```

**Returns**: `{ integrated: number, peak: number, dynamicRange: number }`

### sanitizeFilename(name)

Sanitiza nombre para filename seguro.

```javascript
sanitizeFilename('Mi Terapia 🎵');  // 'Mi_Terapia____'
```

## Event System

### Subscribirse a eventos

```javascript
window.NW_EVENTS.on('auth:login', (user) => {
  console.log('User logged in:', user.email);
});

window.NW_EVENTS.on('auth:logout', () => {
  console.log('User logged out');
});

window.NW_EVENTS.on('preset:loaded', (preset) => {
  console.log('Preset:', preset.name);
});
```

### Eventos disponibles

- `auth:login` - Emitido cuando usuario inicia sesión
- `auth:logout` - Emitido cuando usuario cierra sesión
- `preset:loaded` - Emitido cuando preset se carga
- `render:start` - Emitido cuando comienza renderizado
- `render:complete` - Emitido cuando renderizado termina

## Configuration

### APP_CONFIG

Objeto global de configuración.

```javascript
APP_CONFIG.firebase      // Credenciales Firebase
APP_CONFIG.app          // Nombre, versión, ambiente
APP_CONFIG.features     // Feature flags
APP_CONFIG.quotas       // Límites por plan
APP_CONFIG.audio        // Sample rate, canales, etc
APP_CONFIG.presets      // Lista de presets
APP_CONFIG.ui           // Configuración UI
APP_CONFIG.errors       // Mensajes de error
```

Modificar en runtime:

```javascript
APP_CONFIG.features.quotaEnforcement = false;  // Desactivar quotas
APP_CONFIG.ui.previewDuration = 5;             // 5 segundos preview
APP_CONFIG.audio.sampleRate = 48000;           // Cambiar sample rate
```

## Mode Switching

### Cambiar entre Modo Básico y Avanzado

```javascript
// Mostrar Modo Básico
document.getElementById('basicMode').style.display = 'grid';
document.getElementById('advancedMode').style.display = 'none';

// Mostrar Modo Avanzado
document.getElementById('basicMode').style.display = 'none';
document.getElementById('advancedMode').style.display = 'grid';
```

O usar botones de toggle:

```html
<button onclick="toggleMode('basic')">Modo Básico</button>
<button onclick="toggleMode('advanced')">Modo Avanzado</button>
```

---

**Última actualización**: Junio 2026
