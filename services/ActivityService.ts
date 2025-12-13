import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

export type ActivityType = 'Rest' | 'Walking' | 'Running';

let lastStepTime = 0;
let stepCount = 0;
let recentMagnitudes: number[] = [];
const BUFFER_SIZE = 20; // Increased buffer for smoother text

export const ActivityService = {
    subscribe: (
        onActivityChange: (activity: ActivityType) => void,
        onStepDetected?: () => void
    ) => {
        if (Platform.OS === 'web') return { remove: () => { } };

        // Fast update for accurate peak detection
        Accelerometer.setUpdateInterval(100);

        return Accelerometer.addListener((data) => {
            const { x, y, z } = data;
            const magnitude = Math.sqrt(x * x + y * y + z * z);

            // 1. Signal Smoothing (Moving Average)
            recentMagnitudes.push(magnitude);
            if (recentMagnitudes.length > BUFFER_SIZE) {
                recentMagnitudes.shift();
            }
            const smoothedMagnitude = recentMagnitudes.reduce((a, b) => a + b, 0) / recentMagnitudes.length;

            // 2. Activity Type Detection
            let type: ActivityType = 'Rest';

            // LOGIC FIX: If we detected a step recently (within 2 seconds), we are definitely walking.
            // This overrides the smoothed average which might be dragged down by the "rest" between steps.
            const timeSinceLastStep = Date.now() - lastStepTime;

            if (timeSinceLastStep < 2000) {
                type = 'Walking';
                if (smoothedMagnitude >= 1.6) type = 'Running';
            } else {
                // Fallback to magnitude check if no recent steps
                if (smoothedMagnitude > 1.1 && smoothedMagnitude < 1.6) {
                    type = 'Walking';
                } else if (smoothedMagnitude >= 1.6) {
                    type = 'Running';
                } else {
                    type = 'Rest';
                }
            }
            onActivityChange(type);

            // 3. Software Step Counting (Peak Detection)
            // Tuning for "2 steps counted as 1" -> usually means we miss the intermediate lighter step or lockout is too long.
            // threshold: 1.08 (very sensitive)
            // lockout: 200ms (very fast)
            const now = Date.now();
            if (magnitude > 1.08 && (now - lastStepTime > 200)) {
                lastStepTime = now;
                if (onStepDetected) {
                    onStepDetected();
                }
            }
        });
    }
};
