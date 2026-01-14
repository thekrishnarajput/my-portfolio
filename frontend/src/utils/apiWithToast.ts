import { AxiosResponse, AxiosError } from 'axios';
import { showToastFromResponse, showToastFromError, ApiResponse } from './toast';

/**
 * Wrapper function to handle API calls with automatic toast notifications
 * 
 * @param apiCall - The API call promise
 * @param options - Options for toast behavior
 * @returns The API response data
 * 
 * @example
 * ```tsx
 * const data = await apiWithToast(
 *   projectsAPI.create(projectData),
 *   { showToast: true }
 * );
 * ```
 */
export const apiWithToast = async <T = any>(
  apiCall: Promise<AxiosResponse<ApiResponse<T>>>,
  options: {
    showToast?: boolean;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T | null> => {
  const {
    showToast = true,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
    errorMessage,
  } = options;

  try {
    const response = await apiCall;

    // Show success toast if enabled
    if (showToast && showSuccessToast) {
      if (successMessage) {
        // Use custom success message
        showToastFromResponse({
          success: true,
          message: successMessage,
        } as ApiResponse);
      } else {
        // Use API response message
        showToastFromResponse(response);
      }
    }

    return (response.data.data || response.data) as T | null;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;

    // Show error toast if enabled
    if (showToast && showErrorToast) {
      if (errorMessage) {
        // Use custom error message
        showToastFromError({
          ...axiosError,
          response: {
            ...axiosError.response!,
            data: {
              success: false,
              message: errorMessage,
            },
          },
        } as AxiosError<ApiResponse>);
      } else {
        // Use API error message
        showToastFromError(axiosError);
      }
    }

    throw error;
  }
};
