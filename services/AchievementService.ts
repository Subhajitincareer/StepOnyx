import { StorageService, DailyData } from './StorageService';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Ionicon name instead of image
    iconColor: string;
    unlocked: boolean;
    progress: number;
    progressText: string;
}

export interface Level {
    level: number;
    title: string;
    minSteps: number;
    maxSteps: number;
}

export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    targetSteps: number;
    completed: boolean;
    progress: number;
}

// Level definitions
const LEVELS: Level[] = [
    { level: 1, title: 'Beginner', minSteps: 0, maxSteps: 10000 },
    { level: 2, title: 'Walker', minSteps: 10000, maxSteps: 50000 },
    { level: 3, title: 'Jogger', minSteps: 50000, maxSteps: 100000 },
    { level: 4, title: 'Runner', minSteps: 100000, maxSteps: 250000 },
    { level: 5, title: 'Athlete', minSteps: 250000, maxSteps: 500000 },
    { level: 6, title: 'Champion', minSteps: 500000, maxSteps: 1000000 },
    { level: 7, title: 'Legend', minSteps: 1000000, maxSteps: Infinity },
];

// Challenge templates
const CHALLENGE_TEMPLATES = [
    { title: 'Step Up!', description: 'Walk {target} steps today', targetMultiplier: 1.2 },
    { title: 'Power Walk', description: 'Hit {target} steps before dinner', targetMultiplier: 1.5 },
    { title: 'Easy Day', description: 'Maintain {target} steps', targetMultiplier: 0.8 },
    { title: 'Push Limits', description: 'Challenge yourself with {target} steps', targetMultiplier: 1.3 },
];

export const AchievementService = {
    // Calculate current streak
    calculateStreak: (history: DailyData): number => {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let streak = 0;
        let currentDateCheck: string | null = null;

        if (history[today] && history[today] >= 1000) {
            streak = 1;
            currentDateCheck = yesterdayDate;
        } else if (history[yesterdayDate] && history[yesterdayDate] >= 1000) {
            streak = 1;
            const d = new Date(Date.now() - 86400000 * 2);
            currentDateCheck = d.toISOString().split('T')[0];
        } else {
            return 0;
        }

        while (currentDateCheck) {
            if (history[currentDateCheck] && history[currentDateCheck] >= 1000) {
                streak++;
                const d = new Date(currentDateCheck);
                d.setDate(d.getDate() - 1);
                currentDateCheck = d.toISOString().split('T')[0];
            } else {
                break;
            }
        }

        return streak;
    },

    // Get user level
    getLevel: (totalSteps: number): { current: Level; progress: number } => {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (totalSteps >= LEVELS[i].minSteps) {
                const current = LEVELS[i];
                const progress = current.maxSteps === Infinity
                    ? 1
                    : (totalSteps - current.minSteps) / (current.maxSteps - current.minSteps);
                return { current, progress: Math.min(progress, 1) };
            }
        }
        return { current: LEVELS[0], progress: 0 };
    },

    // Get daily challenge
    getDailyChallenge: async (): Promise<DailyChallenge> => {
        const goal = await StorageService.getGoal();
        const todaySteps = await StorageService.getTodaySteps();

        const dayIndex = new Date().getDate() % CHALLENGE_TEMPLATES.length;
        const template = CHALLENGE_TEMPLATES[dayIndex];

        const targetSteps = Math.round((goal * template.targetMultiplier) / 1000) * 1000;
        const completed = todaySteps >= targetSteps;
        const progress = Math.min(todaySteps / targetSteps, 1);

        return {
            id: `challenge_${new Date().toISOString().split('T')[0]}`,
            title: template.title,
            description: template.description.replace('{target}', targetSteps.toLocaleString()),
            targetSteps,
            completed,
            progress
        };
    },

    // Get all badges (using icons instead of images)
    getBadges: async (): Promise<Badge[]> => {
        const history = await StorageService.getHistory();
        const streak = AchievementService.calculateStreak(history);
        const totalSteps = Object.values(history).reduce((a, b) => a + b, 0);
        const maxDailySteps = Math.max(...Object.values(history), 0);

        // Check weekend activity
        let hasWeekendActivity = false;
        Object.keys(history).forEach(dateStr => {
            const d = new Date(dateStr);
            const day = d.getDay();
            if ((day === 0 || day === 6) && history[dateStr] >= 5000) {
                hasWeekendActivity = true;
            }
        });

        return [
            {
                id: 'streak_7',
                name: 'Hot Streak',
                description: '7-day active streak',
                icon: 'flame',
                iconColor: '#f97316',
                unlocked: streak >= 7,
                progress: Math.min(streak / 7, 1),
                progressText: `${streak}/7 Days`
            },
            {
                id: 'club_10k',
                name: '10K Club',
                description: '10,000 steps in one day',
                icon: 'footsteps',
                iconColor: '#3b82f6',
                unlocked: maxDailySteps >= 10000,
                progress: Math.min(maxDailySteps / 10000, 1),
                progressText: maxDailySteps >= 10000 ? 'Unlocked!' : `${(maxDailySteps / 1000).toFixed(1)}k/10k`
            },
            {
                id: 'lifetime_50k',
                name: 'Marathoner',
                description: '50,000 total lifetime steps',
                icon: 'trophy',
                iconColor: '#eab308',
                unlocked: totalSteps >= 50000,
                progress: Math.min(totalSteps / 50000, 1),
                progressText: `${(totalSteps / 1000).toFixed(0)}k/50k`
            },
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Walk 1000+ steps by 8 AM',
                icon: 'sunny',
                iconColor: '#f59e0b',
                unlocked: false,
                progress: 0,
                progressText: 'Walk early!'
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Hit 5000 steps after 8 PM',
                icon: 'moon',
                iconColor: '#8b5cf6',
                unlocked: false,
                progress: 0,
                progressText: 'Walk late!'
            },
            {
                id: 'weekend_warrior',
                name: 'Weekend Warrior',
                description: '5000+ steps on weekend',
                icon: 'calendar',
                iconColor: '#22c55e',
                unlocked: hasWeekendActivity,
                progress: hasWeekendActivity ? 1 : 0,
                progressText: hasWeekendActivity ? 'Unlocked!' : 'Walk Sat/Sun'
            }
        ];
    }
};
