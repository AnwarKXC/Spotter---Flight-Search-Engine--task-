'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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

// Parse search params from URL
function parseSearchParamsFromURL(urlParams: URLSearchParams): FlightSearchParams | null {
  const origin = urlParams.get('origin');
  const destination = urlParams.get('destination');
  const departureDate = urlParams.get('departureDate');
  const adults = urlParams.get('adults');

  if (!origin || !destination || !departureDate) {
    return null;
  }

  return {
    origin,
    destination,
    departureDate,
    returnDate: urlParams.get('returnDate') || undefined,
    adults: adults ? parseInt(adults, 10) : 1,
  };
}

// Serialize search params to URL
function serializeSearchParamsToURL(
  params: FlightSearchParams,
  existingParams: URLSearchParams
): URLSearchParams {
  const newParams = new URLSearchParams(existingParams);
  
  newParams.set('origin', params.origin);
  newParams.set('destination', params.destination);
  newParams.set('departureDate', params.departureDate);
  
  if (params.returnDate) {
    newParams.set('returnDate', params.returnDate);
  } else {
    newParams.delete('returnDate');
  }
  
  if (params.adults && params.adults !== 1) {
    newParams.set('adults', params.adults.toString());
  } else {
    newParams.delete('adults');
  }

  return newParams;
}

export function useFlightsSearch(): UseFlightsSearchReturn {
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Core search function (without URL update)
  const performSearch = useCallback(async (params: FlightSearchParams) => {
    setIsLoading(true);
    setError(null);
    setSearchParams(params);
    setHasSearched(true);

    try {
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

  // Search function that also updates URL
  const search = useCallback(async (params: FlightSearchParams) => {
    // Update URL with search params
    const newParams = serializeSearchParamsToURL(params, urlSearchParams);
    const newUrl = `${pathname}?${newParams.toString()}`;
    router.replace(newUrl, { scroll: false });

    // Perform the search
    await performSearch(params);
  }, [performSearch, pathname, router, urlSearchParams]);

  // Initialize from URL on first load
  useEffect(() => {
    if (hasInitialized) return;

    const urlParams = parseSearchParamsFromURL(urlSearchParams);
    if (urlParams) {
      setHasInitialized(true);
      performSearch(urlParams);
    } else {
      setHasInitialized(true);
    }
  }, [urlSearchParams, hasInitialized, performSearch]);

  const clearResults = useCallback(() => {
    setFlights([]);
    setError(null);
    setIsMockData(false);
    setHasSearched(false);
    setSearchParams(null);
    
    // Clear search params from URL but keep filter params
    const newParams = new URLSearchParams(urlSearchParams);
    newParams.delete('origin');
    newParams.delete('destination');
    newParams.delete('departureDate');
    newParams.delete('returnDate');
    newParams.delete('adults');
    
    const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, urlSearchParams]);

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
