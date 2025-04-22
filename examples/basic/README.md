# Basic Usage Example for visualizer-hook

This example demonstrates the basic usage of visualizer-hook to create a simple audio visualizer.

## Features

- Record audio from microphone
- Load and analyze audio files
- Display frequency spectrum visualization
- Display waveform visualization
- Show information about volume, dominant frequency, and peak amplitude

## Running the Example

1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Run the build command: `npm run build` or `yarn build`
4. Run the example app: `npm run examples` or `yarn examples`

## Understanding the Code

In this example, we use:

- `useAudioVisualizer` hook to capture and analyze audio
- `useProcessedAudioData` hook to process raw audio data
- React state to manage the visualization type (frequency or waveform)

Main components:

- Controls to start/stop recording and load audio files
- Audio information display (volume, frequency, etc.)
- Visual representation of audio data as charts

## Customization

You can experiment by changing parameters:

- `fftSize` (256, 512, 1024, 2048, etc.) affects analysis detail
- `smoothing` affects the smoothness of the effect
- `normalize` and `logarithmic` affect how data is processed

## References

See the API documentation in the main README.md of the repository
