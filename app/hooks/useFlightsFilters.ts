'use client';

import { useState, useCallback, useMemo } from 'react';
import { Flight, FlightFilters } from '@/app/lib/types';

const DEFAULT_FILTERS: FlightFilters = {
  stops: [],
  airlines: [],
  priceRange: [0, 10000],
};

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
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

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
