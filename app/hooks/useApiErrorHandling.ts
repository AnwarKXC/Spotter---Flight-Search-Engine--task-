'use client';

import { useState, useCallback, useRef } from 'react';

interface UseApiErrorHandlingOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number) => void;
}

interface ApiError {
  message: string;
  code?: string | number;
  isRateLimit?: boolean;
  isNetworkError?: boolean;
}

interface UseApiErrorHandlingReturn<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  error: ApiError | null;
  isRetrying: boolean;
  retryCount: number;
  clearError: () => void;
}

export function useApiErrorHandling<T>(
  options: UseApiErrorHandlingOptions = {}
): UseApiErrorHandlingReturn<T> {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = options;
  
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const parseError = useCallback((err: unknown): ApiError => {
    // Handle rate limit (429)
    if (err && typeof err === 'object') {
      const apiErr = err as { response?: { statusCode?: number }; message?: string };
      
      if (apiErr.response?.statusCode === 429) {
        return {
          message: 'API quota exceeded, showing cached results',
          code: 429,
          isRateLimit: true,
        };
      }
    }

    // Handle network errors
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return {
        message: 'Connection failed. Please check your internet connection.',
        isNetworkError: true,
      };
    }

    // Handle AbortError
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        message: 'Request was cancelled',
        code: 'ABORT',
      };
    }

    // Generic error
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { message };
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setError(null);
      setRetryCount(0);

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setIsRetrying(true);
            setRetryCount(attempt);
            onRetry?.(attempt);
            
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
          }

          const result = await apiCall();
          setIsRetrying(false);
          return result;
        } catch (err) {
          const parsedError = parseError(err);
          
          // Don't retry on rate limit or abort
          if (parsedError.isRateLimit || parsedError.code === 'ABORT') {
            setError(parsedError);
            setIsRetrying(false);
            return null;
          }

          // If we've exhausted retries, set the error
          if (attempt === maxRetries) {
            setError({
              ...parsedError,
              message: `${parsedError.message}. Please try again.`,
            });
            setIsRetrying(false);
            return null;
          }
        }
      }

      setIsRetrying(false);
      return null;
    },
    [maxRetries, baseDelay, onRetry, parseError]
  );

  return {
    execute,
    error,
    isRetrying,
    retryCount,
    clearError,
  };
}

// Error message helper
export function getErrorMessage(error: ApiError | null): string {
  if (!error) return '';
  
  if (error.isRateLimit) {
    return 'API quota exceeded, showing cached results';
  }
  
  if (error.isNetworkError) {
    return 'Connection failed, retrying...';
  }
  
  return error.message;
}

export default useApiErrorHandling;
