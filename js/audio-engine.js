/**
 * High-Quality Audio Synthesis Engine
 * Binaural & Isochronic beat generation with advanced DSP
 */

import { dbToLinear } from './utils.js';

/**
 * Build complete audio graph for offline rendering
 */
export function buildAudioGraph(ctx, duration, startTime = 0, destination = null) {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  const finalDest = destination || ctx.destination;

  // Main tone synthesis
  if (STATE.toneType === 'isochronic') {
    buildIsochronic(ctx, STATE.baseFreq, STATE.targetFreq, duration, startTime, masterGain);
  } else if (STATE.toneType === 'binaural' && STATE.targetFreq > 0) {
    buildBinaural(ctx, STATE.baseFreq, STATE.targetFreq, duration, startTime, masterGain);
  } else {
    // Pure tone (Solfeggio frequencies)
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = STATE.waveform;
    osc.frequency.value = STATE.baseFreq;
    g.gain.value = dbToLinear(STATE.mainVol);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Additional oscillators
  STATE.oscillators.forEach(osc => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = osc.waveform;
    o.frequency.value = osc.freq;
    g.gain.value = dbToLinear(osc.vol);
    o.connect(g);
    g.connect(masterGain);
    o.start(startTime);
    o.stop(startTime + duration);
  });

  // Therapeutic noise
  if (STATE.noise.enabled) {
    buildNoise(ctx, STATE.noise.type, STATE.noise.vol, duration, startTime, masterGain);
  }

  // Processing chain
  let currentNode = masterGain;

  // EQ (6-band parametric)
  if (STATE.eq.enabled) {
    const eqChain = buildEQ(ctx);
    masterGain.connect(eqChain.input);
    currentNode = eqChain.output;
  }

  // Filter (HP/LP/BP)
  if (STATE.filter.enabled) {
    const filter = ctx.createBiquadFilter();
    filter.type = STATE.filter.type;
    filter.frequency.value = STATE.filter.freq;
    filter.Q.value = STATE.filter.Q || 1.0;
    currentNode.connect(filter);
    currentNode = filter;
  }

  // Apply ADSR envelope
  applyADSREnvelope(ctx, masterGain.gain, duration, startTime);

  // LFO modulation (modulates during synthesis)
  if (STATE.lfo.enabled) {
    applyLFO(ctx, masterGain, duration, startTime);
  }

  currentNode.connect(finalDest);
  return { masterGain, output: currentNode };
}

/**
 * Build 6-band parametric EQ
 * Normalized to prevent clipping
 */
function buildEQ(ctx) {
  const filters = STATE.eq.bands.map((band) => {
    const filter = ctx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = band.freq;
    filter.Q.value = band.Q;
    filter.gain.value = band.gain;
    return filter;
  });

  // Chain filters
  for (let i = 0; i < filters.length - 1; i++) {
    filters[i].connect(filters[i + 1]);
  }

  // Add normalizing gain to prevent clipping
  const normGain = ctx.createGain();
  const maxGain = Math.max(...STATE.eq.bands.map(b => Math.abs(b.gain)));
  normGain.gain.value = maxGain > 0 ? 1 / (1 + maxGain / 12) : 1;
  filters[filters.length - 1].connect(normGain);

  return {
    input: filters[0],
    output: normGain
  };
}

/**
 * Isochronic Tone: pulsing carrier at target frequency
 */
function buildIsochronic(ctx, baseFreq, targetFreq, duration, startTime, destination) {
  const osc = ctx.createOscillator();
  const toneGain = ctx.createGain();
  const pulseGain = ctx.createGain();

  osc.type = STATE.waveform;
  osc.frequency.value = baseFreq;
  toneGain.gain.value = dbToLinear(STATE.mainVol);
  pulseGain.gain.value = 0;

  // Pure tone if no target frequency
  if (targetFreq <= 0) {
    osc.connect(toneGain);
    toneGain.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return;
  }

  // Isochronic pulse pattern
  const pulseInterval = 1 / targetFreq;
  const totalPulses = Math.floor(duration * targetFreq);

  for (let i = 0; i < totalPulses; i++) {
    const t = startTime + i * pulseInterval;
    const attack = pulseInterval * 0.1;   // 10% attack
    const hold = pulseInterval * 0.4;     // 40% hold
    const release = pulseInterval * 0.4;  // 40% release

    pulseGain.gain.setValueAtTime(0, t);
    pulseGain.gain.linearRampToValueAtTime(1, t + attack);
    pulseGain.gain.setValueAtTime(1, t + attack + hold);
    pulseGain.gain.linearRampToValueAtTime(0, t + attack + hold + release);
  }

  osc.connect(toneGain);
  toneGain.connect(pulseGain);
  pulseGain.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Binaural Beats: difference frequency between L and R channels
 * Fixed: applies stereoWidth correctly
 */
function buildBinaural(ctx, baseFreq, targetFreq, duration, startTime, destination) {
  const merger = ctx.createChannelMerger(2);
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();

  oscL.type = STATE.waveform;
  oscR.type = STATE.waveform;
  oscL.frequency.value = baseFreq;
  oscR.frequency.value = baseFreq + targetFreq;

  const linVol = dbToLinear(STATE.mainVol);
  gainL.gain.value = linVol;
  // Apply stereo width to right channel
  gainR.gain.value = linVol * STATE.stereoWidth;

  oscL.connect(gainL);
  oscR.connect(gainR);
  gainL.connect(merger, 0, 0);
  gainR.connect(merger, 0, 1);
  merger.connect(destination);

  oscL.start(startTime);
  oscR.start(startTime);
  oscL.stop(startTime + duration);
  oscR.stop(startTime + duration);
}

/**
 * Therapeutic Noise: Pink/Brown/White
 */
function buildNoise(ctx, type, volume, duration, startTime, destination) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(CHANNELS, bufferSize, ctx.sampleRate);
  const width = STATE.stereoWidth;

  for (let ch = 0; ch < CHANNELS; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let brown = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      let sample;

      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        brown = (brown + (0.02 * white)) / 1.02;
        sample = brown * 3.5;
      } else {
        sample = white;
      }

      // Add stereo variation
      data[i] = sample * (1 + (Math.random() * 2 - 1) * width * 0.3);
    }
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(destination);
  source.start(startTime);
}

