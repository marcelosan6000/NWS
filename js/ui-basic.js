/**
 * Basic Mode UI
 * Simplified interface for non-technical users
 */

import { loadPreset } from './presets.js';
import { generateAudio, previewAudio, stopAudioPlayback } from './render.js';

export function initBasicMode() {
  setupPresetButtons();
  setupBasicControls();
  setupEventListeners();
}

function setupPresetButtons() {
  const container = document.getElementById('basicPresetsContainer');
  if (!container) return;

  container.innerHTML = `
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('theta')" title="Meditación profunda">
      <span class="freq">6.0 Hz</span>
      <span class="label">🧘 Theta</span>
    </button>
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('alpha')" title="Relajación consciente">
      <span class="freq">10.0 Hz</span>
      <span class="label">☀️ Alpha</span>
    </button>
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('beta')" title="Concentración">
      <span class="freq">18.0 Hz</span>
      <span class="label">⚡ Beta</span>
    </button>
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('delta')" title="Sueño profundo">
      <span class="freq">2.0 Hz</span>
      <span class="label">🌙 Delta</span>
    </button>
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('schumann')" title="Resonancia Tierra">
      <span class="freq">7.83 Hz</span>
      <span class="label">🌍 Schumann</span>
    </button>
    <button class="preset-btn" onclick="NW_PRESETS.loadPreset('solfeggio528')" title="Sanación">
      <span class="freq">528 Hz</span>
      <span class="label">💚 528 Hz</span>
    </button>
  `;
}

function setupBasicControls() {
  // Duration selector
  const durationSelect = document.getElementById('basicDuration');
  if (durationSelect) {
    durationSelect.addEventListener('change', (e) => {
      STATE.duration = parseInt(e.target.value);
      updateStatusDisplay();
    });
  }

  // Format selector
  const formatBtns = document.querySelectorAll('.basic-format-btn');
  formatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      STATE.outputFormat = e.target.dataset.format;
      formatBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Session name
  const sessionInput = document.getElementById('basicSessionName');
  if (sessionInput) {
    sessionInput.addEventListener('change', (e) => {
      STATE.sessionName = e.target.value;
    });
  }
}

function setupEventListeners() {
  // Listen to preset changes
  window.NW_EVENTS.on('preset:loaded', updateBasicUI);
  window.NW_EVENTS.on('auth:login', enableBasicControls);
  window.NW_EVENTS.on('auth:logout', disableBasicControls);
}

function updateBasicUI(preset) {
  if (document.getElementById('basicTargetFreq')) {
    document.getElementById('basicTargetFreq').textContent = 
      `${STATE.targetFreq.toFixed(1)} Hz`;
  }
  if (document.getElementById('basicDuration')) {
    document.getElementById('basicDuration').value = STATE.duration;
  }
  updateStatusDisplay();
}

function updateStatusDisplay() {
  const hours = Math.floor(STATE.duration / 3600);
  const minutes = Math.floor((STATE.duration % 3600) / 60);
  
  if (document.getElementById('basicStatus')) {
    document.getElementById('basicStatus').innerHTML = `
      <span>⏱️ ${hours}h ${minutes}m</span>
      <span>🔊 ${STATE.outputFormat.toUpperCase()}</span>
    `;
  }
}

function enableBasicControls() {
  document.querySelectorAll('.basic-control').forEach(el => el.disabled = false);
  document.querySelectorAll('.preset-btn').forEach(el => el.disabled = false);
}

function disableBasicControls() {
  document.querySelectorAll('.basic-control').forEach(el => el.disabled = true);
  document.querySelectorAll('.preset-btn').forEach(el => el.disabled = true);
}

// Export functions for onclick handlers
window.NW_BASIC = {
  loadPreset,
  generateAudio,
  previewAudio,
  stopAudioPlayback
};