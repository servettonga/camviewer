import { useEffect, useState } from 'react';
import { Camera } from '@/types/camera';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera?: Camera | null;
  onSave: (camera: Omit<Camera, 'id' | 'order'> | Camera) => void;
}

const defaultValues = {
  name: '',
  url: '',
  type: 'http' as Camera['type'],
  enabled: true,
};

export function CameraDialog({ open, onOpenChange, camera, onSave }: CameraDialogProps) {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (camera) {
      setFormData({
        name: camera.name,
        url: camera.url,
        type: camera.type,
        enabled: camera.enabled,
      });
    } else {
      setFormData(defaultValues);
    }
  }, [camera, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    if (camera) {
      onSave({ ...camera, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{camera ? 'Edit Camera' : 'Add Camera'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Front Door Camera"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Stream URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="http://192.168.1.100:8080/video"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Stream Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Camera['type']) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP (MP4/WebM)</SelectItem>
                <SelectItem value="hls">HLS (.m3u8)</SelectItem>
                <SelectItem value="mjpeg">MJPEG</SelectItem>
                <SelectItem value="rtsp">RTSP (requires proxy)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formData.type === 'rtsp' && (
              <p className="text-sm text-muted-foreground">
                RTSP streams require a media server (like MediaMTX) to convert to HLS/HTTP.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enabled</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {camera ? 'Save Changes' : 'Add Camera'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
