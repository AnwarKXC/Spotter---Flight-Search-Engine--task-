'use client';

import { useState, useCallback } from 'react';
import { Flight, FlightSearchParams, FlightSearchResponse } from '@/app/lib/types';

interface UseFlightsSearchReturn {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  isMockData: boolean;
  hasSearched: boolean;
  searchParams: FlightSearchParams | null;
  search: (params: FlightSearchParams) => Promise<void>;
  clearResults: () => void;
}

export function useFlightsSearch(): UseFlightsSearchReturn {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);

  const search = useCallback(async (params: FlightSearchParams) => {
    setIsLoading(true);
    setError(null);
    setSearchParams(params);
    setHasSearched(true);

    try {
      // Call the API route
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FlightSearchResponse = await response.json();
      
      setFlights(data.flights);
      setIsMockData(data.isMockData);
      
      if (data.isMockData) {
        setError('Using demo data - API quota may be exceeded');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search flights');
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setFlights([]);
    setError(null);
    setIsMockData(false);
    setHasSearched(false);
    setSearchParams(null);
  }, []);

  return {
    flights,
    isLoading,
    error,
    isMockData,
    hasSearched,
    searchParams,
    search,
    clearResults,
  };
}

export default useFlightsSearch;
