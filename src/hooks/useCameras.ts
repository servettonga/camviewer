import { useState, useEffect, useCallback } from 'react';
import { Camera, AppConfig } from '@/types/camera';

const STORAGE_KEY = 'camview-config';

const exampleCameras: Camera[] = [
  {
    id: 'example-1',
    name: 'Big Buck Bunny (Demo)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls',
    enabled: true,
    order: 0,
  },
  {
    id: 'example-2',
    name: 'Apple HLS Test (Demo)',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    type: 'hls',
    enabled: true,
    order: 1,
  },
  {
    id: 'example-3',
    name: 'Elephants Dream (Demo)',
    url: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    type: 'hls',
    enabled: true,
    order: 2,
  },
  {
    id: 'example-4',
    name: 'Live Test Stream (Demo)',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    type: 'hls',
    enabled: true,
    order: 3,
  },
];

const defaultConfig: AppConfig = {
  cameras: exampleCameras,
  gridColumns: 2,
  autoRefreshInterval: 30,
};

export function useCameras() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.error('Failed to parse stored config:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isLoaded]);

  const addCamera = useCallback((camera: Omit<Camera, 'id' | 'order'>) => {
    const newCamera: Camera = {
      ...camera,
      id: crypto.randomUUID(),
      order: config.cameras.length,
    };
    setConfig(prev => ({
      ...prev,
      cameras: [...prev.cameras, newCamera],
    }));
  }, [config.cameras.length]);

  const updateCamera = useCallback((id: string, updates: Partial<Camera>) => {
    setConfig(prev => ({
      ...prev,
      cameras: prev.cameras.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const deleteCamera = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      cameras: prev.cameras.filter(c => c.id !== id),
    }));
  }, []);

  const reorderCameras = useCallback((cameras: Camera[]) => {
    setConfig(prev => ({
      ...prev,
      cameras: cameras.map((c, index) => ({ ...c, order: index })),
    }));
  }, []);

  const setGridColumns = useCallback((columns: number) => {
    setConfig(prev => ({ ...prev, gridColumns: columns }));
  }, []);

  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importConfig = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.cameras && Array.isArray(parsed.cameras)) {
        setConfig({ ...defaultConfig, ...parsed });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const loadExamples = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      cameras: exampleCameras,
    }));
  }, []);

  const sortedCameras = [...config.cameras].sort((a, b) => a.order - b.order);

  return {
    cameras: sortedCameras,
    gridColumns: config.gridColumns,
    isLoaded,
    addCamera,
    updateCamera,
    deleteCamera,
    reorderCameras,
    setGridColumns,
    exportConfig,
    importConfig,
    loadExamples,
  };
}
