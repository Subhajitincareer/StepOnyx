import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StorageService, DailyData } from "../services/StorageService";
import { useTheme } from "../context/ThemeContext";

const CHART_HEIGHT = 200;

export default function History() {
    const { colors } = useTheme();
    const [history, setHistory] = useState<DailyData>({});
    const [loading, setLoading] = useState(true);
    const [dailyGoal, setDailyGoal] = useState(10000);

    useEffect(() => {
        const loadHistory = async () => {
            const data = await StorageService.getHistory();
            const goal = await StorageService.getGoal();
            setHistory(data);
            setDailyGoal(goal);
            setLoading(false);
        };
        loadHistory();
    }, []);

    // Get last 7 days data
    const getLast7Days = () => {
        const days: { date: string; steps: number; dayName: string }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            days.push({
                date: dateStr,
                steps: history[dateStr] || 0,
                dayName: dayName
            });
        }
        return days;
    };

    const weekData = getLast7Days();
    const maxSteps = Math.max(...weekData.map(d => d.steps), dailyGoal);
    const totalWeekSteps = weekData.reduce((sum, d) => sum + d.steps, 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </Link>
                <Text style={[styles.title, { color: colors.text }]}>Weekly Stats</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <Text style={[styles.messageText, { color: colors.textSub }]}>Loading...</Text>
                ) : (
                    <>
                        {/* Summary Card */}
                        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                            <View>
                                <Text style={[styles.summaryLabel, { color: colors.textSub }]}>This Week</Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>{totalWeekSteps.toLocaleString()}</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textSub }]}>steps</Text>
                            </View>
                            <View style={styles.summaryRight}>
                                <Ionicons name="trending-up" size={32} color={colors.success} />
                            </View>
                        </View>

                        {/* Bar Chart */}
                        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
                            {/* Goal Line */}
                            <View style={[styles.goalLine, { bottom: (dailyGoal / maxSteps) * CHART_HEIGHT, borderColor: colors.danger }]}>
                                <Text style={[styles.goalText, { color: colors.danger }]}>Goal</Text>
                            </View>

                            {/* Bars */}
                            <View style={styles.barsRow}>
                                {weekData.map((day, index) => {
                                    const barHeight = maxSteps > 0 ? (day.steps / maxSteps) * CHART_HEIGHT : 0;
                                    const isToday = index === 6;
                                    const metGoal = day.steps >= dailyGoal;

                                    return (
                                        <View key={day.date} style={styles.barColumn}>
                                            <Text style={[styles.barValue, { color: colors.textSub }]}>
                                                {day.steps > 0 ? (day.steps / 1000).toFixed(1) + 'k' : '-'}
                                            </Text>
                                            <View style={[styles.barWrapper, { height: CHART_HEIGHT }]}>
                                                <View
                                                    style={[
                                                        styles.bar,
                                                        {
                                                            height: barHeight,
                                                            backgroundColor: metGoal ? colors.success : (isToday ? colors.accent : colors.tint),
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[
                                                styles.dayLabel,
                                                { color: isToday ? colors.text : colors.textSub, fontWeight: isToday ? '700' : '500' }
                                            ]}>{day.dayName}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Legend */}
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                                <Text style={[styles.legendText, { color: colors.textSub }]}>Goal Met</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                                <Text style={[styles.legendText, { color: colors.textSub }]}>Today</Text>
                            </View>
                        </View>
                    </>
                )}
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
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    messageText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
    summaryCard: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 42,
        fontWeight: '800',
        marginVertical: 4,
    },
    summaryRight: {
        opacity: 0.8,
    },
    chartContainer: {
        borderRadius: 24,
        padding: 20,
        paddingTop: 30,
        position: 'relative',
    },
    goalLine: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderTopWidth: 2,
        borderStyle: 'dashed',
    },
    goalText: {
        position: 'absolute',
        right: 0,
        top: -18,
        fontSize: 11,
        fontWeight: '700',
    },
    barsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
    },
    barWrapper: {
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
    },
    bar: {
        width: 24,
        borderRadius: 12,
        minHeight: 8,
    },
    barValue: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 6,
    },
    dayLabel: {
        fontSize: 12,
        marginTop: 10,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
    },
});
