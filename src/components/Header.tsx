import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Video } from "lucide-react";

interface HeaderProps {
  onAddCamera: () => void;
}

export function Header({ onAddCamera }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Video className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            CamViewer
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Button onClick={onAddCamera} variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
