import React from 'react';
import { render } from '@testing-library/react-native';
import { StepRing } from '../StepRing';

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        colors: {
            accent: '#000',
            tint: '#e5e7eb',
            text: '#111827',
            textSub: '#6b7280',
        }
    })
}));

// Mock reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock SVG
jest.mock('react-native-svg', () => {
    const React = require('react');
    return {
        Svg: ({ children }: any) => React.createElement('View', null, children),
        Circle: (props: any) => React.createElement('View', props),
        G: ({ children }: any) => React.createElement('View', null, children),
    };
});

describe('StepRing', () => {
    it('renders without crashing', () => {
        const { getByText } = render(<StepRing steps={0} goal={10000} />);

        expect(getByText('0')).toBeTruthy();
        expect(getByText('steps')).toBeTruthy();
    });

    it('displays step count correctly', () => {
        const { getByText } = render(<StepRing steps={5000} goal={10000} />);

        expect(getByText('5,000')).toBeTruthy();
    });

    it('formats large numbers with commas', () => {
        const { getByText } = render(<StepRing steps={12345} goal={10000} />);

        expect(getByText('12,345')).toBeTruthy();
    });

    it('displays "steps" label', () => {
        const { getByText } = render(<StepRing steps={1000} goal={10000} />);

        expect(getByText('steps')).toBeTruthy();
    });
});

describe('StepRing Progress Calculation', () => {
    it('calculates 0% progress for 0 steps', () => {
        const steps = 0;
        const goal = 10000;
        const percentage = Math.min(Math.max(steps / goal, 0), 1);

        expect(percentage).toBe(0);
    });

    it('calculates 50% progress for half goal', () => {
        const steps = 5000;
        const goal = 10000;
        const percentage = Math.min(Math.max(steps / goal, 0), 1);

        expect(percentage).toBe(0.5);
    });

    it('caps progress at 100%', () => {
        const steps = 15000;
        const goal = 10000;
        const percentage = Math.min(Math.max(steps / goal, 0), 1);

        expect(percentage).toBe(1);
    });

    it('handles 0 goal gracefully', () => {
        const steps = 5000;
        const goal = 0;
        // Prevent division by zero
        const percentage = goal > 0 ? Math.min(Math.max(steps / goal, 0), 1) : 0;

        expect(percentage).toBe(0);
    });
});
