import { useState, useEffect, useCallback } from 'react';
import { Camera, AppConfig } from '@/types/camera';

const STORAGE_KEY = 'camview-config';

const defaultConfig: AppConfig = {
  cameras: [],
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
  };
}
