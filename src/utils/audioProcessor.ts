import { AudioData, DataProcessorOptions, VisualizerProcessedData } from '../types';

/**
 * Processes raw audio data into format suitable for visualization
 */
export const processAudioData = (
  audioData: AudioData,
  options: DataProcessorOptions = {}
): VisualizerProcessedData => {
  const { 
    normalize = true, 
    logarithmic = false, 
    smoothing = 0.5
  } = options;

  const { frequencyData, timeData, bufferLength } = audioData;
  
  // Process frequency data
  const processedFrequencyData = new Array(bufferLength);
  let maxFrequency = 0;
  let maxFrequencyIndex = 0;
  let maxFrequencyValue = 0;

  // Find max value for normalization and dominant frequency
  for (let i = 0; i < bufferLength; i++) {
    const value = frequencyData[i];
    processedFrequencyData[i] = value;
    
    if (value > maxFrequencyValue) {
      maxFrequencyValue = value;
      maxFrequencyIndex = i;
    }
  }

  // Calculate dominant frequency in Hz
  // Assuming a standard 44100Hz sample rate and fftSize
  const nyquist = audioData.audioContext.sampleRate / 2;
  maxFrequency = maxFrequencyIndex * nyquist / bufferLength;

  // Process time domain data
  const processedTimeData = new Array(bufferLength);
  let volumeSum = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    const value = timeData[i];
    // Convert from 0-255 to -1 to 1
    const normalizedValue = (value / 128) - 1;
    processedTimeData[i] = normalizedValue;
    volumeSum += Math.abs(normalizedValue);
  }

  // Calculate current volume level (0-1)
  const volume = volumeSum / bufferLength;
  
  // Apply normalization if requested
  if (normalize && maxFrequencyValue > 0) {
    for (let i = 0; i < bufferLength; i++) {
      processedFrequencyData[i] = processedFrequencyData[i] / maxFrequencyValue;
      
      // Apply logarithmic scaling if requested
      if (logarithmic) {
        // Avoid log(0)
        const logBase = 10;
        const minValue = 0.001; 
        const value = Math.max(processedFrequencyData[i], minValue);
        processedFrequencyData[i] = Math.log(value * (logBase - 1) + 1) / Math.log(logBase);
      }
    }
  }

  return {
    frequencyData: processedFrequencyData,
    timeData: processedTimeData,
    volume,
    peakLevel: maxFrequencyValue / 255, // Normalize to 0-1
    isActive: volume > 0.05, // Consider active if volume is above threshold
    dominant: {
      frequency: maxFrequency,
      amplitude: maxFrequencyValue / 255, // Normalize to 0-1
      index: maxFrequencyIndex
    }
  };
};

/**
 * Extract frequency bands from frequency data
 * Can be used to create equalizer-like visualizations
 */
export const extractFrequencyBands = (
  frequencyData: Uint8Array | number[],
  bands: number[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
  sampleRate: number = 44100,
  bufferLength: number = frequencyData.length
): number[] => {
  const nyquist = sampleRate / 2;
  const result = new Array(bands.length);
  
  for (let i = 0; i < bands.length; i++) {
    const index = Math.round(bands[i] * bufferLength / nyquist);
    result[i] = frequencyData[Math.min(index, bufferLength - 1)];
  }
  
  return result;
};

/**
 * Calculate audio spectrum characteristics
 */
export const calculateSpectrumCharacteristics = (
  frequencyData: Uint8Array | number[],
  sampleRate: number = 44100
): { 
  centroid: number; 
  spread: number; 
  flatness: number;
} => {
  const bufferLength = frequencyData.length;
  const nyquist = sampleRate / 2;
  
  let sum = 0;
  let weightedSum = 0;
  let product = 1;
  
  for (let i = 0; i < bufferLength; i++) {
    const frequency = i * nyquist / bufferLength;
    const amplitude = frequencyData[i];
    
    sum += amplitude;
    weightedSum += frequency * amplitude;
    
    // Avoid zero in product calculation
    if (amplitude > 0) {
      product *= amplitude;
    }
  }
  
  // Spectral centroid (weighted average of frequencies)
  const centroid = sum > 0 ? weightedSum / sum : 0;
  
  // Spectral spread (variance of frequencies around centroid)
  let spread = 0;
  if (sum > 0) {
    for (let i = 0; i < bufferLength; i++) {
      const frequency = i * nyquist / bufferLength;
      const amplitude = frequencyData[i];
      spread += Math.pow(frequency - centroid, 2) * amplitude;
    }
    spread = Math.sqrt(spread / sum);
  }
  
  // Spectral flatness (geometric mean / arithmetic mean)
  const geometricMean = sum > 0 ? Math.pow(product, 1 / bufferLength) : 0;
  const arithmeticMean = sum / bufferLength;
  const flatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
  
  return { centroid, spread, flatness };
}; 