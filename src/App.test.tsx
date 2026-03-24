/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('App Integration', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText('Image to Secure PDF')).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop ZIP or Images/i)).toBeInTheDocument();
  });
});
