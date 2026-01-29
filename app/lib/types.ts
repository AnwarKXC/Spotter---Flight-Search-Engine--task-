// Flight search response types based on Amadeus API
export interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
    grandTotal: string;
  };
  itineraries: Itinerary[];
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string; // ISO 8601 duration format (e.g., "PT2H30M")
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  numberOfStops: number;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
  };
}

// Simplified flight for UI display
export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minutes
  durationFormatted: string;
  stops: number;
  stopLocations: string[];
  price: number;
  currency: string;
  cabinClass: string;
  // For badges
  isCheapest?: boolean;
  isFastest?: boolean;
  isBestValue?: boolean;
}

// Search parameters
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  maxPrice?: number;
}

// Airport for autocomplete
export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

// API response wrapper
export interface FlightSearchResponse {
  flights: Flight[];
  dictionaries?: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
  };
  isFromCache: boolean;
  isMockData: boolean;
}

// Filter state
export interface FlightFilters {
  stops: number[];
  airlines: string[];
  priceRange: [number, number];
}
