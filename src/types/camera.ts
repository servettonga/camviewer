export interface Camera {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'hls' | 'mjpeg' | 'other';
  enabled: boolean;
  order: number;
  expanded?: boolean;
}

export interface AppConfig {
  cameras: Camera[];
  gridColumns: number;
  autoRefreshInterval: number;
  rtspProxyUrl?: string; // e.g., http://192.168.1.100:1984
  seamlessView?: boolean; // Remove gaps and rounded corners
  showCameraNames?: boolean; // Keep camera names visible without hover
}
