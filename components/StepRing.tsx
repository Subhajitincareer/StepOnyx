import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const SIZE = width * 0.75; // Larger ring
const STROKE_WIDTH = 15; // Thinner, elegant stroke
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

    // Calculate percentage (0 to 1)
    const percentage = Math.min(Math.max(steps / goal, 0), 1);

    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [percentage]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.ringContainer}>
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
                            strokeLinecap="round" // Rounded ends for premium feel
                            animatedProps={animatedProps}
                        />
                    </G>
                </Svg>

                {/* Central Text */}
                <View style={styles.textContainer}>
                    <Text style={[styles.stepCount, { color: colors.accent }]}>{steps.toLocaleString()}</Text>
                    <Text style={[styles.stepLabel, { color: colors.textSub }]}>steps</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
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
        fontSize: 48, // Big hero number
        fontWeight: '200', // Thin font for elegance
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
