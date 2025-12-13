import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StorageService, DailyData } from "../services/StorageService";
import { useTheme } from "../context/ThemeContext";

export default function History() {
    const { colors } = useTheme();
    const [history, setHistory] = useState<DailyData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            const data = await StorageService.getHistory();
            setHistory(data);
            setLoading(false);
        };
        loadHistory();
    }, []);

    const dates = Object.keys(history).sort().reverse();
    const maxSteps = Math.max(...Object.values(history), 100); // Avoid divide by zero

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </Link>
                <Text style={[styles.title, { color: colors.text }]}>Weekly History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <Text style={[styles.messageText, { color: colors.textSub }]}>Loading...</Text>
                ) : dates.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="footsteps-outline" size={48} color={colors.tint} />
                        <Text style={[styles.messageText, { color: colors.textSub }]}>No steps recorded yet.</Text>
                    </View>
                ) : (
                    dates.map((date) => {
                        const steps = history[date];
                        const percentage = Math.min((steps / 10000) * 100, 100);

                        return (
                            <View key={date} style={styles.row}>
                                <View style={styles.dateInfo}>
                                    <Text style={[styles.dateText, { color: colors.textSub }]}>{date}</Text>
                                    <Text style={[styles.stepsText, { color: colors.text }]}>{steps.toLocaleString()}</Text>
                                </View>
                                <View style={[styles.barBackground, { backgroundColor: colors.tint }]}>
                                    {/* Accent color for the bar */}
                                    <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
                                </View>
                            </View>
                        );
                    })
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
        marginBottom: 40,
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    row: {
        marginBottom: 32,
    },
    dateInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
    },
    stepsText: {
        fontSize: 20,
        fontWeight: '700',
    },
    barBackground: {
        height: 8, // Thinner bars
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
});
