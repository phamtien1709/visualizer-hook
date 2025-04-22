import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AudioData, 
  AudioVisualizerOptions,
  VisualizerHookReturn,
  AudioVisualizerError
} from './types';

/**
 * Custom hook for audio visualization from microphone input or audio files
 * 
 * @param options Configuration options for the audio analyzer
 * @returns Object containing audio data and methods to control recording
 */
export const useAudioVisualizer = (
  options: AudioVisualizerOptions = {}
): VisualizerHookReturn => {
  const {
    fftSize = 2048,
    smoothingTimeConstant = 0.8,
    minDecibels = -100,
    maxDecibels = -30,
  } = options;

  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to hold values without causing re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  /**
   * Initialize the audio analyzer with the given options
   */
  const initializeAnalyzer = useCallback((): void => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
      analyserRef.current.minDecibels = minDecibels;
      analyserRef.current.maxDecibels = maxDecibels;
    } catch (err) {
      const audioError = new Error('Failed to initialize audio analyzer') as AudioVisualizerError;
      audioError.type = 'browser_support';
      setError(audioError);
    }
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels]);

  /**
   * Update audio data based on the current analyzer state
   */
  const updateAudioData = useCallback((): void => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeData);

    setAudioData({
      frequencyData,
      timeData,
      audioContext: audioContextRef.current,
      analyser: analyserRef.current,
      bufferLength,
      source: sourceRef.current || undefined
    });

    animationRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  /**
   * Start recording from the microphone
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      initializeAnalyzer();

      if (!audioContextRef.current || !analyserRef.current) {
        throw new Error('Audio context not initialized');
      }

      // Resume audio context if it was suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Create source node from mic stream
      const source = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Connect source to analyzer
      source.connect(analyserRef.current);
      
      // Start the animation loop
      updateAudioData();
      
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      let audioError: AudioVisualizerError;
      
      if (err.name === 'NotAllowedError') {
        audioError = new Error('Microphone permission denied') as AudioVisualizerError;
        audioError.type = 'permission';
      } else {
        audioError = new Error(err.message || 'Failed to start recording') as AudioVisualizerError;
        audioError.type = 'unknown';
      }
      
      setError(audioError);
      setIsRecording(false);
    }
  }, [initializeAnalyzer, updateAudioData]);

  /**
   * Stop the current recording or playback
   */
  const stopRecording = useCallback((): void => {
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Disconnect source from analyzer
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  /**
   * Load and analyze an audio file
   */
  const loadAudioFile = useCallback(async (file: File): Promise<void> => {
    try {
      // Stop any current recording
      stopRecording();
      
      initializeAnalyzer();

      if (!audioContextRef.current || !analyserRef.current) {
        throw new Error('Audio context not initialized');
      }

      // Resume audio context if it was suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Read file as array buffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Create source node from buffer
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      sourceRef.current = source;
      
      // Connect source to analyzer
      source.connect(analyserRef.current);
      source.connect(audioContextRef.current.destination);
      
      // Start playback
      source.start(0);
      
      // When playback ends, clean up
      source.onended = stopRecording;
      
      // Start the animation loop
      updateAudioData();
      
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      const audioError = new Error(
        err.message || 'Failed to load audio file'
      ) as AudioVisualizerError;
      audioError.type = 'file_format';
      setError(audioError);
    }
  }, [initializeAnalyzer, stopRecording, updateAudioData]);

  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      stopRecording();
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopRecording]);

  return {
    audioData,
    isRecording,
    error,
    startRecording,
    stopRecording,
    loadAudioFile
  };
}; 