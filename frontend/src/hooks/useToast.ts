import { useCallback } from 'react';
import { AxiosResponse, AxiosError } from 'axios';
import {
  showToastFromResponse,
  showToastFromError,
  toastUtils,
  ApiResponse,
} from '../utils/toast';

/**
 * Custom hook for toast notifications
 * Provides convenient methods to show toasts from API responses
 */
export const useToast = () => {
  /**
   * Show toast from successful API response
   */
  const showSuccess = useCallback(
    (response: ApiResponse | AxiosResponse<ApiResponse>) => {
      return showToastFromResponse(response);
    },
    []
  );

  /**
   * Show toast from API error
   */
  const showError = useCallback((error: AxiosError<ApiResponse> | Error | any) => {
    return showToastFromError(error);
  }, []);

  /**
   * Show toast from any API response (success or error)
   */
  const showFromResponse = useCallback(
    (response: ApiResponse | AxiosResponse<ApiResponse>, statusCode?: number) => {
      return showToastFromResponse(response, statusCode);
    },
    []
  );

  /**
   * Direct toast methods
   */
  const success = useCallback((message: string) => {
    return toastUtils.success(message);
  }, []);

  const error = useCallback((message: string) => {
    return toastUtils.error(message);
  }, []);

  const warning = useCallback((message: string) => {
    return toastUtils.warning(message);
  }, []);

  const info = useCallback((message: string) => {
    return toastUtils.info(message);
  }, []);

  return {
    showSuccess,
    showError,
    showFromResponse,
    success,
    error,
    warning,
    info,
  };
};
