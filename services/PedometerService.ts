import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export const PedometerService = {
    isAvailable: async (): Promise<boolean> => {
        if (Platform.OS === 'web') return false;
        return await Pedometer.isAvailableAsync();
    },

    getDailySteps: async (): Promise<number> => {
        // Android does not support getting past steps with getStepCountAsync
        if (Platform.OS === 'android') return 0;

        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        try {
            if (await Pedometer.isAvailableAsync()) {
                const result = await Pedometer.getStepCountAsync(start, end);
                return result.steps;
            }
        } catch (error) {
            console.warn("Pedometer getStepCountAsync failed", error);
        }
        return 0;
    },

    watchSteps: (callback: (steps: number) => void) => {
        if (Platform.OS === 'web') return null;
        return Pedometer.watchStepCount((result) => {
            callback(result.steps);
        });
    }
};
