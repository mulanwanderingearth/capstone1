/* global describe, it, expect, jest, beforeEach */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import Index from '../app/(tabs)/index';

// 1. Mock axios and router
jest.mock('axios');
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Index Component - Business Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Logic Test 1: Verify correct API parameters for "Title" search
  it('should call API with titleMatch parameter when searchType is title', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });

    render(<Index />);
    const input = screen.getByPlaceholderText('🔍Search for Recipes!');
    
    // Simulate user input and submit
    fireEvent.changeText(input, 'pasta');
    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/complexSearch'),
        expect.objectContaining({
          params: expect.objectContaining({
            titleMatch: 'pasta', // Verification of business logic
          }),
        })
      );
    });
  });

  // Logic Test 2: Verify correct API parameters for "Ingredients" search
  it('should call API with includeIngredients parameter after toggling search type', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });

    render(<Index />);
    const input = screen.getByPlaceholderText('🔍Search for Recipes!');
    const ingredientBtn = screen.getByText('Ingredients');

    fireEvent.changeText(input, 'tomato');
    // Click toggle button which triggers handleSearch('ingredient')
    fireEvent.press(ingredientBtn);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/complexSearch'),
        expect.objectContaining({
          params: expect.objectContaining({
            includeIngredients: 'tomato', // Logic: verifies the toggle correctly changed the param key
          }),
        })
      );
    });
  });

  // Logic Test 3: Verify navigation logic with correct data
  it('should navigate to details with serialized recipe data when a card is pressed', async () => {
    // Setup initial search results
    const mockRecipe = { id: 123, title: 'Test Recipe', image: 'test.jpg' };
    const mockDetails = { id: 123, title: 'Test Recipe', instructions: 'Step 1...' };
    
    // Mock search API and then detail API
    axios.get
      .mockResolvedValueOnce({ data: { results: [mockRecipe] } }) // for handleSearch
      .mockResolvedValueOnce({ data: mockDetails }); // for handleRecipePress

    render(<Index />);
    
    // Trigger search to show the list
    const input = screen.getByPlaceholderText('🔍Search for Recipes!');
    fireEvent.changeText(input, 'test');
    fireEvent(input, 'submitEditing');

    // Find the rendered card and press it
    const recipeCard = await screen.findByText('Test Recipe');
    fireEvent.press(recipeCard);

    await waitFor(() => {
      // Logic: Verify detailed info is fetched and passed to router
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/123/information'), expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/recipe-detail',
          params: { recipe: JSON.stringify(mockDetails) }
        })
      );
    });
  });
});