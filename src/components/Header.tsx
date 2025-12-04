import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Video } from 'lucide-react';

interface HeaderProps {
  onAddCamera: () => void;
}

export function Header({ onAddCamera }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">CamView</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={onAddCamera} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Camera
          </Button>
          <Link to="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
