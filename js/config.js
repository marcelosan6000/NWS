/**
 * Global Configuration
 * Centralized settings for Firebase, quotas, and app behavior
 */

window.APP_CONFIG = {
  // Firebase Configuration (set from .env in production)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC_placeholder',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'neurowave-studio.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'neurowave-studio',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'neurowave-studio.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123def456'
  },

  // App Configuration
  app: {
    name: 'NeuroWave Studio Pro',
    version: '1.0.0-beta',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    maxUsers: parseInt(import.meta.env.VITE_MAX_USERS || '50')
  },

  // Feature Flags
  features: {
    quotaEnforcement: import.meta.env.VITE_ENABLE_QUOTAS === 'true' || true,
    analyticsTracking: true,
    voiceGuidance: true,
    presetSync: true
  },

  // Quotas (Testing Phase)
  quotas: {
    free: {
      maxDurationPerFile: 3600,        // 1 hour
      dailyDownloads: 3,
      dailyDownloadMinutes: 180,       // 3 hours total
      maxConcurrentRenders: 1,
      storageGB: 0.5,
      maxFilesPerMonth: 30
    },
    pro: {
      maxDurationPerFile: 28800,       // 8 hours
      dailyDownloads: 50,
      dailyDownloadMinutes: 1440,      // 24 hours total
      maxConcurrentRenders: 3,
      storageGB: 10,
      maxFilesPerMonth: 500
    }
  },

  // Audio Configuration
  audio: {
    sampleRate: 44100,
    channels: 2,
    bitDepth: 16,
    defaultWaveform: 'sine',
    defaultVolume: -6,  // dB
    defaultDuration: 3600  // 1 hour
  },

  // Presets
  presets: [
    { id: 'delta', name: 'Delta · Sueño Profundo', freq: 2.0, duration: 7200, category: 'sleep' },
    { id: 'theta', name: 'Theta · Meditación', freq: 6.0, duration: 3600, category: 'meditation' },
    { id: 'alpha', name: 'Alpha · Relajación', freq: 10.0, duration: 1800, category: 'relaxation' },
    { id: 'beta', name: 'Beta · Concentración', freq: 18.0, duration: 1800, category: 'focus' },
    { id: 'gamma', name: 'Gamma · Enfoque', freq: 35.0, duration: 900, category: 'focus' },
    { id: 'solfeggio528', name: 'Solfeggio 528 Hz', freq: 0, baseFreq: 528, duration: 1800, category: 'healing' },
    { id: 'solfeggio432', name: 'Verdi 432 Hz', freq: 0, baseFreq: 432, duration: 1800, category: 'tuning' },
    { id: 'schumann', name: 'Schumann 7.83 Hz', freq: 7.83, duration: 3600, category: 'grounding' },
    { id: 'sleep', name: 'Insomnio · Rampa', freq: 'ramp', duration: 7200, category: 'sleep' },
    { id: 'focus', name: 'Deep Work 15-40 Hz', freq: 'range', duration: 1800, category: 'focus' }
  ],

  // UI Configuration
  ui: {
    defaultMode: 'basic',  // 'basic' or 'advanced'
    previewDuration: 10,
    chunkSize: 60,  // seconds
    fftSize: 2048
  },

  // Error Messages
  errors: {
    quotaExceeded: 'Has alcanzado tu límite de cuota para hoy.',
    durationTooLong: 'La duración excede el máximo permitido.',
    authRequired: 'Debes iniciar sesión para usar esta función.',
    renderInProgress: 'Un renderizado ya está en progreso.',
    networkError: 'Error de conexión. Intenta de nuevo.'
  }
};