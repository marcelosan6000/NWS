# NeuroWave Studio Pro

**Sintetizador de audio terapéutico binaural e isocrónico de alta calidad**

> Motor profesional de síntesis de ondas cerebrales para meditación, relajación, concentración y terapias de bienestar.

## 🎯 Características

### 🔐 Autenticación & Control de Acceso
- ✅ Login con Email/Contraseña
- ✅ Autenticación social (Google, GitHub)
- ✅ Sistema de cuotas por usuario
- ✅ Límites diarios de descarga y duración
- ✅ Tracking de uso en Firestore

### 🎵 Síntesis de Audio
- ✅ **Binaural Beats**: Diferencia de frecuencia entre canales (L/R)
- ✅ **Isochronic Tones**: Pulsos rítmicos a frecuencia objetivo
- ✅ **10 Presets terapéuticos**: Delta, Theta, Alpha, Beta, Gamma, Solfeggio, Schumann, etc.
- ✅ **Frecuencias puras**: Solfeggio 528 Hz, Verdi A=432 Hz
- ✅ **Osciladores múltiples**: Control independiente de hasta 6 osciladores adicionales

### 🎛️ Control de Síntesis Avanzado
- ✅ **ADSR Envelope**: Attack, Decay, Sustain, Release
- ✅ **LFO Modulation**: Low Frequency Oscillator para movimiento dinámico
- ✅ **Filtro Paramétrico**: Paso bajo, paso alto, paso banda
- ✅ **EQ de 6 bandas**: Control de frecuencias individuales (60 Hz, 170 Hz, 350 Hz, 1 kHz, 3.5 kHz, 10 kHz)
- ✅ **Ruido terapéutico**: Rosa, marrón y blanco
- ✅ **Stereo Width**: Control de imagen estéreo

### 🎬 Generación & Renderizado
- ✅ **Renderizado por chunks**: Optimizado para duraciones largas (hasta 8 horas)
- ✅ **Crossfade entre chunks**: Eliminación de clicks y discontinuidades
- ✅ **Formatos de salida**: WAV (16-bit PCM sin pérdida) y MP3 (320 kbps)
- ✅ **Análisis LUFS**: Medidor de loudness EBU R128 simplificado
- ✅ **FFT en tiempo real**: Visualización espectral durante preview

### 👥 Modos de Interfaz
- ✅ **Modo Básico**: 6 presets terapéuticos para usuarios no técnicos
- ✅ **Modo Avanzado**: Control total de todos los parámetros
- ✅ **Preview en tiempo real**: 10 segundos con visualización FFT
- ✅ **Guía de voz**: Síntesis de texto a voz durante reproducción (preview)

### 📊 Gestión de Cuotas (Fase Testing)

**Plan Free (por defecto)**
- Máximo 1 hora por archivo
- 3 descargas por día
- 180 minutos totales por día
- 0.5 GB almacenamiento
- 30 archivos por mes

**Plan Pro (futuro - con pasarela de pagos)**
- Máximo 8 horas por archivo
- 50 descargas por día
- 1440 minutos totales por día
- 10 GB almacenamiento
- 500 archivos por mes

## 🏗️ Arquitectura

```
NWS/
├── index.html                      # HTML principal
├── css/
│   ├── base.css                   # Estilos base y temas
│   └── styles.css                 # Estilos componentes
├── js/
│   ├── config.js                  # Configuración global + Firebase
│   ├── firebase-auth.js           # Auth + Firestore integration [ES Module]
│   ├── state.js                   # Estado global y constantes
│   ├── utils.js                   # Funciones utilitarias
│   ├── audio-engine.js            # Web Audio API synthesis
│   ├── encoders.js                # Codificadores WAV/MP3
│   ├── render.js                  # Pipeline de renderizado
│   ├── presets.js                 # 10 presets terapéuticos
│   ├── ui-basic.js                # UI modo básico
│   ├── ui-advanced.js             # UI modo avanzado
│   └── main.js                    # Inicialización
├── firebase/
│   └── firestore.rules            # Reglas de seguridad Firestore
├── .env.example                   # Variables de entorno (ejemplo)
└── README.md                      # Este archivo
```

## 🚀 Instalación

### Requisitos
- Node.js 16+ (opcional, para development server)
- Cuenta Firebase con Auth y Firestore habilitados
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Setup Firebase

1. **Crear proyecto en Firebase Console**
   ```
   https://console.firebase.google.com
   ```

2. **Habilitar proveedores de autenticación**
   - Authentication → Sign-in method
   - Habilitar: Email/Password, Google, GitHub

3. **Configurar Firestore Database**
   - Firestore → Create Database
   - Modo producción con reglas personalizadas

4. **Copiar credenciales**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales Firebase
   ```

5. **Deployar reglas Firestore**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

### Desarrollo Local

```bash
# Con Python
python3 -m http.server 8000

# Con Node (http-server)
npx http-server

# Con Vite (recomendado)
npm install
npm run dev
```

Acceder a `http://localhost:8000` (o puerto configurado)

## 🎛️ Uso

### Modo Básico (Usuarios No Técnicos)

1. **Iniciar sesión** con Email, Google o GitHub
2. **Seleccionar preset** terapéutico (6 opciones predefinidas)
3. **Ajustar duración** (5 min - 2 horas)
4. **Elegir formato** (WAV sin pérdida o MP3 320 kbps)
5. **Preview** 10 segundos con visualización
6. **Generar** y descargar archivo

