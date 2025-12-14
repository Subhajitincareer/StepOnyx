import { AchievementService } from '../AchievementService';
import { StorageService, DailyData } from '../StorageService';

// Mock StorageService
jest.mock('../StorageService', () => ({
    StorageService: {
        getHistory: jest.fn(() => Promise.resolve({})),
        getGoal: jest.fn(() => Promise.resolve(10000)),
        getTodaySteps: jest.fn(() => Promise.resolve(0)),
    }
}));

// Mock asset requires
jest.mock('../../assets/badge_streak.png', () => 'badge_streak');
jest.mock('../../assets/badge_10k.png', () => 'badge_10k');
jest.mock('../../assets/badge_lifetime.png', () => 'badge_lifetime');
jest.mock('../../assets/badge_early_bird.png', () => 'badge_early_bird');
jest.mock('../../assets/badge_night_owl.png', () => 'badge_night_owl');
jest.mock('../../assets/badge_weekend.png', () => 'badge_weekend');

describe('AchievementService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('calculateStreak', () => {
        it('should return 0 for empty history', () => {
            const streak = AchievementService.calculateStreak({});
            expect(streak).toBe(0);
        });

        it('should return 1 for single active today', () => {
            const today = new Date().toISOString().split('T')[0];
            const history: DailyData = { [today]: 5000 };

            const streak = AchievementService.calculateStreak(history);

            expect(streak).toBe(1);
        });

        it('should count consecutive days', () => {
            const today = new Date();
            const history: DailyData = {};

            // Add 5 consecutive days
            for (let i = 0; i < 5; i++) {
                const d = new Date(today.getTime() - i * 86400000);
                const dateStr = d.toISOString().split('T')[0];
                history[dateStr] = 2000; // Above 1000 threshold
            }

            const streak = AchievementService.calculateStreak(history);

            expect(streak).toBe(5);
        });

        it('should break streak on inactive day', () => {
            const today = new Date();
            const history: DailyData = {};

            // Today active
            history[today.toISOString().split('T')[0]] = 2000;
            // Yesterday inactive (skip)
            // Day before yesterday active
            const dayBeforeYesterday = new Date(today.getTime() - 2 * 86400000);
            history[dayBeforeYesterday.toISOString().split('T')[0]] = 2000;

            const streak = AchievementService.calculateStreak(history);

            expect(streak).toBe(1); // Only today counts
        });

        it('should not count days below 1000 steps', () => {
            const today = new Date().toISOString().split('T')[0];
            const history: DailyData = { [today]: 500 };

            const streak = AchievementService.calculateStreak(history);

            expect(streak).toBe(0);
        });
    });

    describe('getLevel', () => {
        it('should return Beginner for 0 steps', () => {
            const result = AchievementService.getLevel(0);

            expect(result.current.level).toBe(1);
            expect(result.current.title).toBe('Beginner');
        });

        it('should return Walker for 10000+ steps', () => {
            const result = AchievementService.getLevel(15000);

            expect(result.current.level).toBe(2);
            expect(result.current.title).toBe('Walker');
        });

        it('should return Jogger for 50000+ steps', () => {
            const result = AchievementService.getLevel(75000);

            expect(result.current.level).toBe(3);
            expect(result.current.title).toBe('Jogger');
        });

        it('should return Legend for 1000000+ steps', () => {
            const result = AchievementService.getLevel(1500000);

            expect(result.current.level).toBe(7);
            expect(result.current.title).toBe('Legend');
            expect(result.progress).toBe(1); // Max level
        });

        it('should calculate progress correctly', () => {
            // Walker level: 10000 - 50000
            // At 30000, should be 50% through
            const result = AchievementService.getLevel(30000);

            expect(result.current.title).toBe('Walker');
            expect(result.progress).toBeCloseTo(0.5, 1);
        });
    });

    describe('getBadges', () => {
        it('should return 6 badges', async () => {
            (StorageService.getHistory as jest.Mock).mockResolvedValueOnce({});

            const badges = await AchievementService.getBadges();

            expect(badges).toHaveLength(6);
        });

        it('should unlock 10K Club badge for 10000+ steps day', async () => {
            const today = new Date().toISOString().split('T')[0];
            (StorageService.getHistory as jest.Mock).mockResolvedValueOnce({
                [today]: 12000
            });

            const badges = await AchievementService.getBadges();
            const club10k = badges.find(b => b.id === 'club_10k');

            expect(club10k?.unlocked).toBe(true);
        });

        it('should unlock Marathoner badge for 50000+ total steps', async () => {
            (StorageService.getHistory as jest.Mock).mockResolvedValueOnce({
                '2024-01-10': 15000,
                '2024-01-11': 20000,
                '2024-01-12': 20000,
            });

            const badges = await AchievementService.getBadges();
            const marathoner = badges.find(b => b.id === 'lifetime_50k');

            expect(marathoner?.unlocked).toBe(true);
        });

        it('should unlock Weekend Warrior for Saturday activity', async () => {
            // Find a Saturday date
            const today = new Date();
            const daysUntilSat = (6 - today.getDay() + 7) % 7;
            const saturday = new Date(today.getTime() - (7 - daysUntilSat) * 86400000);
            // Adjust to be a past Saturday
            if (saturday > today) {
                saturday.setDate(saturday.getDate() - 7);
            }
            const satStr = saturday.toISOString().split('T')[0];

            (StorageService.getHistory as jest.Mock).mockResolvedValueOnce({
                [satStr]: 6000
            });

            const badges = await AchievementService.getBadges();
            const weekend = badges.find(b => b.id === 'weekend_warrior');

            expect(weekend?.unlocked).toBe(true);
        });
    });

    describe('getDailyChallenge', () => {
        it('should return a challenge object', async () => {
            const challenge = await AchievementService.getDailyChallenge();

            expect(challenge).toHaveProperty('id');
            expect(challenge).toHaveProperty('title');
            expect(challenge).toHaveProperty('description');
            expect(challenge).toHaveProperty('targetSteps');
            expect(challenge).toHaveProperty('completed');
            expect(challenge).toHaveProperty('progress');
        });

        it('should mark challenge as completed when steps exceed target', async () => {
            (StorageService.getGoal as jest.Mock).mockResolvedValueOnce(10000);
            (StorageService.getTodaySteps as jest.Mock).mockResolvedValueOnce(15000);

            const challenge = await AchievementService.getDailyChallenge();

            // Most challenges multiply goal, so 15000 should complete any reasonable challenge
            expect(challenge.progress).toBeGreaterThanOrEqual(1);
        });
    });
});
