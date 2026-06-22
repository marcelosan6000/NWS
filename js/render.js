/**
 * Audio Rendering Pipeline
 * Handles generation, encoding, quota checking, and downloads
 */

import { buildAudioGraph, renderChunked, stopAudio } from './audio-engine.js';
import { audioBufferToWav, audioBufferToMp3 } from './encoders.js';
import { calculateLUFS, sanitizeFilename, formatDuration } from './utils.js';
import { canUserRender, updateQuotaUsage } from './firebase-auth.js';

/**
 * Generate audio file
 */
export async function generateAudio() {
  if (STATE.isRendering) return;

  // Check authentication
  if (!STATE.isAuthenticated) {
    showErrorModal('Debes iniciar sesión para generar audio');
    return;
  }

  // Check quotas
  const quotaCheck = await canUserRender(STATE.duration);
  if (!quotaCheck.allowed) {
    showQuotaExceeded(quotaCheck.reason);
    return;
  }

  STATE.isRendering = true;
  setButtonsDisabled(true);

  try {
    const totalDuration = STATE.duration;
    const format = STATE.outputFormat.toUpperCase();
    const estimatedMB = format === 'WAV'
      ? (totalDuration * SAMPLE_RATE * CHANNELS * 2 / 1024 / 1024).toFixed(1)
      : (totalDuration * 320 * 1000 / 8 / 1024 / 1024).toFixed(1);

    showProgress(
      `Iniciando renderizado ${format}...`,
      `Duración: ${formatDuration(totalDuration)} · Tamaño estimado: ${estimatedMB} MB`
    );

    let finalBuffer;
    if (totalDuration <= 60) {
      showProgress('Renderizando...', 'Un solo bloque');
      const ctx = new OfflineAudioContext(
        CHANNELS,
        Math.ceil(totalDuration * SAMPLE_RATE),
        SAMPLE_RATE
      );
      buildAudioGraph(ctx, totalDuration, 0);
      finalBuffer = await ctx.startRendering();
      updateProgress({ percent: 100, chunk: 1, totalChunks: 1, elapsed: 0, eta: 0 });
    } else {
      finalBuffer = await renderChunked(totalDuration, updateProgress);
    }

    // Calculate LUFS
    showProgress('📊 Analizando loudness (LUFS)...', 'K-weighting EBU R128');
    await new Promise(r => setTimeout(r, 50));
    const lufsData = calculateLUFS(finalBuffer);

    updateLUFSDisplay(lufsData);

    // Encode
    showProgress(`Codificando ${format}...`, format === 'WAV' ? '16-bit PCM' : 'MP3 320 kbps CBR');
    await new Promise(r => setTimeout(r, 50));

    let blob;
    if (format === 'WAV') {
      blob = audioBufferToWav(finalBuffer);
    } else {
      blob = audioBufferToMp3(finalBuffer);
    }

    showProgress('Preparando descarga...', `Tamaño final: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    await new Promise(r => setTimeout(r, 100));

    // Download file
    downloadFile(blob, format);

    // Update quota
    await updateQuotaUsage(1, Math.ceil(totalDuration / 60));

    showProgress(`✅ ¡Completado! (${format})`, 'Archivo descargado exitosamente');
    document.getElementById('progressFill').style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';

    setTimeout(hideProgress, 4000);
  } catch (err) {
    if (err.message === 'CANCELLED') {
      showProgress('⏹️ Cancelado', 'Renderizado detenido');
    } else {
      console.error(err);
      showProgress('❌ Error', err.message);
    }
    setTimeout(hideProgress, 4000);
  } finally {
    STATE.isRendering = false;
    setButtonsDisabled(false);
  }
}

/**
 * Preview audio (10 seconds)
 */
export async function previewAudio() {
  if (STATE.isPlaying || STATE.isRendering) return;

  if (!STATE.isAuthenticated) {
    showErrorModal('Debes iniciar sesión para previewear audio');
    return;
  }

  const ctx = window.NW_AUDIO_CTX || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  window.NW_AUDIO_CTX = ctx;

  STATE.isPlaying = true;
  setButtonsDisabled(true);

  const duration = 10;  // 10 seconds preview
  STATE.analyser = ctx.createAnalyser();
  STATE.analyser.fftSize = 2048;
  STATE.analyser.connect(ctx.destination);

  buildAudioGraph(ctx, duration, ctx.currentTime, STATE.analyser);

  // Start FFT visualization
  startFFTAnimation();

  // Voice guidance
  if (STATE.voice.enabled && STATE.voice.script) {
    speakScript(STATE.voice.script, STATE.voice.voice, STATE.voice.speed);
  }

  setTimeout(() => {
    STATE.isPlaying = false;
    setButtonsDisabled(false);
    stopFFTAnimation();
    drawVisualizerIdle();
  }, duration * 1000);
}

/**
 * Stop audio playback
 */
export function stopAudioPlayback() {
  if (STATE.audioContext) {
    STATE.audioContext.close();
    STATE.audioContext = null;
  }
  STATE.isPlaying = false;
  STATE.isRendering = false;
  stopFFTAnimation();
  setButtonsDisabled(false);
  drawVisualizerIdle();
  stopAudio();
}

// ============ UI HELPERS ============

function showProgress(status, detail = '') {
  document.getElementById('progressContainer').classList.add('active');
  document.getElementById('progressStatus').textContent = status;
  document.getElementById('progressDetail').textContent = detail;
}

function updateProgress(data) {
  const percent = data.percent.toFixed(1);
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressFill').textContent = percent + '%';
  document.getElementById('progressPercent').textContent = percent + '%';
  document.getElementById('progressStatus').textContent = `Renderizando chunk ${data.chunk}/${data.totalChunks}...`;
  document.getElementById('progressDetail').textContent = `Transcurrido: ${data.elapsed.toFixed(1)}s`;
  document.getElementById('progressETA').textContent = `ETA: ${data.eta.toFixed(1)}s`;
}

function hideProgress() {
  document.getElementById('progressContainer').classList.remove('active');
}

function setButtonsDisabled(disabled) {
  document.getElementById('previewBtn').disabled = disabled;
  document.getElementById('generateBtn').disabled = disabled;
  document.getElementById('stopBtn').disabled = !disabled;
}

function updateLUFSDisplay(data) {
  document.getElementById('lufsIntegrated').textContent = data.integrated.toFixed(1) + ' LUFS';
  document.getElementById('lufsPeak').textContent = data.peak.toFixed(1) + ' dB';
  document.getElementById('lufsRange').textContent = data.dynamicRange.toFixed(1) + ' dB';
  document.getElementById('lufsBox').classList.add('active');
  document.getElementById('statusLUFS').textContent = data.integrated.toFixed(1) + ' LUFS';
}

function downloadFile(blob, format) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sessionName = STATE.sessionName || 'NeuroWave';
  const safeName = sanitizeFilename(sessionName);
  const ext = format.toLowerCase();
  a.href = url;
  a.download = `${safeName}_${STATE.toneType}_${STATE.targetFreq}Hz_${STATE.duration}s.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function showErrorModal(message) {
  alert(message);
}

function showQuotaExceeded(reason) {
  const messages = {
    duration_too_long: 'La duración excede el máximo permitido para tu plan.',
    daily_downloads_exceeded: 'Has alcanzado tu límite de descargas diarias.',
    daily_minutes_exceeded: 'Has alcanzado tu límite de minutos de descarga diarios.'
  };
  alert(messages[reason] || 'Error de cuota');
}

// ============ VISUALIZATION ============

function startFFTAnimation() {
  const canvas = document.getElementById('visualizer');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const analyser = STATE.analyser;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!STATE.isPlaying) return;
    STATE.fftAnimId = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const hue = (i / bufferLength) * 240 + 200;
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
      if (x > width) break;
    }
  }

  draw();
}

function stopFFTAnimation() {
  if (STATE.fftAnimId) {
    cancelAnimationFrame(STATE.fftAnimId);
    STATE.fftAnimId = null;
  }
}

function drawVisualizerIdle() {
  const canvas = document.getElementById('visualizer');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < width; i++) {
    const y = height / 2 + Math.sin(i * 0.02) * 15;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('FFT Analyzer · Pulsa Preview para activar', width / 2, height / 2 + 4);
}

function speakScript(script, voiceName, rate) {
  if (!window.speechSynthesis) return;
  const lines = script.split('\n').filter(line => line.trim());
  let index = 0;

  function speakNext() {
    if (index >= lines.length || !STATE.isPlaying) return;
    const utterance = new SpeechSynthesisUtterance(lines[index]);
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes(voiceName.split('-').pop().replace('Neural', '')));
    if (voice) utterance.voice = voice;
    utterance.onend = () => { index++; setTimeout(speakNext, 2000); };
    window.speechSynthesis.speak(utterance);
  }

  speakNext();
}