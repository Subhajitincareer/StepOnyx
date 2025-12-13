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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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

                {/* Theme Toggle - New Feature */}
                <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.toggleLabelRow}>
                        <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={22} color={colors.text} style={{ marginRight: 12 }} />
                        <Text style={[styles.toggleText, { color: colors.text }]}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#e5e7eb', true: '#22c55e' }}
                        thumbColor={'#fff'}
                    />
                </View>


                <View style={{ height: 40 }} />


                <Text style={[styles.label, { color: colors.textSub }]}>Your Daily Target</Text>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={goal}
                    onChangeText={setGoal}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="10000"
                    placeholderTextColor={colors.textSub}
                />
                <Text style={[styles.helperText, { color: colors.textSub }]}>Steps per day</Text>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSave}>
                    <Text style={[styles.saveButtonText, { color: colors.background }]}>Update Goal</Text>
                    <Ionicons name="checkmark" size={24} color={colors.background} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
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
    content: {
        flex: 1,
        alignItems: 'center',
    },
    // Toggle
    toggleContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    toggleLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 18,
        fontWeight: '600',
    },

    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        fontSize: 56, // Massive input
        fontWeight: '800',
        textAlign: 'center',
        padding: 0,
        marginBottom: 8,
        width: '100%',
    },
    helperText: {
        fontSize: 16,
        marginBottom: 60,
    },
    saveButton: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
