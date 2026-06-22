/**
 * Global State Management
 * Centralized reactive state for the entire app
 */

window.STATE = {
  // Auth
  user: null,
  userProfile: null,
  isAuthenticated: false,
  userMode: 'basic',  // 'basic' or 'advanced'

  // Audio Settings
  toneType: 'isochronic',  // 'isochronic' or 'binaural'
  targetFreq: 6.0,
  baseFreq: 432,
  waveform: 'sine',
  mainVol: -6,  // dB
  duration: 3600,  // seconds

  // ADSR Envelope
  attack: 15,
  decay: 5,
  sustain: 0.68,
  release: 18,

  // LFO
  lfo: {
    enabled: false,
    waveform: 'sine',
    freq: 0.06,
    depth: 0.07
  },

  // Filter
  filter: {
    enabled: false,
    type: 'lowpass',
    freq: 650,
    Q: 1.0
  },

  // EQ (6-band parametric)
  eq: {
    enabled: false,
    bands: [
      { freq: 60, gain: 0, Q: 1.0 },
      { freq: 170, gain: 0, Q: 1.0 },
      { freq: 350, gain: 0, Q: 1.0 },
      { freq: 1000, gain: 0, Q: 1.0 },
      { freq: 3500, gain: 0, Q: 1.0 },
      { freq: 10000, gain: 0, Q: 1.0 }
    ]
  },

  // Noise
  noise: {
    enabled: false,
    type: 'pink',  // 'pink', 'brown', 'white'
    vol: 0.16
  },

  stereoWidth: 0.70,

  // Voice Guidance
  voice: {
    enabled: false,
    script: '',
    vol: -6,
    speed: 0.90,
    voice: 'es-ES-ElviraNeural'
  },

  // Oscillators
  oscillators: [],

  // Session
  sessionName: 'Sesion_Terapeutica',
  outputFormat: 'wav',  // 'wav' or 'mp3'

  // Playback
  isPlaying: false,
  isRendering: false,
  audioContext: null,
  analyser: null,
  fftAnimId: null,

  // Quota Info
  quotaInfo: {
    downloads: 0,
    downloadMinutes: 0,
    maxDownloads: 3,
    maxDownloadMinutes: 180
  }
};

/**
 * Subscribe to state changes
 */
window.STATE_SUBSCRIBERS = {};

window.STATE.subscribe = function(key, callback) {
  if (!this.STATE_SUBSCRIBERS[key]) {
    this.STATE_SUBSCRIBERS[key] = [];
  }
  this.STATE_SUBSCRIBERS[key].push(callback);
};

window.STATE.notifySubscribers = function(key) {
  if (this.STATE_SUBSCRIBERS[key]) {
    this.STATE_SUBSCRIBERS[key].forEach(cb => cb(this[key]));
  }
};

/**
 * Constants
 */
window.SAMPLE_RATE = 44100;
window.CHANNELS = 2;
window.CHUNK_SECONDS = 60;