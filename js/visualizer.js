/**
 * Visualizer Module
 * Real-time FFT display and audio preview
 */

import { buildAudioGraph } from './audio-engine.js';

export function initVisualizer() {
  const canvas = document.getElementById('visualizer');
  if (canvas) {
    drawVisualizerIdle(canvas);
  }
}

export function startFFTAnimation(canvasId = 'visualizer') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !STATE.analyser) return;

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

    // Draw frequency bars with gradient
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const hue = (i / bufferLength) * 240 + 200;
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
      if (x > width) break;
    }

    // Overlay waveform
    const timeData = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(timeData);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sliceWidth = width / bufferLength;
    let xPos = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(xPos, y);
      else ctx.lineTo(xPos, y);
      xPos += sliceWidth;
    }
    ctx.stroke();
  }

  draw();
}

export function stopFFTAnimation() {
  if (STATE.fftAnimId) {
    cancelAnimationFrame(STATE.fftAnimId);
    STATE.fftAnimId = null;
  }
}

export function drawVisualizerIdle(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Sine wave
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < width; i++) {
    const y = height / 2 + Math.sin(i * 0.02) * 15;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.stroke();

  // Text
  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('FFT Analyzer · Pulsa Preview para activar', width / 2, height / 2 + 4);
}

export function speakScript(script, voiceName, rate) {
  if (!window.speechSynthesis) return;
  const lines = script.split('\n').filter(line => line.trim());
  let index = 0;

  function speakNext() {
    if (index >= lines.length || !STATE.isPlaying) return;
    const utterance = new SpeechSynthesisUtterance(lines[index]);
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => 
      v.name.includes(voiceName.split('-').pop().replace('Neural', ''))
    );
    if (voice) utterance.voice = voice;
    utterance.onend = () => { 
      index++; 
      setTimeout(speakNext, 2000); 
    };
    window.speechSynthesis.speak(utterance);
  }

  speakNext();
}