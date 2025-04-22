import { AudioData } from '../types';

interface BeatDetectorOptions {
  threshold?: number;      // Detection threshold (0-1)
  decayRate?: number;      // Energy decay rate
  minTimeBetweenBeats?: number; // Minimum time between beats (ms)
  frequencyRange?: {      // Frequency range for beat detection
    low: number;          // Low frequency (Hz)
    high: number;         // High frequency (Hz)
  };
}

interface BeatInfo {
  isBeat: boolean;        // Is it a beat
  energy: number;         // Current energy
  averageEnergy: number;  // Average energy
  delta: number;          // Energy difference
  time: number;           // Beat timestamp
}

/**
 * Beat detection class for audio data
 */
export class BeatDetector {
  private options: Required<BeatDetectorOptions>;
  private averageEnergy: number = 0;
  private lastBeatTime: number = 0;
  private energyHistory: number[] = [];
  private readonly historySize = 43; // About 1s at 60fps
  
  constructor(options: BeatDetectorOptions = {}) {
    this.options = {
      threshold: options.threshold ?? 0.15,
      decayRate: options.decayRate ?? 0.98,
      minTimeBetweenBeats: options.minTimeBetweenBeats ?? 250,
      frequencyRange: options.frequencyRange ?? {
        low: 60,
        high: 120
      }
    };
    
    // Initialize energy history array
    this.energyHistory = new Array(this.historySize).fill(0);
  }
  
  /**
   * Detect beats from frequency data
   */
  public detect(audioData: AudioData | null): BeatInfo {
    if (!audioData) {
      return {
        isBeat: false,
        energy: 0,
        averageEnergy: 0,
        delta: 0,
        time: Date.now()
      };
    }
    
    const { frequencyData, bufferLength, audioContext } = audioData;
    
    // Calculate energy in specific frequency range
    const nyquist = audioContext.sampleRate / 2;
    const lowIndex = Math.floor(this.options.frequencyRange.low * bufferLength / nyquist);
    const highIndex = Math.ceil(this.options.frequencyRange.high * bufferLength / nyquist);
    
    let energy = 0;
    
    // Calculate total energy in frequency range
    for (let i = lowIndex; i <= highIndex; i++) {
      energy += Math.pow(frequencyData[i] / 255, 2);
    }
    
    // Average if more than 1 bin
    if (highIndex > lowIndex) {
      energy /= (highIndex - lowIndex + 1);
    }
    
    // Update energy history array
    this.energyHistory.push(energy);
    this.energyHistory.shift();
    
    // Calculate average energy
    const averageEnergy = this.energyHistory.reduce((sum, e) => sum + e, 0) / this.historySize;
    
    // Update average energy with decay rate
    this.averageEnergy = this.averageEnergy * this.options.decayRate + averageEnergy * (1 - this.options.decayRate);
    
    // Calculate energy difference
    const delta = energy - this.averageEnergy;
    
    // Current time
    const currentTime = Date.now();
    
    // Check if it's a beat
    const isBeat = delta > this.options.threshold && 
                  (currentTime - this.lastBeatTime) > this.options.minTimeBetweenBeats;
    
    // Update last beat time
    if (isBeat) {
      this.lastBeatTime = currentTime;
    }
    
    return {
      isBeat,
      energy,
      averageEnergy: this.averageEnergy,
      delta,
      time: currentTime
    };
  }
  
  /**
   * Reset detector state
   */
  public reset(): void {
    this.averageEnergy = 0;
    this.lastBeatTime = 0;
    this.energyHistory = new Array(this.historySize).fill(0);
  }
  
  /**
   * Update options
   */
  public updateOptions(options: Partial<BeatDetectorOptions>): void {
    this.options = {
      ...this.options,
      ...options,
      frequencyRange: {
        ...this.options.frequencyRange,
        ...(options.frequencyRange || {})
      }
    };
  }
}

/**
 * Tempo analysis (BPM) from beat data
 */
export class TempoAnalyzer {
  private beatTimes: number[] = [];
  private readonly maxHistorySize = 24; // Store max 24 beats
  
  /**
   * Add new beat timestamp
   */
  public addBeat(time: number): void {
    this.beatTimes.push(time);
    
    if (this.beatTimes.length > this.maxHistorySize) {
      this.beatTimes.shift();
    }
  }
  
  /**
   * Calculate current tempo (BPM)
   */
  public getTempo(): number {
    if (this.beatTimes.length < 4) {
      return 0; // Need at least 4 beats to calculate
    }
    
    // Calculate time between beats
    const intervals: number[] = [];
    for (let i = 1; i < this.beatTimes.length; i++) {
      intervals.push(this.beatTimes[i] - this.beatTimes[i - 1]);
    }
    
    // Filter outliers
    const sorted = [...intervals].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const iqr = sorted[q3Index] - sorted[q1Index];
    const lowerBound = sorted[q1Index] - 1.5 * iqr;
    const upperBound = sorted[q3Index] + 1.5 * iqr;
    
    const filteredIntervals = intervals.filter(i => i >= lowerBound && i <= upperBound);
    
    if (filteredIntervals.length === 0) {
      return 0;
    }
    
    // Calculate average time between beats
    const averageInterval = filteredIntervals.reduce((sum, i) => sum + i, 0) / filteredIntervals.length;
    
    // Convert to BPM (60000ms = 1 minute)
    return Math.round(60000 / averageInterval);
  }
  
  /**
   * Reset state
   */
  public reset(): void {
    this.beatTimes = [];
  }
}

/**
 * Helper to use both classes together
 */
export const createBeatAnalyzer = (options?: BeatDetectorOptions) => {
  const detector = new BeatDetector(options);
  const analyzer = new TempoAnalyzer();
  
  const analyzeBeat = (audioData: AudioData | null) => {
    const beatInfo = detector.detect(audioData);
    
    if (beatInfo.isBeat) {
      analyzer.addBeat(beatInfo.time);
    }
    
    return {
      ...beatInfo,
      tempo: analyzer.getTempo()
    };
  };
  
  const reset = () => {
    detector.reset();
    analyzer.reset();
  };
  
  const updateOptions = (newOptions: Partial<BeatDetectorOptions>) => {
    detector.updateOptions(newOptions);
  };
  
  return {
    analyzeBeat,
    reset,
    updateOptions
  };
}; 