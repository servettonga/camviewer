import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Camera } from '@/types/camera';
import { CameraCard } from './CameraCard';

interface CameraGridProps {
  cameras: Camera[];
  gridColumns: number;
  onReorder: (cameras: Camera[]) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function CameraGrid({
  cameras,
  gridColumns,
  onReorder,
  onEdit,
  onDelete,
  onToggleExpand,
}: CameraGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cameras.findIndex((c) => c.id === active.id);
      const newIndex = cameras.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(cameras, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const gridClass = {
    2: 'grid-cols-2',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[gridColumns] || 'grid-cols-2';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={cameras.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className={`grid ${gridClass} gap-4`}>
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className={camera.expanded ? 'col-span-2 row-span-2' : ''}
            >
              <CameraCard
                camera={camera}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleExpand={onToggleExpand}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
