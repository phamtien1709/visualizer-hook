import { useState, useEffect, useMemo } from 'react';
import { AudioData, DataProcessorOptions, VisualizerProcessedData } from './types';
import { processAudioData } from './utils/audioProcessor';

/**
 * Hook for processing raw audio data into a format suitable for visualization
 * 
 * This hook takes the raw audio data from useAudioVisualizer and processes it
 * to provide normalized, smoothed data that's easier to use in UI components.
 * 
 * @param audioData Raw audio data from useAudioVisualizer
 * @param options Processing options
 * @returns Processed audio data ready for visualization
 */
export const useProcessedAudioData = (
  audioData: AudioData | null,
  options: DataProcessorOptions = {}
): VisualizerProcessedData | null => {
  const [processedData, setProcessedData] = useState<VisualizerProcessedData | null>(null);
  
  // Previous values for smoothing
  const prevValues = useMemo(() => ({
    frequencyData: [] as number[],
    timeData: [] as number[],
    volume: 0,
    peakLevel: 0
  }), []);
  
  useEffect(() => {
    if (!audioData) {
      return;
    }
    
    const newProcessedData = processAudioData(audioData, options);
    
    // Apply smoothing if enabled
    if (options.smoothing && options.smoothing > 0 && processedData) {
      const smoothingFactor = Math.min(Math.max(options.smoothing, 0), 1);
      const inverseFactor = 1 - smoothingFactor;
      
      // Smooth frequency data
      for (let i = 0; i < newProcessedData.frequencyData.length; i++) {
        if (i < prevValues.frequencyData.length) {
          newProcessedData.frequencyData[i] = 
            (smoothingFactor * prevValues.frequencyData[i]) + 
            (inverseFactor * newProcessedData.frequencyData[i]);
        }
      }
      
      // Smooth time data
      for (let i = 0; i < newProcessedData.timeData.length; i++) {
        if (i < prevValues.timeData.length) {
          newProcessedData.timeData[i] = 
            (smoothingFactor * prevValues.timeData[i]) + 
            (inverseFactor * newProcessedData.timeData[i]);
        }
      }
      
      // Smooth volume and peak level
      newProcessedData.volume = 
        (smoothingFactor * prevValues.volume) + 
        (inverseFactor * newProcessedData.volume);
      
      newProcessedData.peakLevel = 
        (smoothingFactor * prevValues.peakLevel) + 
        (inverseFactor * newProcessedData.peakLevel);
    }
    
    // Save current values for next frame's smoothing
    prevValues.frequencyData = [...newProcessedData.frequencyData];
    prevValues.timeData = [...newProcessedData.timeData];
    prevValues.volume = newProcessedData.volume;
    prevValues.peakLevel = newProcessedData.peakLevel;
    
    setProcessedData(newProcessedData);
  }, [audioData, options, prevValues, processedData]);
  
  return processedData;
}; 