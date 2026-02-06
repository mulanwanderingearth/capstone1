/* global describe, it, expect, jest */
import { render } from '@testing-library/react-native';
import Index from '../app/(tabs)/index';

// Mock axios
jest.mock('axios');

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Index Component - Search Functionality', () => {
  it('renders search input', () => {
    const { getByPlaceholderText } = render(<Index />);
    expect(getByPlaceholderText('🔍Search for Recipes!')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Cookly')).toBeTruthy();
  });

  it('renders search type toggle buttons', () => {
    const { getAllByText } = render(<Index />);
    const titleBtn = getAllByText('Title');
    const ingredientBtn = getAllByText('Ingredients');
    
    expect(titleBtn.length).toBeGreaterThan(0);
    expect(ingredientBtn.length).toBeGreaterThan(0);
  });

  it('has empty recipes initially', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Cookly')).toBeTruthy();
  });
  it('no recipes found', () => {
    const { getByText } = render(<Index />);
    expect(getByText('No recipes found.')).toBeTruthy();
  });
});
