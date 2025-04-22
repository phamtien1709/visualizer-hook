export type AudioSourceType = 'microphone' | 'file';

export type FrequencyDataType = Uint8Array;
export type TimeDataType = Uint8Array;

export interface AudioVisualizerOptions {
  fftSize?: number;         // Size of FFT (Fast Fourier Transform)
  smoothingTimeConstant?: number; // Smoothing time constant for analyzer
  minDecibels?: number;     // Minimum decibel value
  maxDecibels?: number;     // Maximum decibel value
}

export interface AudioData {
  frequencyData: FrequencyDataType;
  timeData: TimeDataType;
  audioContext: AudioContext;
  analyser: AnalyserNode;
  bufferLength: number;
  source?: AudioBufferSourceNode | MediaStreamAudioSourceNode;
}

export interface VisualizerHookReturn {
  audioData: AudioData | null;
  isRecording: boolean;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  loadAudioFile: (file: File) => Promise<void>;
}

export interface VisualizerProcessedData {
  frequencyData: number[];    // Processed frequency data (normalized if requested)
  timeData: number[];         // Processed time data (normalized if requested)
  volume: number;             // Current volume level (0-1)
  peakLevel: number;          // Peak volume level detected
  isActive: boolean;          // Whether audio is currently active
  dominant: {
    frequency: number;        // Dominant frequency in Hz
    amplitude: number;        // Amplitude of dominant frequency
    index: number;            // Index of dominant frequency in the array
  };
}

export interface DataProcessorOptions {
  normalize?: boolean;        // Whether to normalize data to 0-1 range
  logarithmic?: boolean;      // Whether to use logarithmic scaling
  smoothing?: number;         // Smoothing factor for transitions (0-1)
  frequencyBands?: number[];  // Custom frequency bands for analysis
}

export interface AudioVisualizerError extends Error {
  type: 'permission' | 'browser_support' | 'file_format' | 'processing' | 'unknown';
} 