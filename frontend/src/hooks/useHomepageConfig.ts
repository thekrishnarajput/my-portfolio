import { useState, useEffect } from 'react';
import { homepageConfigAPI } from '../services/api';
import { IHomepageConfig } from '../types/homepageConfig';

interface UseHomepageConfigReturn {
  config: IHomepageConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomepageConfig = (): UseHomepageConfigReturn => {
  const [config, setConfig] = useState<IHomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homepageConfigAPI.getActive();
      setConfig(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load homepage configuration');
      console.error('Error fetching homepage config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { config, loading, error, refetch: fetchConfig };
};
