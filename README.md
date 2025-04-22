# visualizer-hook

A custom React hook for processing and visualizing audio data from microphone input or audio files.

## Installation

```bash
npm install visualizer-hook
# or
yarn add visualizer-hook
```

## Features

- Audio recording from microphone using Web Audio API
- Analyze uploaded audio files
- Extract and process frequency and time domain data
- Identify dominant frequency and volume
- Beat detection and tempo analysis
- Calculate audio spectrum characteristics (spectral centroid, spread, flatness)
- Performance optimization with requestAnimationFrame
- Smoothing and normalization for fluid visualization effects
- Full TypeScript support

## Usage

### Basic Hook: `useAudioVisualizer`

```tsx
import React, { useState } from 'react';
import { useAudioVisualizer } from 'visualizer-hook';

const AudioVisualizer = () => {
  const { 
    audioData, 
    isRecording, 
    error, 
    startRecording, 
    stopRecording, 
    loadAudioFile 
  } = useAudioVisualizer();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudioFile(file);
    }
  };
  
  return (
    <div>
      <h1>Audio Visualizer</h1>
      
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
      
      {error && <div>Error: {error.message}</div>}
      
      {audioData && (
        <div>
          {/* Display frequency data */}
          <div style={{ display: 'flex', height: '100px' }}>
            {Array.from(audioData.frequencyData).map((value, index) => (
              <div
                key={index}
                style={{
                  width: '2px',
                  marginRight: '1px',
                  height: `${value / 2}px`,
                  backgroundColor: 'blue',
                  alignSelf: 'flex-end'
                }}
              />
            ))}
          </div>
          
          {/* Display time domain data */}
          <div style={{ display: 'flex', height: '100px', alignItems: 'center' }}>
            {Array.from(audioData.timeData).map((value, index) => (
              <div
                key={index}
                style={{
                  width: '2px',
                  marginRight: '1px',
                  height: `${Math.abs((value - 128) / 128) * 100}px`,
                  backgroundColor: 'green'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;
```

### Advanced Data Processing Hook: `useProcessedAudioData`

```tsx
import React from 'react';
import { useAudioVisualizer, useProcessedAudioData } from 'visualizer-hook';

const AdvancedVisualizer = () => {
  const { 
    audioData, 
    isRecording, 
    startRecording, 
    stopRecording 
  } = useAudioVisualizer();
  
  const processedData = useProcessedAudioData(audioData, {
    normalize: true,
    logarithmic: true,
    smoothing: 0.7
  });
  
  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop' : 'Start Recording'}
      </button>
      
      {processedData && (
        <div>
          <div>Volume: {Math.round(processedData.volume * 100)}%</div>
          <div>Dominant Frequency: {Math.round(processedData.dominant.frequency)} Hz</div>
          
          {/* Display normalized frequency data */}
          <div style={{ display: 'flex', height: '150px' }}>
            {processedData.frequencyData.map((value, index) => (
              <div
                key={index}
                style={{
                  width: '3px',
                  marginRight: '1px',
                  height: `${value * 150}px`,
                  backgroundColor: `hsl(${index / processedData.frequencyData.length * 360}, 100%, 50%)`,
                  alignSelf: 'flex-end'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedVisualizer;
```

### Beat Detection Hook: `useBeatDetection`

```tsx
import React, { useState, useEffect } from 'react';
import { useAudioVisualizer, useBeatDetection } from 'visualizer-hook';

const BeatDetectionDemo = () => {
  const { audioData, isRecording, startRecording, stopRecording } = useAudioVisualizer();
  
  const [circleSize, setCircleSize] = useState(100);
  
  const beatInfo = useBeatDetection(audioData, {
    threshold: 0.15,
    frequencyRange: {
      low: 40,
      high: 120
    }
  });
  
  // Create pulse effect when a beat is detected
  useEffect(() => {
    if (beatInfo.isBeat) {
      setCircleSize(200);
      setTimeout(() => setCircleSize(100), 100);
    }
  }, [beatInfo.isBeat]);
  
  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop' : 'Start Recording'}
      </button>
      
      <div>
        <div>Tempo: {beatInfo.tempo || '-'} BPM</div>
        <div>Beats Detected: {beatInfo.beats}</div>
      </div>
      
      {/* Circle pulse effect when beat detected */}
      <div
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          borderRadius: '50%',
          backgroundColor: beatInfo.isBeat ? '#ff0000' : '#3498db',
          transition: 'all 0.1s ease',
          margin: '20px auto'
        }}
      />
    </div>
  );
};

export default BeatDetectionDemo;
```

## API

### `useAudioVisualizer(options?: AudioVisualizerOptions)`

The main hook for capturing and analyzing audio.

#### Parameters

- **options** (optional): Configuration for the analyzer
  - `fftSize`: FFT size (default: 2048)
  - `smoothingTimeConstant`: Smoothing factor (default: 0.8)
  - `minDecibels`: Minimum decibel value (default: -100)
  - `maxDecibels`: Maximum decibel value (default: -30)

#### Return Value

- **audioData**: Raw audio data from the analyzer
- **isRecording**: Recording state
- **error**: Error if any
- **startRecording**: Function to start recording from microphone
- **stopRecording**: Function to stop recording
- **loadAudioFile**: Function to load and analyze an audio file

### `useProcessedAudioData(audioData, options?)`

Hook for processing raw audio data into a format suitable for visualization.

#### Parameters

- **audioData**: Raw audio data from `useAudioVisualizer`
- **options** (optional): Processing configuration
  - `normalize`: Normalize data to 0-1 range (default: true)
  - `logarithmic`: Apply logarithmic scaling (default: false)
  - `smoothing`: Transition smoothing factor (0-1, default: 0.5)
  - `frequencyBands`: Custom frequency bands for analysis

#### Return Value

Object containing processed data:

- **frequencyData**: Processed frequency data array
- **timeData**: Processed time domain data array
- **volume**: Current volume level (0-1)
- **peakLevel**: Peak level detected
- **isActive**: Whether audio is currently active
- **dominant**: Information about dominant frequency

### `useBeatDetection(audioData, options?)`

Hook for detecting beats from audio data.

#### Parameters

- **audioData**: Raw audio data from `useAudioVisualizer`
- **options** (optional): Beat detection configuration
  - `threshold`: Detection threshold (0-1, default: 0.15)
  - `decayRate`: Decay rate (default: 0.98)
  - `minTimeBetweenBeats`: Minimum time between beats (ms, default: 250)
  - `frequencyRange`: Frequency range for beat detection (default: 60-120Hz)

#### Return Value

Object containing beat information:

- **isBeat**: Whether a beat is detected
- **energy**: Current energy in the frequency range
- **averageEnergy**: Average energy over time
- **delta**: Energy difference
- **tempo**: Estimated tempo (BPM)
- **beats**: Number of beats detected
- **updateOptions**: Function to update detection options
- **reset**: Function to reset the beat detector

## Utility Functions

This library also provides several utility functions for processing audio data:

- **processAudioData**: Process raw audio data
- **extractFrequencyBands**: Extract frequency bands from frequency data
- **calculateSpectrumCharacteristics**: Calculate audio spectrum characteristics
- **BeatDetector**: Beat detection class
- **TempoAnalyzer**: Tempo analysis class from beat data
- **createBeatAnalyzer**: Function to create a beat detection tool

## Examples

See more examples in the `/examples` directory in the repository:

- `/examples/basic`: Basic example of audio visualization
- `/examples/beat-detection`: Example of beat detection and beat-triggered effects

## License

MIT
