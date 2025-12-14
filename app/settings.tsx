import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from "../services/StorageService";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
    const router = useRouter();
    const { colors, theme, toggleTheme } = useTheme();
    const [goal, setGoal] = useState("10000");

    useEffect(() => {
        const loadGoal = async () => {
            const savedGoal = await StorageService.getGoal();
            setGoal(savedGoal.toString());
        };
        loadGoal();
    }, []);

    const handleSave = async () => {
        const newGoal = parseInt(goal);
        if (isNaN(newGoal) || newGoal < 1000) {
            Alert.alert("Invalid Goal", "Please enter a valid number (minimum 1000).");
            return;
        }

        await StorageService.saveGoal(newGoal);
        Alert.alert("Success", "Goal updated successfully!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    const handleReset = () => {
        Alert.alert(
            "Reset Today's Data?",
            "This will clear your steps and water intake for today. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        const today = StorageService.getTodayDate();
                        await StorageService.saveDailySteps(today, 0);
                        await StorageService.saveWater(today, 0);
                        router.back();
                    }
                }
            ]
        );
    };

    // Reusable Section Header
    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>{title}</Text>
    );

    // Reusable Menu Item
    const MenuItem = ({
        icon,
        label,
        onPress,
        rightElement,
        danger = false
    }: {
        icon: string;
        label: string;
        onPress?: () => void;
        rightElement?: React.ReactNode;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: danger ? colors.danger + '20' : colors.tint }]}>
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={danger ? colors.danger : colors.text}
                    />
                </View>
                <Text style={[styles.menuItemLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
            </View>
            {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSub} />)}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </Link>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* SECTION: Preferences */}
                <SectionHeader title="PREFERENCES" />

                {/* Dark Mode Toggle */}
                <MenuItem
                    icon={theme === 'dark' ? "moon" : "sunny"}
                    label="Dark Mode"
                    rightElement={
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#e5e7eb', true: '#22c55e' }}
                            thumbColor={'#fff'}
                        />
                    }
                />

                {/* Daily Goal */}
                <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
                    <View style={styles.goalHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
                            <Ionicons name="flag" size={20} color={colors.text} />
                        </View>
                        <Text style={[styles.menuItemLabel, { color: colors.text }]}>Daily Target</Text>
                    </View>
                    <TextInput
                        style={[styles.goalInput, { color: colors.text }]}
                        value={goal}
                        onChangeText={setGoal}
                        keyboardType="numeric"
                        maxLength={5}
                        placeholder="10000"
                        placeholderTextColor={colors.textSub}
                    />
                    <Text style={[styles.goalHelper, { color: colors.textSub }]}>steps per day</Text>
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.accent }]}
                        onPress={handleSave}
                    >
                        <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Goal</Text>
                    </TouchableOpacity>
                </View>

                {/* SECTION: Data & History */}
                <SectionHeader title="DATA & HISTORY" />

                <Link href="/history" asChild>
                    <MenuItem icon="bar-chart" label="View Weekly Stats" onPress={() => { }} />
                </Link>

                <Link href="/achievements" asChild>
                    <MenuItem icon="trophy" label="Achievements" onPress={() => { }} />
                </Link>

                {/* SECTION: Danger Zone */}
                <SectionHeader title="DANGER ZONE" />

                <MenuItem
                    icon="trash"
                    label="Reset Today's Data"
                    onPress={handleReset}
                    danger
                />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSub }]}>StepOnyx v1.0.0</Text>
                    <Text style={[styles.footerText, { color: colors.textSub }]}>Made with ❤️</Text>
                </View>
            </View>
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
    content: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    goalCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 8,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalInput: {
        fontSize: 48,
        fontWeight: '800',
        textAlign: 'center',
    },
    goalHelper: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    saveButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        marginTop: 4,
    },
});
