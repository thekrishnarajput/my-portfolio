import { toast, ToastOptions, Id } from 'react-toastify';
import { AxiosResponse, AxiosError } from 'axios';

/**
 * API Response structure from backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Toast types based on success status and HTTP status codes
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Get toast type based on API response and HTTP status
 */
export const getToastType = (
  success: boolean,
  statusCode?: number
): ToastType => {
  if (success) {
    return 'success';
  }

  if (statusCode) {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode === 401 || statusCode === 403) {
      return 'warning';
    }
    if (statusCode >= 400) {
      return 'error';
    }
  }

  return 'error';
};

/**
 * Show toast notification from API response
 */
export const showToastFromResponse = (
  response: ApiResponse | AxiosResponse<ApiResponse>,
  statusCode?: number
): Id => {
  // Extract response data
  const responseData = 'data' in response ? response.data : response;
  const message = responseData.message || 'Operation completed';
  const success = responseData.success ?? false;
  const httpStatus = statusCode || ('status' in response ? response.status : undefined);

  // Determine toast type
  const type = getToastType(success, httpStatus);

  // Toast options
  const toastOptions: ToastOptions = {
    position: 'bottom-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    progress: undefined,
    type,
  };

  // Show toast based on type
  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast.warning(message, toastOptions);
    case 'info':
      return toast.info(message, toastOptions);
    default:
      return toast(message, toastOptions);
  }
};

/**
 * Show toast from Axios error or any error
 */
export const showToastFromError = (error: AxiosError<ApiResponse> | Error | any): Id => {
  // Handle AxiosError
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiResponse>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An error occurred';
    const statusCode = axiosError.response?.status;

    const type = getToastType(false, statusCode);

    const toastOptions: ToastOptions = {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
      draggable: true,
      progress: undefined,
      type,
    };

    switch (type) {
      case 'error':
        return toast.error(message, toastOptions);
      case 'warning':
        return toast.warning(message, toastOptions);
      default:
        return toast.error(message, toastOptions);
    }
  }

  // Handle regular Error or string
  const message =
    (error && typeof error === 'object' && 'message' in error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'An error occurred') || 'An error occurred';

  const toastOptions: ToastOptions = {
    position: 'bottom-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    progress: undefined,
    type: 'error',
  };

  return toast.error(message, toastOptions);
};

/**
 * Convenience functions for different toast types
 */
export const toastUtils = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast.info(message, {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
      ...options,
    }),
};
