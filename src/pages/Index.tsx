import { useState } from 'react';
import { useCameras } from '@/hooks/useCameras';
import { Camera } from '@/types/camera';
import { Header } from '@/components/Header';
import { CameraGrid } from '@/components/CameraGrid';
import { CameraDialog } from '@/components/CameraDialog';
import { Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const {
    cameras,
    gridColumns,
    isLoaded,
    addCamera,
    updateCamera,
    deleteCamera,
    reorderCameras,
    setGridColumns,
  } = useCameras();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  const handleAddCamera = () => {
    setEditingCamera(null);
    setDialogOpen(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Camera, 'id' | 'order'> | Camera) => {
    if ('id' in data) {
      updateCamera(data.id, data);
    } else {
      addCamera(data);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddCamera={handleAddCamera} />
      
      <main className="container mx-auto px-4 py-6">
        {cameras.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {cameras.length} camera{cameras.length !== 1 ? 's' : ''} • Drag to reorder
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Grid:</span>
                <Select
                  value={String(gridColumns)}
                  onValueChange={(v) => setGridColumns(Number(v))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CameraGrid
              cameras={cameras}
              gridColumns={gridColumns}
              onReorder={reorderCameras}
              onEdit={handleEditCamera}
              onDelete={deleteCamera}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No cameras yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add your first camera stream to start monitoring. Supports HTTP, HLS, MJPEG streams and more.
            </p>
            <Button onClick={handleAddCamera}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Camera
            </Button>
          </div>
        )}
      </main>

      <CameraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        camera={editingCamera}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;
