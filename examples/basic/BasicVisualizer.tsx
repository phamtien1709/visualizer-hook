import React, { useState } from 'react';
import { useAudioVisualizer, useProcessedAudioData } from '../../src';

/**
 * Component demonstrating basic usage of visualizer-hook
 */
const BasicVisualizer: React.FC = () => {
  const { 
    audioData, 
    isRecording, 
    error, 
    startRecording, 
    stopRecording, 
    loadAudioFile 
  } = useAudioVisualizer({
    fftSize: 1024,  // Reduce FFT size to improve performance
    smoothingTimeConstant: 0.7
  });
  
  const processedData = useProcessedAudioData(audioData, {
    normalize: true,
    smoothing: 0.5
  });
  
  const [visualizationType, setVisualizationType] = useState<'frequency' | 'waveform'>('frequency');
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudioFile(file);
    }
  };
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Audio Visualizer</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
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
          style={{ margin: '10px 0' }}
        />
        
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="visualizationType"
              checked={visualizationType === 'frequency'}
              onChange={() => setVisualizationType('frequency')}
            />
            Frequency Chart
          </label>
          <label>
            <input
              type="radio"
              name="visualizationType"
              checked={visualizationType === 'waveform'}
              onChange={() => setVisualizationType('waveform')}
            />
            Waveform Chart
          </label>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error.message}
        </div>
      )}
      
      {processedData && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Volume: {Math.round(processedData.volume * 100)}%</div>
              <div>Dominant Frequency: {Math.round(processedData.dominant.frequency)} Hz</div>
              <div>Peak Amplitude: {Math.round(processedData.peakLevel * 100)}%</div>
            </div>
            
            {/* Volume level bar */}
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden',
              marginTop: '10px'
            }}>
              <div style={{ 
                width: `${processedData.volume * 100}%`, 
                height: '100%', 
                backgroundColor: processedData.isActive ? '#4CAF50' : '#9E9E9E',
                transition: 'width 0.1s ease-in-out'
              }} />
            </div>
          </div>
          
          {/* Visualizer container */}
          <div style={{ 
            height: '200px', 
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            padding: '10px',
            position: 'relative'
          }}>
            {visualizationType === 'frequency' ? (
              /* Frequency spectrum chart */
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}>
                {processedData.frequencyData.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      width: `${100 / processedData.frequencyData.length}%`,
                      maxWidth: '8px',
                      minWidth: '2px',
                      height: `${value * 100}%`,
                      backgroundColor: `hsl(${index / processedData.frequencyData.length * 240}, 100%, 50%)`,
                      margin: '0 1px'
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Waveform chart */
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                alignItems: 'center',
                position: 'relative' 
              }}>
                {processedData.timeData.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${index / processedData.timeData.length * 100}%`,
                      height: `${Math.abs(value) * 100}%`,
                      width: '2px',
                      backgroundColor: '#2196F3',
                      transform: `translateY(${value > 0 ? '-50%' : '50%'})`,
                    }}
                  />
                ))}
                
                {/* Center line */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#bdbdbd',
                  top: '50%'
                }} />
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#757575' }}>
        <p>
          Using visualizer-hook to capture and analyze audio.
          You can record from microphone or upload audio files.
        </p>
      </div>
    </div>
  );
};

export default BasicVisualizer; 