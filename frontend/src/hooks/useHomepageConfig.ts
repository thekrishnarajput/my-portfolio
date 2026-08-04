import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { homepageConfigAPI } from '../services/api';
import { IHomepageConfig } from '../types/homepageConfig';

interface UseHomepageConfigReturn {
  config: IHomepageConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple module-level pub/sub so every consumer of this hook (navbar logo,
// homepage sections, SEO, ...) refetches when the admin saves a new config —
// without that, components that fetched once on mount kept showing the old
// logo/branding until a full page refresh.
const listeners = new Set<() => void>();

export const notifyHomepageConfigUpdated = (): void => {
  listeners.forEach((listener) => listener());
};

export const useHomepageConfig = (): UseHomepageConfigReturn => {
  const [config, setConfig] = useState<IHomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homepageConfigAPI.getActive();
      setConfig(response.data.data);
    } catch (error) {
      setError(
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
          'Failed to load homepage configuration'
      );
      console.error('Error fetching homepage config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Refetch whenever the config is changed from the admin panel
  useEffect(() => {
    listeners.add(fetchConfig);
    return () => {
      listeners.delete(fetchConfig);
    };
  }, [fetchConfig]);

  return { config, loading, error, refetch: fetchConfig };
};
