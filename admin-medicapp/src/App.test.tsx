import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the admin navbar', () => {
  render(<App />);
  const brandElement = screen.getByText(/MedicApp/i);
  expect(brandElement).toBeInTheDocument();
});
