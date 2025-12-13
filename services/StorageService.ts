import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'stepmaster_history_v1';
const GOAL_KEY = 'stepmaster_goal';

export interface DailyData {
    [date: string]: number; // "YYYY-MM-DD": steps
}

export const StorageService = {
    // Get today's date string in YYYY-MM-DD format
    getTodayDate: (): string => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },

    // Save steps for a specific day (overwrites/updates)
    saveDailySteps: async (date: string, steps: number) => {
        try {
            const history = await StorageService.getHistory();
            history[date] = steps;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save steps", e);
        }
    },

    // Get strictly today's saved steps
    getTodaySteps: async (): Promise<number> => {
        try {
            const history = await StorageService.getHistory();
            const today = StorageService.getTodayDate();
            return history[today] || 0;
        } catch (e) {
            return 0;
        }
    },

    // Get all history
    getHistory: async (): Promise<DailyData> => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            return json != null ? JSON.parse(json) : {};
        } catch (e) {
            console.error("Failed to load history", e);
            return {};
        }
    },

    // --- Water Tracking ---
    async getWater(date: string = StorageService.getTodayDate()): Promise<number> {
        try {
            const val = await AsyncStorage.getItem(`water_${date}`);
            return val ? parseInt(val, 10) : 0;
        } catch (e) {
            console.error(e);
            return 0;
        }
    },

    async saveWater(date: string, count: number): Promise<void> {
        try {
            await AsyncStorage.setItem(`water_${date}`, count.toString());
        } catch (e) {
            console.error(e);
        }
    },

    // Get Goal (default 10000)
    getGoal: async (): Promise<number> => {
        try {
            const goal = await AsyncStorage.getItem(GOAL_KEY);
            return goal ? parseInt(goal) : 10000;
        } catch (e) {
            return 10000;
        }
    },

    // Save Goal
    saveGoal: async (goal: number) => {
        try {
            await AsyncStorage.setItem(GOAL_KEY, goal.toString());
        } catch (e) {
            console.error("Failed to save goal", e);
        }
    }
};
