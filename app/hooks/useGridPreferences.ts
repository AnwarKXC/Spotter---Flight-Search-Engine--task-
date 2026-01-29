'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';

const STORAGE_KEY = 'flights-grid-preferences';

interface GridPreferences {
  columnVisibility: GridColumnVisibilityModel;
  density: 'compact' | 'standard' | 'comfortable';
  pageSize: number;
}

const DEFAULT_PREFERENCES: GridPreferences = {
  columnVisibility: {},
  density: 'standard',
  pageSize: 25,
};

interface UseGridPreferencesReturn {
  preferences: GridPreferences;
  setColumnVisibility: (model: GridColumnVisibilityModel) => void;
  setDensity: (density: GridPreferences['density']) => void;
  setPageSize: (size: number) => void;
  resetPreferences: () => void;
}

// Load preferences from localStorage synchronously (for initial state)
function loadPreferences(): GridPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<GridPreferences>;
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load grid preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

export function useGridPreferences(): UseGridPreferencesReturn {
  const [preferences, setPreferences] = useState<GridPreferences>(loadPreferences);
  const isInitialMount = useRef(true);

  // Save preferences to localStorage when they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save grid preferences:', error);
    }
  }, [preferences]);

  const setColumnVisibility = useCallback((model: GridColumnVisibilityModel) => {
    setPreferences((prev) => ({ ...prev, columnVisibility: model }));
  }, []);

  const setDensity = useCallback((density: GridPreferences['density']) => {
    setPreferences((prev) => ({ ...prev, density }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPreferences((prev) => ({ ...prev, pageSize }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset grid preferences:', error);
    }
  }, []);

  return {
    preferences,
    setColumnVisibility,
    setDensity,
    setPageSize,
    resetPreferences,
  };
}

export default useGridPreferences;
