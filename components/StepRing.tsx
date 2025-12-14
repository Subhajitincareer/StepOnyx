import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withSpring,
    Easing,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const SIZE = width * 0.65; // Slightly smaller for new layout
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StepRingProps {
    steps: number;
    goal: number;
}

export function StepRing({ steps, goal }: StepRingProps) {
    const { colors } = useTheme();
    const progress = useSharedValue(0);
    const pulseScale = useSharedValue(1);
    const prevSteps = useRef(steps);

    // Calculate percentage (0 to 1)
    const percentage = Math.min(Math.max(steps / goal, 0), 1);

    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [percentage]);

    // Pulse animation when steps change
    useEffect(() => {
        if (steps > prevSteps.current) {
            // New step detected - trigger pulse!
            pulseScale.value = withSequence(
                withSpring(1.05, { damping: 8, stiffness: 400 }),
                withSpring(1, { damping: 15, stiffness: 300 })
            );
        }
        prevSteps.current = steps;
    }, [steps]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
        };
    });

    const pulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.ringContainer, pulseStyle]}>
                <Svg width={SIZE} height={SIZE}>
                    <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
                        {/* Background Ring */}
                        <Circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={colors.tint}
                            strokeWidth={STROKE_WIDTH}
                            fill="transparent"
                        />
                        {/* Progress Ring */}
                        <AnimatedCircle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={colors.accent}
                            strokeWidth={STROKE_WIDTH}
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeLinecap="round"
                            animatedProps={animatedProps}
                        />
                    </G>
                </Svg>

                {/* Central Text */}
                <View style={styles.textContainer}>
                    <Text style={[styles.stepCount, { color: colors.accent }]}>{steps.toLocaleString()}</Text>
                    <Text style={[styles.stepLabel, { color: colors.textSub }]}>steps</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    ringContainer: {
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    stepCount: {
        fontSize: 42,
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
    },
    stepLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
        fontWeight: '600',
    },
});
