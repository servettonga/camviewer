import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Video } from 'lucide-react';

interface HeaderProps {
  onAddCamera: () => void;
}

export function Header({ onAddCamera }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">CamView</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Button onClick={onAddCamera} size="sm" className="shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Camera
          </Button>
          <Link to="/settings">
            <Button variant="outline" size="icon" className="shadow-sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
