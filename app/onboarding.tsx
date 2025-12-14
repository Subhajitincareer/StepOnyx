import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Track Your Steps',
        description: 'Count every step you take throughout the day with our smart pedometer.',
        icon: 'footsteps',
        color: '#6366f1',
    },
    {
        id: 2,
        title: 'Stay Hydrated',
        description: 'Monitor your daily water intake and build healthy hydration habits.',
        icon: 'water',
        color: '#14b8a6',
    },
    {
        id: 3,
        title: 'Earn Achievements',
        description: 'Unlock badges, complete challenges, and level up as you progress!',
        icon: 'trophy',
        color: '#f59e0b',
    },
];

export default function Onboarding() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const scrollViewRef = useRef<Animated.ScrollView>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('onboarding_complete', 'true');
        router.replace('/');
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('onboarding_complete', 'true');
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            >
                {SLIDES.map((slide) => (
                    <View key={slide.id} style={[styles.slide, { width }]}>
                        <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
                            <Ionicons name={slide.icon as any} size={80} color={slide.color} />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                ))}
            </Animated.ScrollView>

            {/* Pagination */}
            <View style={styles.pagination}>
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: index === currentIndex ? '#111827' : '#e5e7eb' }
                        ]}
                    />
                ))}
            </View>

            {/* Button */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: SLIDES[currentIndex].color }]}
                onPress={currentIndex === SLIDES.length - 1 ? handleGetStarted : handleNext}
            >
                <Text style={styles.buttonText}>
                    {currentIndex === SLIDES.length - 1 ? "Let's Go!" : 'Next'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
    slide: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        marginTop: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 6,
    },
    button: {
        marginHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 16,
        marginBottom: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
});
