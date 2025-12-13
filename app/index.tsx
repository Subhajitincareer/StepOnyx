import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Link, useFocusEffect } from "expo-router";
import { Pedometer } from "expo-sensors";
import { Ionicons } from '@expo/vector-icons';
import { StepRing } from "../components/StepRing";
import { PedometerService } from "../services/PedometerService";
import { ActivityService, ActivityType } from "../services/ActivityService";
import { StorageService } from "../services/StorageService";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
    const { colors, theme } = useTheme();
    const [currentSteps, setCurrentSteps] = useState(0);
    const [pastSteps, setPastSteps] = useState(0);
    const [activity, setActivity] = useState<ActivityType>('Rest');
    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [dailyGoal, setDailyGoal] = useState(10000);

    const [waterCount, setWaterCount] = useState(0);

    // Load saved data on mount/focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const savedSteps = await StorageService.getTodaySteps();
                const savedGoal = await StorageService.getGoal();
                const savedWater = await StorageService.getWater();
                setCurrentSteps(savedSteps);
                setDailyGoal(savedGoal);
                setWaterCount(savedWater);
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
            const available = await PedometerService.isAvailable();
            setIsPedometerAvailable(String(available));

            // Activity Subscription & Software Step Counting
            activitySubscription = ActivityService.subscribe(
                (type) => {
                    setActivity(type);
                },
                () => {
                    // Update: Only count steps if activity is Walking or Running (basic noise filter)
                    // But our ActivityService already filters peaks, so we can trust the callback.
                    setCurrentSteps((prev) => prev + 1);
                }
            );
        };

        subscribe();

        return () => {
            activitySubscription && activitySubscription.remove();
        };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Minimal Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Today</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSub }]}>Keep it moving</Text>
                </View>
                <Link href="/settings" asChild>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
                        <Ionicons name="options-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Main Ring - Centerpiece */}
            <StepRing steps={currentSteps} goal={dailyGoal} />

            {/* Clean Stats Row */}
            <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="flame-outline" size={20} color={colors.danger} style={styles.statIcon} />
                    <View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{(currentSteps * 0.04).toFixed(0)}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSub }]}>kcal</Text>
                    </View>
                </View>

                {/* Spacer instead of divider */}
                <View style={{ width: 20 }} />

                <View style={[styles.statItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="location-outline" size={20} color="#3b82f6" style={styles.statIcon} />
                    <View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{(currentSteps * 0.000762).toFixed(2)}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSub }]}>km</Text>
                    </View>
                </View>
            </View>

            {/* Water Tracker - New Feature */}
            <View style={[styles.waterContainer, { backgroundColor: colors.card }]}>
                <View style={styles.waterInfo}>
                    <Ionicons name="water" size={24} color="#3b82f6" />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.waterTitle, { color: colors.text }]}>Water Intake</Text>
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

            {/* Minimal Activity Status */}
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

            {/* Bottom Actions - RESTORED PROMINENT BUTTON */}
            {/* DO NOT REMOVE THIS BUTTON */}
            <View style={styles.footer}>
                <Link href="/history" asChild>
                    <TouchableOpacity style={[styles.historyButtonProper, { backgroundColor: colors.text }]}>
                        <Ionicons name="arrow-forward" size={32} color={colors.background} />
                    </TouchableOpacity>
                </Link>

                {/* Reset Count (Secondary) */}
                <TouchableOpacity onPress={() => setCurrentSteps(0)} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.textSub, opacity: 0.6, fontSize: 12 }}>Reset Steps</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "flex-start",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800', // Extra bold
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    iconButton: {
        padding: 12,
        borderRadius: 50, // Circular
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 24,
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

    // Water Tracker
    waterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
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

    // Activity
    activityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'auto', // Push footer to bottom
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

    // Footer
    footer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    historyButtonProper: {
        width: 70, // Circular Button
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Slightly more pop
        shadowRadius: 10,
        elevation: 8,
    },
    // Removed text style as we only show icon
});
