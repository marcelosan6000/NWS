/**
 * Advanced Mode UI
 * Full control over all parameters
 */

import { generateAudio, previewAudio, stopAudioPlayback } from './render.js';

export function initAdvancedMode() {
  setupOscillators();
  setupADSR();
  setupFilters();
  setupEQ();
  setupNoise();
  setupLFO();
  setupEventListeners();
}

function setupOscillators() {
  const container = document.getElementById('oscillatorsList');
  if (!container) return;

  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('osc-freq')) {
      const id = parseInt(e.target.dataset.oscId);
      const osc = STATE.oscillators.find(o => o.id === id);
      if (osc) osc.freq = parseFloat(e.target.value);
    } else if (e.target.classList.contains('osc-waveform')) {
      const id = parseInt(e.target.dataset.oscId);
      const osc = STATE.oscillators.find(o => o.id === id);
      if (osc) osc.waveform = e.target.value;
    } else if (e.target.classList.contains('osc-vol')) {
      const id = parseInt(e.target.dataset.oscId);
      const osc = STATE.oscillators.find(o => o.id === id);
      if (osc) osc.vol = parseFloat(e.target.value);
    }
  });
}

function setupADSR() {
  const controls = {
    attack: document.getElementById('adsr-attack'),
    decay: document.getElementById('adsr-decay'),
    sustain: document.getElementById('adsr-sustain'),
    release: document.getElementById('adsr-release')
  };

  Object.entries(controls).forEach(([key, el]) => {
    if (el) {
      el.addEventListener('input', (e) => {
        STATE[key] = parseFloat(e.target.value);
        updateADSRDisplay(key, e.target.value);
      });
    }
  });
}

function setupFilters() {
  const filterEnabled = document.getElementById('filterEnabled');
  const filterType = document.getElementById('filterType');
  const filterFreq = document.getElementById('filterFreq');
  const filterQ = document.getElementById('filterQ');

  if (filterEnabled) {
    filterEnabled.addEventListener('change', (e) => {
      STATE.filter.enabled = e.target.checked;
    });
  }

  if (filterType) {
    filterType.addEventListener('change', (e) => {
      STATE.filter.type = e.target.value;
    });
  }

  if (filterFreq) {
    filterFreq.addEventListener('input', (e) => {
      STATE.filter.freq = parseFloat(e.target.value);
      document.getElementById('filterFreqValue').textContent = e.target.value + ' Hz';
    });
  }

  if (filterQ) {
    filterQ.addEventListener('input', (e) => {
      STATE.filter.Q = parseFloat(e.target.value);
      document.getElementById('filterQValue').textContent = e.target.value;
    });
  }
}

function setupEQ() {
  const eqEnabled = document.getElementById('eqEnabled');
  if (eqEnabled) {
    eqEnabled.addEventListener('change', (e) => {
      STATE.eq.enabled = e.target.checked;
    });
  }

  const eqBandsContainer = document.getElementById('eqBands');
  if (eqBandsContainer) {
    eqBandsContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('eq-slider')) {
        const bandIdx = parseInt(e.target.dataset.bandIdx);
        const prop = e.target.dataset.prop;
        const value = parseFloat(e.target.value);
        STATE.eq.bands[bandIdx][prop] = value;
        document.getElementById(`eqBandValue${bandIdx}`).textContent = 
          `${value > 0 ? '+' : ''}${value.toFixed(1)}dB`;
      }
    });
  }
}

function setupNoise() {
  const noiseEnabled = document.getElementById('noiseEnabled');
  const noiseType = document.getElementById('noiseType');
  const noiseVol = document.getElementById('noiseVol');

  if (noiseEnabled) {
    noiseEnabled.addEventListener('change', (e) => {
      STATE.noise.enabled = e.target.checked;
    });
  }

  if (noiseType) {
    noiseType.addEventListener('change', (e) => {
      STATE.noise.type = e.target.value;
    });
  }

  if (noiseVol) {
    noiseVol.addEventListener('input', (e) => {
      STATE.noise.vol = parseFloat(e.target.value);
      document.getElementById('noiseVolValue').textContent = e.target.value;
    });
  }
}

function setupLFO() {
  const lfoEnabled = document.getElementById('lfoEnabled');
  const lfoWaveform = document.getElementById('lfoWaveform');
  const lfoFreq = document.getElementById('lfoFreq');
  const lfoDepth = document.getElementById('lfoDepth');

  if (lfoEnabled) {
    lfoEnabled.addEventListener('change', (e) => {
      STATE.lfo.enabled = e.target.checked;
    });
  }

  if (lfoWaveform) {
    lfoWaveform.addEventListener('change', (e) => {
      STATE.lfo.waveform = e.target.value;
    });
  }

  if (lfoFreq) {
    lfoFreq.addEventListener('input', (e) => {
      STATE.lfo.freq = parseFloat(e.target.value);
      document.getElementById('lfoFreqValue').textContent = e.target.value;
    });
  }

  if (lfoDepth) {
    lfoDepth.addEventListener('input', (e) => {
      STATE.lfo.depth = parseFloat(e.target.value);
      document.getElementById('lfoDepthValue').textContent = e.target.value;
    });
  }
}

function setupEventListeners() {
  window.NW_EVENTS.on('auth:login', enableAdvancedControls);
  window.NW_EVENTS.on('auth:logout', disableAdvancedControls);
}

function updateADSRDisplay(param, value) {
  const displayEl = document.getElementById(`${param}Value`);
  if (displayEl) {
    displayEl.textContent = `${parseFloat(value).toFixed(param === 'sustain' ? 2 : 1)}`;
  }
}

function enableAdvancedControls() {
  document.querySelectorAll('.advanced-control').forEach(el => el.disabled = false);
}

function disableAdvancedControls() {
  document.querySelectorAll('.advanced-control').forEach(el => el.disabled = true);
}

// Export for onclick handlers
window.NW_ADVANCED = {
  generateAudio,
  previewAudio,
  stopAudioPlayback,
  addOscillator() {
    STATE.oscillators.push({
      id: Date.now(),
      freq: 432,
      waveform: 'sine',
      vol: -12
    });
    renderOscillators();
  },
  removeOscillator(id) {
    STATE.oscillators = STATE.oscillators.filter(o => o.id !== id);
    renderOscillators();
  }
};

function renderOscillators() {
  const container = document.getElementById('oscillatorsList');
  if (!container) return;

  container.innerHTML = STATE.oscillators.map((osc, idx) => `
    <div class="oscillator-item">
      <div class="oscillator-header">
        <strong>OSC ${idx + 2}</strong>
        <button class="remove-btn" onclick="NW_ADVANCED.removeOscillator(${osc.id})">🗑️</button>
      </div>
      <div class="form-group">
        <label>Freq (Hz)</label>
        <input type="number" class="osc-freq" data-osc-id="${osc.id}" value="${osc.freq}" min="20" max="20000" step="1">
      </div>
      <div class="form-group">
        <label>Forma</label>
        <select class="osc-waveform" data-osc-id="${osc.id}">
          <option value="sine" ${osc.waveform === 'sine' ? 'selected' : ''}>Seno</option>
          <option value="triangle" ${osc.waveform === 'triangle' ? 'selected' : ''}>Triángulo</option>
          <option value="square" ${osc.waveform === 'square' ? 'selected' : ''}>Cuadrada</option>
        </select>
      </div>
      <div class="form-group">
        <label>Vol (dB)</label>
        <input type="number" class="osc-vol" data-osc-id="${osc.id}" value="${osc.vol}" min="-40" max="0" step="1">
      </div>
    </div>
  `).join('');
}