import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
}));

// Import after mocking
import { StorageService } from '../StorageService';

describe('StorageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodayDate', () => {
        it('should return date in YYYY-MM-DD format', () => {
            const date = StorageService.getTodayDate();
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should return today\'s date', () => {
            const expected = new Date().toISOString().split('T')[0];
            const result = StorageService.getTodayDate();
            expect(result).toBe(expected);
        });
    });

    describe('saveDailySteps', () => {
        it('should save steps to AsyncStorage', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{}');

            await StorageService.saveDailySteps('2024-01-15', 5000);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'stepmaster_history_v1',
                JSON.stringify({ '2024-01-15': 5000 })
            );
        });

        it('should merge with existing history', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
                JSON.stringify({ '2024-01-14': 3000 })
            );

            await StorageService.saveDailySteps('2024-01-15', 5000);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'stepmaster_history_v1',
                JSON.stringify({ '2024-01-14': 3000, '2024-01-15': 5000 })
            );
        });
    });

    describe('getTodaySteps', () => {
        it('should return 0 if no steps recorded', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{}');

            const steps = await StorageService.getTodaySteps();

            expect(steps).toBe(0);
        });

        it('should return saved steps for today', async () => {
            const today = new Date().toISOString().split('T')[0];
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
                JSON.stringify({ [today]: 7500 })
            );

            const steps = await StorageService.getTodaySteps();

            expect(steps).toBe(7500);
        });
    });

    describe('getHistory', () => {
        it('should return empty object if no history', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

            const history = await StorageService.getHistory();

            expect(history).toEqual({});
        });

        it('should return parsed history', async () => {
            const mockHistory = { '2024-01-14': 3000, '2024-01-15': 5000 };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
                JSON.stringify(mockHistory)
            );

            const history = await StorageService.getHistory();

            expect(history).toEqual(mockHistory);
        });
    });

    describe('Goal Management', () => {
        it('should return default goal of 10000 if none saved', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

            const goal = await StorageService.getGoal();

            expect(goal).toBe(10000);
        });

        it('should return saved goal', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('15000');

            const goal = await StorageService.getGoal();

            expect(goal).toBe(15000);
        });

        it('should save goal correctly', async () => {
            await StorageService.saveGoal(8000);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'stepmaster_goal',
                '8000'
            );
        });
    });

    describe('Water Tracking', () => {
        it('should return 0 if no water recorded', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

            const water = await StorageService.getWater();

            expect(water).toBe(0);
        });

        it('should return saved water count', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('5');

            const water = await StorageService.getWater('2024-01-15');

            expect(water).toBe(5);
        });
    });
});
