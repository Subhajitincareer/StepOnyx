import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AchievementService, Badge, DailyChallenge, Level } from '../services/AchievementService';
import { StorageService } from '../services/StorageService';

export default function Achievements() {
    const { colors } = useTheme();
    const router = useRouter();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState<{ current: Level; progress: number } | null>(null);
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
    const [totalSteps, setTotalSteps] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const badgeData = await AchievementService.getBadges();
            const history = await StorageService.getHistory();
            const total = Object.values(history).reduce((a, b) => a + b, 0);
            const challengeData = await AchievementService.getDailyChallenge();

            const streakBadge = badgeData.find(b => b.id === 'streak_7');
            if (streakBadge) {
                const val = parseInt(streakBadge.progressText.split('/')[0]);
                setStreak(val);
            }

            setBadges(badgeData);
            setTotalSteps(total);
            setLevel(AchievementService.getLevel(total));
            setChallenge(challengeData);
        };
        loadData();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Achievements</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Level Card */}
                {level && (
                    <View style={[styles.levelCard, { backgroundColor: colors.card }]}>
                        <View style={styles.levelHeader}>
                            <View style={[styles.levelBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.levelNumber, { color: colors.background }]}>{level.current.level}</Text>
                            </View>
                            <View style={{ marginLeft: 16, flex: 1 }}>
                                <Text style={[styles.levelTitle, { color: colors.text }]}>{level.current.title}</Text>
                                <Text style={[styles.levelSteps, { color: colors.textSub }]}>{totalSteps.toLocaleString()} total steps</Text>
                            </View>
                        </View>
                        <View style={[styles.levelProgressBg, { backgroundColor: colors.tint }]}>
                            <View style={[styles.levelProgressFill, { width: `${level.progress * 100}%`, backgroundColor: colors.success }]} />
                        </View>
                        <Text style={[styles.levelProgressText, { color: colors.textSub }]}>
                            {level.current.maxSteps === Infinity
                                ? 'Max Level!'
                                : `${(level.current.maxSteps - totalSteps).toLocaleString()} steps to next level`}
                        </Text>
                    </View>
                )}

                {/* Daily Challenge */}
                {challenge && (
                    <View style={[styles.challengeCard, { backgroundColor: challenge.completed ? colors.success + '20' : colors.card, borderColor: challenge.completed ? colors.success : 'transparent', borderWidth: challenge.completed ? 2 : 0 }]}>
                        <View style={styles.challengeHeader}>
                            <Ionicons name={challenge.completed ? "checkmark-circle" : "flash"} size={24} color={challenge.completed ? colors.success : colors.accent} />
                            <Text style={[styles.challengeLabel, { color: colors.textSub }]}>Today's Challenge</Text>
                        </View>
                        <Text style={[styles.challengeName, { color: colors.text }]}>{challenge.title}</Text>
                        <Text style={[styles.challengeDesc, { color: colors.textSub }]}>{challenge.description}</Text>
                        <View style={[styles.progressBg, { backgroundColor: colors.tint }]}>
                            <View style={[styles.progressFill, { width: `${challenge.progress * 100}%`, backgroundColor: challenge.completed ? colors.success : colors.accent }]} />
                        </View>
                        <Text style={[styles.progressText, { color: challenge.completed ? colors.success : colors.textSub }]}>
                            {challenge.completed ? '✓ Completed!' : `${Math.round(challenge.progress * 100)}% done`}
                        </Text>
                    </View>
                )}

                {/* Streak Card */}
                <View style={[styles.streakCard, { backgroundColor: colors.card }]}>
                    <View>
                        <Text style={[styles.streakLabel, { color: colors.textSub }]}>Current Streak</Text>
                        <Text style={[styles.streakValue, { color: colors.text }]}>{streak} <Text style={{ fontSize: 20 }}>Days</Text></Text>
                    </View>
                    <View style={[styles.streakIcon, { backgroundColor: '#f97316' + '20' }]}>
                        <Ionicons name="flame" size={40} color="#f97316" />
                    </View>
                </View>

                {/* Badges Grid */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges ({badges.filter(b => b.unlocked).length}/{badges.length})</Text>
                <View style={styles.grid}>
                    {badges.map((badge) => (
                        <View
                            key={badge.id}
                            style={[
                                styles.badgeCard,
                                { backgroundColor: colors.card, borderColor: badge.unlocked ? colors.success : 'transparent', borderWidth: badge.unlocked ? 2 : 0 }
                            ]}
                        >
                            <View style={[styles.badgeIconContainer, { backgroundColor: badge.iconColor + '20', opacity: badge.unlocked ? 1 : 0.4 }]}>
                                <Ionicons name={badge.icon as any} size={36} color={badge.iconColor} />
                            </View>
                            <Text style={[styles.badgeName, { color: colors.text, opacity: badge.unlocked ? 1 : 0.5 }]}>{badge.name}</Text>
                            <Text style={[styles.badgeDesc, { color: colors.textSub }]} numberOfLines={2}>{badge.description}</Text>

                            <View style={[styles.progressBg, { backgroundColor: colors.tint }]}>
                                <View style={[styles.progressFill, { width: `${badge.progress * 100}%`, backgroundColor: badge.unlocked ? colors.success : colors.accent }]} />
                            </View>
                            <Text style={[styles.progressText, { color: colors.textSub }]}>{badge.progressText}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        paddingBottom: 40,
    },
    // Level
    levelCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    levelBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelNumber: {
        fontSize: 24,
        fontWeight: '800',
    },
    levelTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    levelSteps: {
        fontSize: 14,
        marginTop: 2,
    },
    levelProgressBg: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    levelProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    levelProgressText: {
        fontSize: 12,
        textAlign: 'center',
    },
    // Challenge
    challengeCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    challengeLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    challengeName: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    challengeDesc: {
        fontSize: 14,
        marginBottom: 16,
    },
    // Streak
    streakCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    streakLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    streakValue: {
        fontSize: 40,
        fontWeight: '800',
    },
    streakIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    badgeCard: {
        width: '48%',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    badgeName: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    badgeDesc: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 14,
    },
    progressBg: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 10,
        fontWeight: '600',
    }
});
