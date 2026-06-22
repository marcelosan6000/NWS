/**
 * Utility Functions
 */

/**
 * Convert dB to linear volume
 */
export function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear to dB
 */
export function linearToDb(linear) {
  return 20 * Math.log10(Math.max(linear, 1e-10));
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Generate pink noise using Voss-McCartney algorithm
 */
export function generatePinkNoise(length, channels = 2) {
  const buffer = new AudioBuffer({
    length,
    numberOfChannels: channels,
    sampleRate: SAMPLE_RATE
  });

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  return buffer;
}

/**
 * Generate brown noise
 */
export function generateBrownNoise(length, channels = 2) {
  const buffer = new AudioBuffer({
    length,
    numberOfChannels: channels,
    sampleRate: SAMPLE_RATE
  });

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    let brown = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + (0.02 * white)) / 1.02;
      data[i] = Math.max(-1, Math.min(1, brown * 3.5));
    }
  }

  return buffer;
}

/**
 * Calculate LUFS (EBU R128 simplified)
 */
export function calculateLUFS(buffer) {
  const channels = [];
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  // K-weighting coefficients
  const b0 = 1.53512485958697;
  const b1 = -2.69169618940638;
  const b2 = 1.19839281085285;
  const a1 = -1.69065929318241;
  const a2 = 0.73248077421585;

  // High-pass filter
  const hp_b0 = 1.0;
  const hp_b1 = -2.0;
  const hp_b2 = 1.0;
  const hp_a1 = -1.99004745483398;
  const hp_a2 = 0.99007225036621;

  let peak = 0;
  let sumSquares = 0;
  let count = 0;

  for (let ch = 0; ch < channels.length; ch++) {
    const data = channels[ch];
    let z1 = 0, z2 = 0;
    let hp_z1 = 0, hp_z2 = 0;

    for (let i = 0; i < data.length; i++) {
      const x = data[i];
      if (Math.abs(x) > peak) peak = Math.abs(x);

      // High shelf
      const y = b0 * x + b1 * z1 + b2 * z2 - a1 * z1 - a2 * z2;
      z2 = z1;
      z1 = x;

      // High pass
      const hp_y = hp_b0 * y + hp_b1 * hp_z1 + hp_b2 * hp_z2 - hp_a1 * hp_z1 - hp_a2 * hp_z2;
      hp_z2 = hp_z1;
      hp_z1 = y;

      sumSquares += hp_y * hp_y;
      count++;
    }
  }

  const meanSquare = sumSquares / count;
  const lufs = -0.691 + 10 * Math.log10(meanSquare + 1e-20);
  const peakDb = 20 * Math.log10(peak + 1e-20);

  return {
    integrated: lufs,
    peak: peakDb,
    dynamicRange: peakDb - lufs
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 64);
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}