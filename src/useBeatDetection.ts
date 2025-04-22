import { useState, useEffect, useRef } from 'react';
import { AudioData } from './types';
import { createBeatAnalyzer, BeatDetector } from './utils/beatDetection';

interface BeatDetectionOptions {
  threshold?: number;      // Detection threshold (0-1)
  decayRate?: number;      // Decay rate
  minTimeBetweenBeats?: number; // Minimum time between beats (ms)
  frequencyRange?: {       // Frequency range for beat detection
    low: number;           // Low frequency (Hz)
    high: number;          // High frequency (Hz)
  };
}

interface BeatDetectionResult {
  isBeat: boolean;         // Whether a beat is detected
  energy: number;          // Current energy
  averageEnergy: number;   // Average energy
  delta: number;           // Energy difference
  tempo: number;           // Estimated tempo (BPM)
  time: number;            // Timestamp
  beats: number;           // Number of beats detected
  updateOptions: (options: Partial<BeatDetectionOptions>) => void; // Update options
  reset: () => void;       // Reset detector
}

/**
 * Hook for beat detection from audio data
 * 
 * @param audioData Audio data from useAudioVisualizer
 * @param options Beat detection options
 * @returns Beat and tempo information
 */
export const useBeatDetection = (
  audioData: AudioData | null,
  options: BeatDetectionOptions = {}
): BeatDetectionResult => {
  const [beatState, setBeatState] = useState<Omit<BeatDetectionResult, 'updateOptions' | 'reset'>>({
    isBeat: false,
    energy: 0,
    averageEnergy: 0,
    delta: 0,
    tempo: 0,
    time: Date.now(),
    beats: 0
  });
  
  // Use refs to store state across renders
  const beatCountRef = useRef<number>(0);
  const analyzerRef = useRef(createBeatAnalyzer(options));
  
  // Initialize analyzer with options
  useEffect(() => {
    analyzerRef.current.updateOptions(options);
  }, [options]);
  
  // Analyze beats when audio data changes
  useEffect(() => {
    if (!audioData) return;
    
    const beatInfo = analyzerRef.current.analyzeBeat(audioData);
    
    if (beatInfo.isBeat) {
      beatCountRef.current += 1;
    }
    
    setBeatState({
      ...beatInfo,
      beats: beatCountRef.current
    });
  }, [audioData]);
  
  // Reset analyzer when component unmounts
  useEffect(() => {
    return () => {
      analyzerRef.current.reset();
    };
  }, []);
  
  // Update options function
  const updateOptions = (newOptions: Partial<BeatDetectionOptions>) => {
    analyzerRef.current.updateOptions(newOptions);
  };
  
  // Reset function
  const reset = () => {
    analyzerRef.current.reset();
    beatCountRef.current = 0;
    setBeatState(prev => ({
      ...prev,
      isBeat: false,
      energy: 0,
      averageEnergy: 0,
      delta: 0,
      tempo: 0,
      beats: 0
    }));
  };
  
  return {
    ...beatState,
    updateOptions,
    reset
  };
}; 