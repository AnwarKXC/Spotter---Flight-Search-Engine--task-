'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Flight, FlightFilters } from '@/app/lib/types';

const DEFAULT_FILTERS: FlightFilters = {
  stops: [],
  airlines: [],
  priceRange: [0, 10000],
};

// Parse filters from URL search params
function parseFiltersFromURL(searchParams: URLSearchParams, priceExtent: [number, number]): Partial<FlightFilters> {
  const filters: Partial<FlightFilters> = {};

  const stopsParam = searchParams.get('stops');
  if (stopsParam) {
    filters.stops = stopsParam.split(',').map(Number).filter(n => !isNaN(n));
  }

  const airlinesParam = searchParams.get('airlines');
  if (airlinesParam) {
    filters.airlines = airlinesParam.split(',').filter(Boolean);
  }

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    filters.priceRange = [
      minPrice ? Number(minPrice) : priceExtent[0],
      maxPrice ? Number(maxPrice) : priceExtent[1],
    ];
  }

  return filters;
}

// Serialize filters to URL search params
function serializeFiltersToURL(
  filters: FlightFilters,
  priceExtent: [number, number],
  existingParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existingParams);

  // Stops
  if (filters.stops.length > 0) {
    params.set('stops', filters.stops.join(','));
  } else {
    params.delete('stops');
  }

  // Airlines
  if (filters.airlines.length > 0) {
    params.set('airlines', filters.airlines.join(','));
  } else {
    params.delete('airlines');
  }

  // Price range (only if different from extent)
  if (filters.priceRange[0] > priceExtent[0]) {
    params.set('minPrice', filters.priceRange[0].toString());
  } else {
    params.delete('minPrice');
  }

  if (filters.priceRange[1] < priceExtent[1]) {
    params.set('maxPrice', filters.priceRange[1].toString());
  } else {
    params.delete('maxPrice');
  }

  return params;
}

interface UseFlightsFiltersReturn {
  filters: FlightFilters;
  setFilters: React.Dispatch<React.SetStateAction<FlightFilters>>;
  filteredFlights: Flight[];
  setStops: (stops: number[]) => void;
  setAirlines: (airlines: string[]) => void;
  setPriceRange: (range: [number, number]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  availableAirlines: { code: string; name: string }[];
  priceExtent: [number, number];
}

export function useFlightsFilters(flights: Flight[]): UseFlightsFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate available airlines from flights
  const availableAirlines = useMemo(() => {
    const airlineMap = new Map<string, string>();
    flights.forEach(flight => {
      if (!airlineMap.has(flight.airlineCode)) {
        airlineMap.set(flight.airlineCode, flight.airline);
      }
    });
    return Array.from(airlineMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [flights]);

  // Calculate price extent from flights
  const priceExtent = useMemo((): [number, number] => {
    if (flights.length === 0) return [0, 10000];
    const prices = flights.map(f => f.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [flights]);

  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

  // Initialize filters from URL on first load when flights arrive
  useEffect(() => {
    if (!isInitialized && flights.length > 0) {
      setIsInitialized(true);
    }
  }, [flights.length, isInitialized]);

  // Apply URL filters once initialized
  useEffect(() => {
    if (isInitialized && flights.length > 0) {
      const urlFilters = parseFiltersFromURL(searchParams, priceExtent);
      const newFilters = {
        stops: urlFilters.stops ?? [],
        airlines: urlFilters.airlines ?? [],
        priceRange: urlFilters.priceRange ?? priceExtent,
      };
      // Only update if different to prevent loops
      setFilters(prev => {
        if (
          JSON.stringify(prev.stops) !== JSON.stringify(newFilters.stops) ||
          JSON.stringify(prev.airlines) !== JSON.stringify(newFilters.airlines) ||
          JSON.stringify(prev.priceRange) !== JSON.stringify(newFilters.priceRange)
        ) {
          return newFilters;
        }
        return prev;
      });
    }
  // Only run when initialized changes, not on every searchParams change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, flights.length]);

  // Sync filters to URL when they change (after render, not during)
  useEffect(() => {
    if (!isInitialized) return;

    const newParams = serializeFiltersToURL(filters, priceExtent, searchParams);
    const newUrl = `${pathname}?${newParams.toString()}`;
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, priceExtent, pathname, router, searchParams, isInitialized]);

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // Filter by stops
      if (filters.stops.length > 0) {
        // Handle "2+" case: if 2 is in the filter, include all stops >= 2
        const matchesStops = filters.stops.some(stop => 
          stop === 2 ? flight.stops >= 2 : flight.stops === stop
        );
        if (!matchesStops) return false;
      }

      // Filter by airlines
      if (filters.airlines.length > 0) {
        if (!filters.airlines.includes(flight.airlineCode)) return false;
      }

      // Filter by price range
      const [minPrice, maxPrice] = filters.priceRange;
      if (flight.price < minPrice || flight.price > maxPrice) return false;

      return true;
    });
  }, [flights, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.stops.length > 0 ||
      filters.airlines.length > 0 ||
      filters.priceRange[0] > priceExtent[0] ||
      filters.priceRange[1] < priceExtent[1]
    );
  }, [filters, priceExtent]);

  // Filter setters
  const setStops = useCallback((stops: number[]) => {
    setFilters(prev => ({ ...prev, stops }));
  }, []);

  const setAirlines = useCallback((airlines: string[]) => {
    setFilters(prev => ({ ...prev, airlines }));
  }, []);

  const setPriceRange = useCallback((priceRange: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      priceRange: priceExtent,
    });
  }, [priceExtent]);

  return {
    filters,
    setFilters,
    filteredFlights,
    setStops,
    setAirlines,
    setPriceRange,
    clearFilters,
    hasActiveFilters,
    availableAirlines,
    priceExtent,
  };
}

export default useFlightsFilters;
