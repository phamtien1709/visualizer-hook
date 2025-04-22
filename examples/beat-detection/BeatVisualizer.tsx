import React, { useState, useEffect, useCallback } from 'react';
import { useAudioVisualizer, useProcessedAudioData, useBeatDetection } from '../../src';

/**
 * Component demonstrating beat detection feature
 */
const BeatVisualizer: React.FC = () => {
  const { 
    audioData, 
    isRecording, 
    startRecording, 
    stopRecording, 
    loadAudioFile 
  } = useAudioVisualizer({
    fftSize: 1024
  });
  
  const processedData = useProcessedAudioData(audioData, {
    normalize: true,
    smoothing: 0.5
  });
  
  const [beatOptions, setBeatOptions] = useState({
    threshold: 0.15,
    frequencyRange: {
      low: 40,
      high: 120
    }
  });
  
  const beatInfo = useBeatDetection(audioData, beatOptions);
  
  // Beat handling (animation)
  const [beatSize, setBeatSize] = useState(100);
  useEffect(() => {
    if (beatInfo.isBeat) {
      // Create pulse effect when beat detected
      setBeatSize(200);
      const timer = setTimeout(() => {
        setBeatSize(100);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [beatInfo.isBeat]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudioFile(file);
      beatInfo.reset(); // Reset beat detector when loading a new file
    }
  };
  
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBeatOptions(prev => ({
      ...prev,
      threshold: value
    }));
  };
  
  const handleFreqLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setBeatOptions(prev => ({
      ...prev,
      frequencyRange: {
        ...prev.frequencyRange,
        low: value
      }
    }));
  };
  
  const handleFreqHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setBeatOptions(prev => ({
      ...prev,
      frequencyRange: {
        ...prev.frequencyRange,
        high: value
      }
    }));
  };
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Beat Detection Visualizer</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '8px 16px',
            backgroundColor: isRecording ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange}
        />
        
        <button
          onClick={beatInfo.reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Detector
        </button>
      </div>
      
      {/* Beat detection options */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h3>Beat Detection Settings</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Detection Threshold: {beatOptions.threshold.toFixed(2)}
          </label>
          <input 
            type="range" 
            min="0.01" 
            max="0.5" 
            step="0.01" 
            value={beatOptions.threshold}
            onChange={handleThresholdChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Low Frequency: {beatOptions.frequencyRange.low} Hz
          </label>
          <input 
            type="range" 
            min="20" 
            max="200" 
            step="1" 
            value={beatOptions.frequencyRange.low}
            onChange={handleFreqLowChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            High Frequency: {beatOptions.frequencyRange.high} Hz
          </label>
          <input 
            type="range" 
            min="100" 
            max="500" 
            step="1" 
            value={beatOptions.frequencyRange.high}
            onChange={handleFreqHighChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      {/* Beat information display */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: beatInfo.isBeat ? '#e8f5e9' : '#f5f5f5', 
        borderRadius: '4px',
        marginBottom: '20px',
        transition: 'background-color 0.2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Beat: </strong>
            <span style={{ color: beatInfo.isBeat ? '#4CAF50' : '#757575' }}>
              {beatInfo.isBeat ? 'DETECTED!' : 'Waiting...'}
            </span>
          </div>
          <div>
            <strong>Tempo: </strong>
            <span>{beatInfo.tempo || '-'} BPM</span>
          </div>
          <div>
            <strong>Beats Detected: </strong>
            <span>{beatInfo.beats}</span>
          </div>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100px' }}>Energy:</div>
            <div style={{ flex: 1, height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
              <div 
                style={{ 
                  width: `${beatInfo.energy * 100}%`, 
                  height: '100%', 
                  backgroundColor: '#2196F3',
                  borderRadius: '5px'
                }} 
              />
            </div>
            <div style={{ width: '50px', textAlign: 'right' }}>
              {(beatInfo.energy * 100).toFixed(0)}%
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <div style={{ width: '100px' }}>Average:</div>
            <div style={{ flex: 1, height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
              <div 
                style={{ 
                  width: `${beatInfo.averageEnergy * 100}%`, 
                  height: '100%', 
                  backgroundColor: '#FF9800',
                  borderRadius: '5px'
                }} 
              />
            </div>
            <div style={{ width: '50px', textAlign: 'right' }}>
              {(beatInfo.averageEnergy * 100).toFixed(0)}%
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <div style={{ width: '100px' }}>Delta:</div>
            <div style={{ flex: 1, height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
              <div 
                style={{ 
                  width: `${Math.max(0, beatInfo.delta * 100)}%`, 
                  height: '100%', 
                  backgroundColor: beatInfo.delta > beatOptions.threshold ? '#4CAF50' : '#9E9E9E',
                  borderRadius: '5px'
                }} 
              />
            </div>
            <div style={{ width: '50px', textAlign: 'right' }}>
              {(beatInfo.delta * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Visualizer */}
      <div style={{ 
        position: 'relative',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {processedData && (
          <>
            {/* Display frequency data */}
            <div style={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex', 
              height: '150px', 
              alignItems: 'flex-end',
              padding: '0 10px'
            }}>
              {processedData.frequencyData.map((value, index) => {
                // Highlight frequency range used for beat detection
                const nyquist = audioData?.audioContext.sampleRate ? audioData.audioContext.sampleRate / 2 : 22050;
                const frequency = index * nyquist / processedData.frequencyData.length;
                const isInRange = frequency >= beatOptions.frequencyRange.low && 
                                frequency <= beatOptions.frequencyRange.high;
                
                return (
                  <div
                    key={index}
                    style={{
                      width: `${100 / processedData.frequencyData.length}%`,
                      minWidth: '2px',
                      height: `${value * 100}%`,
                      backgroundColor: isInRange 
                        ? `hsl(${index / processedData.frequencyData.length * 120}, 100%, 50%)`
                        : `hsl(${index / processedData.frequencyData.length * 240}, 70%, 70%)`,
                      opacity: isInRange ? 1 : 0.5
                    }}
                  />
                );
              })}
            </div>
            
            {/* Beat pulse effect */}
            <div style={{
              width: `${beatSize}px`,
              height: `${beatSize}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              border: '2px solid rgba(76, 175, 80, 0.4)',
              transition: 'all 0.2s ease-out',
              position: 'absolute',
              zIndex: 10,
            }} />
            
            {/* Display time domain data */}
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100px',
              display: 'flex', 
              alignItems: 'center',
              padding: '0 10px'
            }}>
              <svg width="100%" height="100" style={{ display: 'block' }}>
                <polyline
                  points={processedData.timeData
                    .map((value, index) => `${index / processedData.timeData.length * 100},${ 50 + value * 40 }`)
                    .join(' ')}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </>
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#757575' }}>
        <p>
          The beat detection feature analyzes audio data to find energy peaks in the selected frequency range.
          Adjust parameters to optimize beat detection for different types of music.
        </p>
      </div>
    </div>
  );
};

export default BeatVisualizer; 