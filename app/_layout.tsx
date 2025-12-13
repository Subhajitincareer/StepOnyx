import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS
} from 'react-native-reanimated';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // Animate logo
        scale.value = withSequence(
            withTiming(1.2, { duration: 400, easing: Easing.out(Easing.exp) }),
            withTiming(1, { duration: 200 })
        );
        opacity.value = withTiming(1, { duration: 400 });

        // Animate text
        textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

        // Finish after animation
        const timer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 300 }, () => {
                runOnJS(onFinish)();
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.splashContainer, containerStyle]}>
            <Animated.View style={logoStyle}>
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.splashLogo}
                />
            </Animated.View>
            <Animated.Text style={[styles.splashTitle, textStyle]}>StepOnyx</Animated.Text>
            <Animated.Text style={[styles.splashSubtitle, textStyle]}>Every step counts</Animated.Text>
        </Animated.View>
    );
}

export default function Layout() {
    const router = useRouter();
    const segments = useSegments();
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem('onboarding_complete');
            setHasSeenOnboarding(seen === 'true');
            setIsLoading(false);
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        if (!isLoading && !showSplash) {
            // If hasn't seen onboarding, redirect
            if (!hasSeenOnboarding && segments[0] !== 'onboarding') {
                router.replace('/onboarding');
            }
        }
    }, [isLoading, showSplash, hasSeenOnboarding, segments]);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashLogo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    splashTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        marginTop: 20,
    },
    splashSubtitle: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 8,
    },
});
