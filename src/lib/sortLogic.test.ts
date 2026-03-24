import { describe, it, expect } from 'vitest';
import { sortFilesNumerically } from './sortLogic';

describe('sortLogic', () => {
  it('sorts an array of files numerically by name', () => {
    // Generate mock File objects
    const f1 = new File([''], 'Page10.jpg', { type: 'image/jpeg' });
    const f2 = new File([''], 'Page2.png', { type: 'image/png' });
    const f3 = new File([''], 'Page1.jpg', { type: 'image/jpeg' });
    const f4 = new File([''], 'Cover.jpg', { type: 'image/jpeg' });
    const f5 = new File([''], 'Page1-1.jpg', { type: 'image/jpeg' });

    const sorted = sortFilesNumerically([f1, f2, f3, f4, f5]);
    const names = sorted.map(f => f.name);

    expect(names).toEqual([
      'Cover.jpg',
      'Page1-1.jpg',
      'Page1.jpg',
      'Page2.png',
      'Page10.jpg'
    ]);
  });
});
