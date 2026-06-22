/**
 * Therapeutic Presets
 * Pre-configured therapy sessions
 */

export const THERAPEUTIC_PRESETS = {
  delta: {
    id: 'delta',
    name: '🌙 Delta · Sueño Profundo',
    description: 'Ondas delta (0.5-4 Hz) para sueño reparador profundo',
    category: 'sleep',
    config: {
      toneType: 'isochronic',
      targetFreq: 2.0,
      baseFreq: 432,
      duration: 7200,
      waveform: 'sine',
      mainVol: -6,
      attack: 30,
      decay: 10,
      sustain: 0.8,
      release: 30,
      noise: { enabled: true, type: 'brown', vol: 0.12 }
    }
  },

  theta: {
    id: 'theta',
    name: '🧘 Theta · Meditación',
    description: 'Ondas theta (4-8 Hz) para meditación profunda y acceso a intuición',
    category: 'meditation',
    config: {
      toneType: 'isochronic',
      targetFreq: 6.0,
      baseFreq: 432,
      duration: 3600,
      waveform: 'sine',
      mainVol: -6,
      attack: 15,
      decay: 5,
      sustain: 0.68,
      release: 18,
      lfo: { enabled: true, waveform: 'sine', freq: 0.06, depth: 0.07 }
    }
  },

  alpha: {
    id: 'alpha',
    name: '☀️ Alpha · Relajación',
    description: 'Ondas alfa (8-13 Hz) para relajación consciente y creatividad',
    category: 'relaxation',
    config: {
      toneType: 'binaural',
      targetFreq: 10.0,
      baseFreq: 440,
      duration: 1800,
      waveform: 'sine',
      mainVol: -6,
      attack: 10,
      decay: 3,
      sustain: 0.75,
      release: 10,
      noise: { enabled: true, type: 'pink', vol: 0.10 }
    }
  },

  beta: {
    id: 'beta',
    name: '⚡ Beta · Concentración',
    description: 'Ondas beta (13-30 Hz) para enfoque mental y productividad',
    category: 'focus',
    config: {
      toneType: 'binaural',
      targetFreq: 18.0,
      baseFreq: 440,
      duration: 1800,
      waveform: 'triangle',
      mainVol: -8,
      attack: 5,
      decay: 2,
      sustain: 0.85,
      release: 5,
      noise: { enabled: false }
    }
  },

  gamma: {
    id: 'gamma',
    name: '🚀 Gamma · Enfoque Extremo',
    description: 'Ondas gamma (30-40 Hz) para máxima concentración y conciencia',
    category: 'focus',
    config: {
      toneType: 'binaural',
      targetFreq: 35.0,
      baseFreq: 440,
      duration: 900,
      waveform: 'sine',
      mainVol: -10,
      attack: 3,
      decay: 1,
      sustain: 0.9,
      release: 3
    }
  },

  solfeggio528: {
    id: 'solfeggio528',
    name: '💚 Solfeggio 528 Hz · Sanación',
    description: 'Frecuencia Solfeggio 528 Hz ("Frecuencia del amor") para sanación emocional',
    category: 'healing',
    config: {
      toneType: 'isochronic',
      targetFreq: 0,
      baseFreq: 528,
      duration: 1800,
      waveform: 'sine',
      mainVol: -6,
      attack: 20,
      decay: 8,
      sustain: 0.7,
      release: 20
    }
  },

  solfeggio432: {
    id: 'solfeggio432',
    name: '🎼 Verdi A=432 Hz · Armonía',
    description: 'Afinación Verdi 432 Hz resonante con la naturaleza',
    category: 'tuning',
    config: {
      toneType: 'isochronic',
      targetFreq: 0,
      baseFreq: 432,
      duration: 1800,
      waveform: 'sine',
      mainVol: -6,
      attack: 20,
      decay: 8,
      sustain: 0.7,
      release: 20
    }
  },

  schumann: {
    id: 'schumann',
    name: '🌍 Schumann 7.83 Hz · Tierra',
    description: 'Resonancia Schumann del planeta Tierra para sincronización natural',
    category: 'grounding',
    config: {
      toneType: 'isochronic',
      targetFreq: 7.83,
      baseFreq: 432,
      duration: 3600,
      waveform: 'sine',
      mainVol: -6,
      attack: 15,
      decay: 5,
      sustain: 0.7,
      release: 15,
      noise: { enabled: true, type: 'pink', vol: 0.08 }
    }
  },

  sleep: {
    id: 'sleep',
    name: '😴 Insomnio · Rampa Descendente',
    description: 'Rampa de frecuencia descendente para inducir sueño gradualmente',
    category: 'sleep',
    config: {
      toneType: 'isochronic',
      targetFreq: 2.0,  // Rampa de 8 Hz a 2 Hz
      baseFreq: 432,
      duration: 7200,
      waveform: 'sine',
      mainVol: -6,
      attack: 40,
      decay: 20,
      sustain: 0.75,
      release: 40,
      noise: { enabled: true, type: 'brown', vol: 0.15 }
    }
  },

  focus: {
    id: 'focus',
    name: '🎯 Deep Work · 15-40 Hz',
    description: 'Rango beta-gamma para trabajo profundo y resolución de problemas',
    category: 'focus',
    config: {
      toneType: 'binaural',
      targetFreq: 25.0,
      baseFreq: 440,
      duration: 1800,
      waveform: 'triangle',
      mainVol: -8,
      attack: 5,
      decay: 2,
      sustain: 0.85,
      release: 5,
      lfo: { enabled: true, waveform: 'sine', freq: 0.1, depth: 0.05 }
    }
  }
};

/**
 * Load a preset into current state
 */
export function loadPreset(presetId) {
  const preset = THERAPEUTIC_PRESETS[presetId];
  if (!preset) return false;

  const config = preset.config;
  STATE.toneType = config.toneType;
  STATE.targetFreq = config.targetFreq;
  STATE.baseFreq = config.baseFreq;
  STATE.duration = config.duration;
  STATE.waveform = config.waveform;
  STATE.mainVol = config.mainVol;
  STATE.attack = config.attack;
  STATE.decay = config.decay;
  STATE.sustain = config.sustain;
  STATE.release = config.release;

  if (config.lfo) {
    STATE.lfo = { ...STATE.lfo, ...config.lfo };
  }
  if (config.noise) {
    STATE.noise = { ...STATE.noise, ...config.noise };
  }

  // Notify UI to update
  window.NW_EVENTS.emit('preset:loaded', preset);

  return true;
}

/**
 * Get all presets by category
 */
export function getPresetsByCategory(category) {
  return Object.values(THERAPEUTIC_PRESETS).filter(p => p.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories() {
  const categories = new Set();
  Object.values(THERAPEUTIC_PRESETS).forEach(p => categories.add(p.category));
  return Array.from(categories);
}