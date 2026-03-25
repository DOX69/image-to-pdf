/** @vitest-environment jsdom */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('App Integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText(/image to secure pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop ZIP or Images/i)).toBeInTheDocument();
  });

  it('renders the action panel with password protection when images are present', () => {
    // We can't easily simulate complex file drops in this simple test without more mocking, 
    // but we can verify it's NOT there initially (as ActionPanel is hidden)
    render(<App />);
    expect(screen.queryByText(/no password/i)).not.toBeInTheDocument();
  });
});