/**
 * ADSR Envelope: Attack-Decay-Sustain-Release
 */
function applyADSREnvelope(ctx, param, duration, startTime) {
  const a = Math.min(STATE.attack, duration * 0.4);
  const d = Math.min(STATE.decay, duration * 0.2);
  const r = Math.min(STATE.release, duration * 0.4);
  const s = STATE.sustain;

  param.cancelScheduledValues(startTime);
  param.setValueAtTime(0, startTime);
  param.linearRampToValueAtTime(1, startTime + a);
  param.linearRampToValueAtTime(s, startTime + a + d);
  param.setValueAtTime(s, startTime + duration - r);
  param.linearRampToValueAtTime(0, startTime + duration);
}

/**
 * LFO: Low Frequency Oscillation
 * Modulates amplitude during synthesis
 */
function applyLFO(ctx, gainNode, duration, startTime) {
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  lfo.type = STATE.lfo.waveform;
  lfo.frequency.value = STATE.lfo.freq;
  lfoGain.gain.value = STATE.lfo.depth;

  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);

  lfo.start(startTime);
  lfo.stop(startTime + duration);
}

/**
 * Render audio in chunks to avoid memory issues with long durations
 */
export async function renderChunked(totalDuration, onProgress) {
  const CHUNK_SECONDS = CHUNK_SECONDS || 60;
  const totalChunks = Math.ceil(totalDuration / CHUNK_SECONDS);
  const allBuffers = [];
  const startTime = performance.now();

  for (let i = 0; i < totalChunks; i++) {
    if (!STATE.isRendering) throw new Error('CANCELLED');

    const chunkDuration = Math.min(CHUNK_SECONDS, totalDuration - i * CHUNK_SECONDS);
    const chunkCtx = new OfflineAudioContext(
      CHANNELS,
      Math.ceil(chunkDuration * SAMPLE_RATE),
      SAMPLE_RATE
    );

    buildAudioGraph(chunkCtx, chunkDuration, 0);
    const chunkBuffer = await chunkCtx.startRendering();
    allBuffers.push(chunkBuffer);

    const progress = ((i + 1) / totalChunks) * 100;
    const elapsed = (performance.now() - startTime) / 1000;
    const eta = (elapsed / (i + 1)) * (totalChunks - i - 1);

    onProgress({
      percent: progress,
      chunk: i + 1,
      totalChunks,
      elapsed,
      eta
    });

    await new Promise(r => setTimeout(r, 0));
  }

  return mergeBuffersWithCrossfade(allBuffers);
}

/**
 * Merge buffers with smooth crossfade to prevent clicks
 */
function mergeBuffersWithCrossfade(buffers) {
  let totalLength = 0;
  buffers.forEach(b => (totalLength += b.length));

  const merged = new AudioBuffer({
    length: totalLength,
    numberOfChannels: CHANNELS,
    sampleRate: SAMPLE_RATE
  });

  const CROSSFADE_SAMPLES = Math.floor(SAMPLE_RATE * 0.05); // 50ms crossfade
  let offset = 0;

  buffers.forEach((buffer, bufIdx) => {
    for (let ch = 0; ch < CHANNELS; ch++) {
      const sourceData = buffer.getChannelData(ch);
      const destData = merged.getChannelData(ch);

      if (bufIdx > 0 && offset > 0) {
        // Crossfade at buffer boundary
        const prevOffset = offset - CROSSFADE_SAMPLES;
        for (let i = 0; i < CROSSFADE_SAMPLES && prevOffset + i < totalLength; i++) {
          const fadeIn = i / CROSSFADE_SAMPLES;
          destData[prevOffset + i] = destData[prevOffset + i] * (1 - fadeIn) + sourceData[i] * fadeIn;
        }
        destData.set(sourceData.subarray(CROSSFADE_SAMPLES), offset + CROSSFADE_SAMPLES);
      } else {
        destData.set(sourceData, offset);
      }
    }

    offset += buffer.length - (bufIdx > 0 ? CROSSFADE_SAMPLES : 0);
  });

  return merged;
}

/**
 * Create offline context for real-time preview
 */
export function createPreviewContext() {
  if (!STATE.audioContext) {
    STATE.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return STATE.audioContext;
}

/**
 * Stop all audio playback
 */
export function stopAudio() {
  if (STATE.audioContext) {
    STATE.audioContext.close();
    STATE.audioContext = null;
  }
  STATE.isPlaying = false;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}