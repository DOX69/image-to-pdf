import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import type { PageItem } from '../lib/pdfGenerator';
import { SortableItem } from './SortableItem';

interface SortableGridProps {
  items: PageItem[];
  setItems: React.Dispatch<React.SetStateAction<PageItem[]>>;
  onRemove: (id: string) => void;
  onToggleOrientation: (id: string) => void;
}

export function SortableGrid({ items, setItems, onRemove, onToggleOrientation }: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="sortable-grid">
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          {items.map((item) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              onRemove={onRemove}
              onToggleOrientation={onToggleOrientation} 
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
