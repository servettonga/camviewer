import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Hls from 'hls.js';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Settings, Trash2, RefreshCw, Play, Pause, AlertCircle, Video, Maximize, Minimize2, Maximize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CameraCardProps {
  camera: Camera;
  seamlessView?: boolean;
  showCameraNames?: boolean;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function CameraCard({ camera, seamlessView = false, showCameraNames = false, onEdit, onDelete, onToggleExpand }: CameraCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: camera.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRefresh = () => {
    setHasError(false);
    setKey(prev => prev + 1);
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  // Setup HLS.js for HLS streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera.enabled || hasError) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (camera.type === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(camera.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setHasError(true);
        }
      });
    } else if (camera.type === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = camera.url;
      video.play().catch(() => {});
    } else if (camera.type !== 'mjpeg') {
      video.src = camera.url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [camera.url, camera.type, camera.enabled, key, hasError]);

  const isStreamSupported = true;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`overflow-hidden border-border bg-card shadow-md hover:shadow-lg transition-shadow duration-300 group ${
        seamlessView ? 'rounded-none border-0 shadow-none' : ''
      }`}>
        <div
          className="relative aspect-video bg-muted/30 cursor-zoom-in"
          onClick={handleFullscreen}
        >
          {camera.enabled && isStreamSupported && !hasError ? (
            camera.type === 'mjpeg' ? (
              <img
                key={key}
                src={camera.url}
                alt={camera.name}
                className="w-full h-full object-cover"
                onError={handleError}
              />
            ) : (
              <video
                key={key}
                ref={videoRef}
                className="w-full h-full object-cover bg-black"
                autoPlay
                muted
                playsInline
                onError={handleError}
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              {hasError ? (
                <>
                  <AlertCircle className="h-8 w-8" />
                  <span className="text-sm">Stream unavailable</span>
                </>
              ) : !isStreamSupported ? (
                <>
                  <Video className="h-8 w-8" />
                  <span className="text-sm text-center px-4">
                    RTSP not supported directly - use HLS URL from go2rtc
                  </span>
                </>
              ) : (
                <>
                  <Video className="h-8 w-8" />
                  <span className="text-sm">Camera disabled</span>
                </>
              )}
            </div>
          )}

          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-md cursor-grab active:cursor-grabbing hover:bg-background/90 transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-foreground" />
          </button>

          {/* Camera Name - Always visible when setting is on */}
          {showCameraNames && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 via-background/60 to-transparent pointer-events-none">
              <span className="text-sm font-medium text-foreground truncate block">
                {camera.name}
              </span>
            </div>
          )}

          {/* Controls Overlay - Only on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              {/* Name visible on hover when setting is off */}
              <span className="text-sm font-medium text-foreground truncate max-w-[60%]">
                {!showCameraNames && camera.name}
              </span>
              {/* Controls - always hover-only */}
              <div className="flex items-center gap-1 ml-auto">
                {camera.enabled && isStreamSupported && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleTogglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleFullscreen}
                    >
                      <Maximize className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleExpand(camera.id)}
                      title={camera.expanded ? "Collapse to 1x1" : "Expand to 2x2"}
                    >
                      {camera.expanded ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(camera)}>
                      Edit Camera
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(camera.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
