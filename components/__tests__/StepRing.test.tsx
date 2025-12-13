import React from 'react';
import { render } from '@testing-library/react-native';
import { StepRing } from '../StepRing';

// Mock ThemeContext since StepRing uses it
jest.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        colors: {
            text: '#000000',
            textSub: '#888888',
            tint: '#eeeeee',
            accent: '#0000ff'
        },
    }),
}));

describe('StepRing', () => {
    it('renders correctly', () => {
        const tree = render(<StepRing steps={5000} goal={10000} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('displays the correct step count', () => {
        const { getByText } = render(<StepRing steps={1234} goal={10000} />);
        expect(getByText('1,234')).toBeTruthy();
    });
});
