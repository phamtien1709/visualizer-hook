# Beat Detection Example with visualizer-hook

This example demonstrates how to use the beat detection feature in visualizer-hook to create visual effects synchronized with audio beats.

## Features

- Beat detection from microphone input or audio files
- Analysis and display of tempo (BPM)
- Customizable beat detection parameters
- Visual effects triggered by beats
- Highlighting of frequency ranges used for beat detection

## Customizing Beat Detection

Adjustable parameters:

1. **Detection Threshold**:
   - Determines the energy level required to consider a beat
   - Lower values detect more beats but may cause false positives
   - Higher values only detect stronger beats

2. **Frequency Range**:
   - Defines the frequency range considered when detecting beats
   - Bass music typically falls in the 60-120Hz range
   - Hand claps typically fall in the 200-300Hz range

## Understanding the Algorithm

The beat detection algorithm works based on these principles:

1. Isolate a specific frequency range from audio frequency data
2. Calculate current energy in that frequency range
3. Maintain an average energy level over time
4. Compare current energy with the average level
5. Detect a beat when energy exceeds the threshold and sufficient time has passed since the last beat

## Creating Effects

Based on beat detection, you can create various effects such as:

- Pulse or flash effects
- Size or color changes of objects
- Synchronizing movements or animations with audio beats

In this example, we use a simple pulse effect when a beat is detected.

## References

- `useBeatDetection` hook - Beat detection hook
- `BeatDetector` - Main beat detection processing class
- `TempoAnalyzer` - Tempo analysis from detected beats
