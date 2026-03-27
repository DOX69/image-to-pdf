import { describe, it, expect } from 'vitest';
import { slotsReducer, type ImageSlot } from './slotsReducer';

describe('slotsReducer', () => {
  const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

  it('should add files with pending status and unique ids', () => {
    const initialState: ImageSlot[] = [];
    const action = { type: 'ADD_FILES' as const, files: [mockFile] };
    
    const state = slotsReducer(initialState, action);
    
    expect(state).toHaveLength(1);
    expect(state[0].name).toBe('test.jpg');
    expect(state[0].status).toBe('pending');
    expect(state[0].id).toBeDefined();
    expect(typeof state[0].id).toBe('string');
  });

  it('should reorder slots', () => {
    const initialState: ImageSlot[] = [
      { id: '1', name: 'a.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
      { id: '2', name: 'b.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
    ];
    const action = { type: 'REORDER' as const, fromIndex: 0, toIndex: 1 };
    
    const state = slotsReducer(initialState, action);
    
    expect(state[0].id).toBe('2');
    expect(state[1].id).toBe('1');
  });

  it('should remove a slot', () => {
    const initialState: ImageSlot[] = [
      { id: '1', name: 'a.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
    ];
    const action = { type: 'REMOVE' as const, slotId: '1' };
    
    const state = slotsReducer(initialState, action);
    
    expect(state).toHaveLength(0);
  });

  it('should update slot status', () => {
    const initialState: ImageSlot[] = [
      { id: '1', name: 'a.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
    ];
    const action = { type: 'SET_STATUS' as const, slotId: '1', status: 'done' as const };
    
    const state = slotsReducer(initialState, action);
    
    expect(state[0].status).toBe('done');
  });

  it('should set thumbnail url', () => {
    const initialState: ImageSlot[] = [
      { id: '1', name: 'a.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
    ];
    const action = { type: 'SET_THUMBNAIL' as const, slotId: '1', thumbnailUrl: 'blob:xxx' };
    
    const state = slotsReducer(initialState, action);
    
    expect(state[0].thumbnailUrl).toBe('blob:xxx');
  });

  it('should reset state', () => {
    const initialState: ImageSlot[] = [
      { id: '1', name: 'a.jpg', file: mockFile, sizeBytes: 0, status: 'pending', thumbnailUrl: '' },
    ];
    const action = { type: 'RESET' as const };
    
    const state = slotsReducer(initialState, action);
    
    expect(state).toHaveLength(0);
  });
});
