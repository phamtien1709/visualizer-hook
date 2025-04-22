// Main hooks
export { useAudioVisualizer } from './useAudioVisualizer';
export { useProcessedAudioData } from './useProcessedAudioData';
export { useBeatDetection } from './useBeatDetection';

// Utility functions
export { 
  processAudioData,
  extractFrequencyBands,
  calculateSpectrumCharacteristics
} from './utils/audioProcessor';

export {
  BeatDetector,
  TempoAnalyzer,
  createBeatAnalyzer
} from './utils/beatDetection';

// Type definitions
export type {
  AudioSourceType,
  FrequencyDataType,
  TimeDataType,
  AudioVisualizerOptions,
  AudioData,
  VisualizerHookReturn,
  VisualizerProcessedData,
  DataProcessorOptions,
  AudioVisualizerError
} from './types'; 