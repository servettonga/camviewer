import { useState, useEffect, useCallback } from 'react';
import { Camera, AppConfig } from '@/types/camera';

const STORAGE_KEY = 'camview-config';

// Test streams to verify player works - replace with your own camera URLs
const exampleCameras: Camera[] = [
  {
    id: 'example-1',
    name: 'Test Stream 1 (Big Buck Bunny)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls',
    enabled: true,
    order: 0,
  },
  {
    id: 'example-2',
    name: 'Test Stream 2 (ARTE)',
    url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    type: 'hls',
    enabled: true,
    order: 1,
  },
  {
    id: 'example-3',
    name: 'Test Stream 3 (Tears of Steel)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    type: 'hls',
    enabled: true,
    order: 2,
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

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(defaultConfig);
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
    resetAll,
  };
}
