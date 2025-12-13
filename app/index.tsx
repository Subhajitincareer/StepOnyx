import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StepRing } from "../components/StepRing";
import { PedometerService } from "../services/PedometerService";
import { ActivityService, ActivityType } from "../services/ActivityService";
import { StorageService, DailyData } from "../services/StorageService";
import { useTheme } from "../context/ThemeContext";

// Motivational Quotes
const QUOTES = [
    "Every step counts! 🚀",
    "Keep moving forward! 💪",
    "You're doing great! 🌟",
    "One step at a time! 👣",
    "Stay active, stay healthy! 🏃",
    "Crush your goals today! 🔥",
    "Your body will thank you! 💚",
    "Small steps, big results! 📈",
    "Make today count! ⭐",
    "Push beyond limits! 🎯"
];


export default function Home() {
    const { colors } = useTheme();
    const [currentSteps, setCurrentSteps] = useState(0);
    const [activity, setActivity] = useState<ActivityType>('Rest');
    const [dailyGoal, setDailyGoal] = useState(10000);
    const [waterCount, setWaterCount] = useState(0);
    const [weekData, setWeekData] = useState<{ steps: number; dayName: string }[]>([]);
    const [dailyQuote, setDailyQuote] = useState("");

    // Track if goal was already celebrated today
    const goalCelebrated = useRef(false);

    // Get quote based on date (same quote for whole day)
    useEffect(() => {
        const dayIndex = new Date().getDate() % QUOTES.length;
        setDailyQuote(QUOTES[dayIndex]);
    }, []);

    // Haptic feedback when goal is reached!
    useEffect(() => {
        if (currentSteps >= dailyGoal && !goalCelebrated.current && dailyGoal > 0) {
            goalCelebrated.current = true;
            // Vibrate with success pattern!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [currentSteps, dailyGoal]);

    // Load saved data on mount/focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const savedSteps = await StorageService.getTodaySteps();
                const savedGoal = await StorageService.getGoal();
                const savedWater = await StorageService.getWater();
                const history = await StorageService.getHistory();

                setCurrentSteps(savedSteps);
                setDailyGoal(savedGoal);
                setWaterCount(savedWater);

                // Check if goal was already met when loading
                if (savedSteps >= savedGoal) {
                    goalCelebrated.current = true;
                }

                // Build last 7 days data for mini chart
                const days: { steps: number; dayName: string }[] = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(Date.now() - i * 86400000);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                    days.push({
                        steps: history[dateStr] || 0,
                        dayName
                    });
                }
                setWeekData(days);
            };
            loadData();
        }, [])
    );

    // Save steps
    useEffect(() => {
        if (currentSteps > 0) {
            StorageService.saveDailySteps(StorageService.getTodayDate(), currentSteps);
        }
    }, [currentSteps]);

    // Save water
    const updateWater = async (change: number) => {
        const newCount = Math.max(0, waterCount + change);
        setWaterCount(newCount);
        await StorageService.saveWater(StorageService.getTodayDate(), newCount);
    };

    useEffect(() => {
        let activitySubscription: any;

        const subscribe = async () => {
            await PedometerService.isAvailable();

            activitySubscription = ActivityService.subscribe(
                (type) => setActivity(type),
                () => setCurrentSteps((prev) => prev + 1)
            );
        };

        subscribe();

        return () => {
            activitySubscription && activitySubscription.remove();
        };
    }, []);

    // Mini chart max
    const maxSteps = Math.max(...weekData.map(d => d.steps), dailyGoal);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Today</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSub }]}>{dailyQuote}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Link href="/achievements" asChild>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
                            <Ionicons name="trophy-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </Link>
                    <Link href="/settings" asChild>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
                            <Ionicons name="options-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

            {/* Main Ring - Centerpiece */}
            <StepRing steps={currentSteps} goal={dailyGoal} />

            {/* Activity Status */}
            <View style={styles.activityContainer}>
                <View style={[
                    styles.activityDot,
                    activity === 'Running' ? { backgroundColor: colors.danger } :
                        activity === 'Walking' ? { backgroundColor: colors.success } :
                            { backgroundColor: colors.tint }
                ]} />
                <Text style={[styles.activityText, { color: colors.textSub }]}>
                    {activity === 'Rest' ? 'Resting' : activity}
                </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="flame-outline" size={20} color={colors.danger} style={styles.statIcon} />
                    <View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{(currentSteps * 0.04).toFixed(0)}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSub }]}>kcal</Text>
                    </View>
                </View>

                <View style={{ width: 16 }} />

                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="location-outline" size={20} color="#3b82f6" style={styles.statIcon} />
                    <View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{(currentSteps * 0.000762).toFixed(2)}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSub }]}>km</Text>
                    </View>
                </View>
            </View>

            {/* Mini Weekly Chart */}
            <Link href="/history" asChild>
                <TouchableOpacity style={[styles.miniChartContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.miniChartHeader}>
                        <Text style={[styles.miniChartTitle, { color: colors.text }]}>This Week</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
                    </View>
                    <View style={styles.miniChartBars}>
                        {weekData.map((day, index) => {
                            const barHeight = maxSteps > 0 ? (day.steps / maxSteps) * 50 : 0;
                            const isToday = index === 6;
                            const metGoal = day.steps >= dailyGoal;

                            return (
                                <View key={index} style={styles.miniBarColumn}>
                                    <View style={[styles.miniBarWrapper, { height: 50 }]}>
                                        <View
                                            style={[
                                                styles.miniBar,
                                                {
                                                    height: Math.max(barHeight, 4),
                                                    backgroundColor: metGoal ? colors.success : (isToday ? colors.accent : colors.tint),
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.miniDayLabel, { color: isToday ? colors.text : colors.textSub }]}>{day.dayName}</Text>
                                </View>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Link>

            {/* Water Tracker */}
            <View style={[styles.waterContainer, { backgroundColor: colors.card }]}>
                <View style={styles.waterInfo}>
                    <Ionicons name="water" size={24} color="#3b82f6" />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.waterTitle, { color: colors.text }]}>Water</Text>
                        <Text style={[styles.waterSubtitle, { color: colors.textSub }]}>{waterCount} / 8 glasses</Text>
                    </View>
                </View>
                <View style={styles.waterControls}>
                    <TouchableOpacity onPress={() => updateWater(-1)} style={[styles.waterButton, { backgroundColor: colors.tint }]}>
                        <Ionicons name="remove" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ width: 12 }} />
                    <TouchableOpacity onPress={() => updateWater(1)} style={[styles.waterButton, { backgroundColor: "#3b82f6" }]}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "flex-start",
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    iconButton: {
        padding: 12,
        borderRadius: 50,
    },
    activityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    activityText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    statIcon: {
        marginRight: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    miniChartContainer: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    miniChartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    miniChartTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    miniChartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    miniBarColumn: {
        alignItems: 'center',
        flex: 1,
    },
    miniBarWrapper: {
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
    },
    miniBar: {
        width: 16,
        borderRadius: 8,
        minHeight: 4,
    },
    miniDayLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 6,
    },
    waterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
    },
    waterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    waterTitle: {
        fontWeight: '700',
        fontSize: 16,
    },
    waterSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    waterControls: {
        flexDirection: 'row',
    },
    waterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