### Modo Avanzado (Usuarios Técnicos)

#### 1. Configuración Base
- Seleccionar tipo de tono: Isocrónico vs Binaural
- Frecuencia objetivo (0.5 - 40 Hz)
- Duración (1 min - 8 horas)

#### 2. Osciladores
- Frecuencia base (100 - 1000 Hz)
- Forma de onda: Seno, Triángulo, Cuadrada, Sierra
- Volumen principal
- Osciladores adicionales (hasta 6)

#### 3. Síntesis
- **ADSR**: Envolvente de amplitud
- **LFO**: Modulación a baja frecuencia
- Parámetros: Attack, Decay, Sustain, Release

#### 4. Procesamiento
- **Filtro**: Tipo (HP/LP/BP), frecuencia de corte, Q
- **EQ**: 6 bandas parametricas con ganancia individual
- **Ruido**: Rosa, marrón o blanco
- **Stereo Width**: Separación L/R

#### 5. Generación
- Preview en tiempo real con FFT
- Renderizado por chunks (optimizado)
- Análisis LUFS automático
- Descarga en WAV o MP3

## 📊 Presets Terapéuticos

| Preset | Hz | Categoría | Duración | Uso |
|--------|-----|-----------|----------|-----|
| 🌊 Delta | 2.0 | Sleep | 2h | Sueño profundo, descanso |
| 🧘 Theta | 6.0 | Meditation | 1h | Meditación, acceso intuitivo |
| ☀️ Alpha | 10.0 | Relaxation | 30m | Relajación, creatividad |
| ⚡ Beta | 18.0 | Focus | 30m | Concentración, productividad |
| 🚀 Gamma | 35.0 | Focus | 15m | Enfoque extremo, conciencia |
| 💖 Solfeggio 528 | 528 Hz | Healing | 30m | Sanación emocional |
| 🎼 Verdi 432 Hz | 432 Hz | Tuning | 30m | Armonía natural |
| 🌍 Schumann | 7.83 Hz | Grounding | 1h | Resonancia Tierra |
| 😴 Insomnio | 2→8 Hz | Sleep | 2h | Rampa descendente |
| 🎯 Deep Work | 25 Hz | Focus | 30m | Trabajo profundo |

## 🔒 Seguridad & Privacidad

### Firestore Rules
```
- Solo lectura/escritura para datos propios del usuario
- Quotas almacenadas en documento privado
- Sesiones vinculadas a UID del usuario
- Public presets solo lectura para autenticados
```

### Datos Almacenados
- Email y nombre (Firebase Auth)
- Preferencias de usuario
- Historial de descargas
- Uso de cuotas diarias
- Último renderizado

**No se almacenan**:
- Archivos de audio (se descargan directamente)
- IP addresses
- Datos de navegación
- Cookies de tracking

## 🐛 Debugging

### Console Logs
```javascript
// Estado actual
console.log(STATE);

// Usuario autenticado
console.log(STATE.user);

// Perfil Firestore
console.log(STATE.userProfile);

// Eventos
window.NW_EVENTS.on('auth:login', (user) => console.log('Login:', user));
```

### Problemas Comunes

**❌ Firebase no inicializa**
- Verificar variables en `js/config.js`
- Comprobar CORS en Firebase Console
- Limpiar cache del navegador

**❌ Audio cortado o con clicks**
- Aumentar `CHUNK_SECONDS` en `config.js`
- Reducir duración total
- Verificar crossfade en `mergeBuffersWithCrossfade()`

**❌ LUFS incorrecto**
- LUFS es aproximado (EBU R128 simplificado)
- Para medición exacta usar analizador profesional
- El pico (Peak) es más fiable

## 📈 Performance

- **Preview**: 10 segundos renderizado en tiempo real
- **Renderizado 1h WAV**: ~5-10 segundos (por chunks)
- **Renderizado 1h MP3**: ~10-15 segundos (encoding LAME.js)
- **Memoria máxima**: ~150 MB para 8 horas
- **Navegador mínimo**: Chrome 50+, Firefox 40+, Safari 11+

## 🔄 Mejoras Futuras

- [ ] Integración Stripe/MercadoPago
- [ ] Historial de sesiones guardadas
- [ ] Sincronización en la nube
- [ ] App móvil (React Native)
- [ ] Community presets compartidos
- [ ] Biofeedback en tiempo real
- [ ] Análisis detallado LUFS/THD
- [ ] Web Workers para rendering paralelo
- [ ] Service Workers para caché offline
- [ ] Modo colaborativo múltiples usuarios

## 📝 Licencia

MIT License - Libre para uso personal y comercial

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repo
2. Crear branch de feature (`git checkout -b feat/nueva-feature`)
3. Commit cambios (`git commit -am 'Add nueva feature'`)
4. Push a branch (`git push origin feat/nueva-feature`)
5. Abrir Pull Request

## 📧 Contacto & Soporte

- **Issues**: GitHub Issues
- **Email**: soporte@neurowave.studio (futuro)
- **Docs**: Wiki del repo

---

**Versión**: 1.0.0-beta  
**Última actualización**: Junio 2026  
**Estado**: En testing activo - Feedback bienvenido
