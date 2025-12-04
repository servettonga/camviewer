export interface Camera {
  id: string;
  name: string;
  url: string;
  type: 'rtsp' | 'http' | 'hls' | 'mjpeg' | 'other';
  enabled: boolean;
  order: number;
}

export interface AppConfig {
  cameras: Camera[];
  gridColumns: number;
  autoRefreshInterval: number;
  rtspProxyUrl?: string; // e.g., http://192.168.1.100:1984
}
