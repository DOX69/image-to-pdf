export interface ImageSlot {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  thumbnailUrl: string;
}

export type SlotsAction =
  | { type: 'ADD_FILES'; files: File[] }
  | { type: 'REORDER'; fromIndex: number; toIndex: number }
  | { type: 'REMOVE'; slotId: string }
  | { type: 'SET_STATUS'; slotId: string; status: ImageSlot['status'] }
  | { type: 'SET_THUMBNAIL'; slotId: string; thumbnailUrl: string }
  | { type: 'RESET' };

export function slotsReducer(state: ImageSlot[], action: SlotsAction): ImageSlot[] {
  switch (action.type) {
    case 'ADD_FILES':
      return [
        ...state,
        ...action.files.map((file) => ({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          file,
          name: file.name,
          sizeBytes: file.size,
          status: 'pending' as const,
          thumbnailUrl: '',
        })),
      ];

    case 'REORDER': {
      const next = [...state];
      const [moved] = next.splice(action.fromIndex, 1);
      next.splice(action.toIndex, 0, moved);
      return next;
    }

    case 'REMOVE':
      return state.filter((s) => s.id !== action.slotId);

    case 'SET_STATUS':
      return state.map((s) =>
        s.id === action.slotId ? { ...s, status: action.status } : s
      );

    case 'SET_THUMBNAIL':
      return state.map((s) =>
        s.id === action.slotId ? { ...s, thumbnailUrl: action.thumbnailUrl } : s
      );

    case 'RESET':
      return [];

    default:
      return state;
  }
}
