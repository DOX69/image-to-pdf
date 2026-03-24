import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageItem } from '../lib/pdfGenerator';

interface SortableItemProps {
  item: PageItem;
  onRemove: (id: string) => void;
  onToggleOrientation: (id: string) => void;
}

export function SortableItem({ item, onRemove, onToggleOrientation }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const currentOrientation = item.userConfirmedOrientation || item.detectedOrientation;

  return (
    <div ref={setNodeRef} style={style} className="grid-item card">
      <div 
        {...attributes} 
        {...listeners} 
        className="drag-handle"
      >
        <img src={item.blobUrl} alt={item.originalName} className="thumbnail" />
      </div>
      
      <div className="item-details">
        <span className="filename" title={item.originalName}>{item.originalName}</span>
        
        <div className="item-actions">
          <button 
            type="button"
            className="btn-tiny" 
            onClick={() => onToggleOrientation(item.id)}
            title="Toggle Orientation"
          >
            {currentOrientation === 'portrait' ? '↕ Portrait' : '↔ Landscape'}
          </button>
          
          <button 
            type="button"
            className="btn-tiny btn-danger" 
            onClick={() => onRemove(item.id)}
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
