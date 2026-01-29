import Amadeus from 'amadeus';
import { FlightOffer, Flight, FlightSearchParams, FlightSearchResponse } from './types';
import { generateMockFlights } from './mockData';

// Initialize Amadeus client (server-side only)
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY!,
  clientSecret: process.env.AMADEUS_API_SECRET!,
});

// Parse ISO 8601 duration to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

// Format minutes to "Xh Ym" display
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Transform Amadeus response to our Flight type
function transformFlightOffer(
  offer: FlightOffer,
  carriers: Record<string, string> = {}
): Flight {
  const firstItinerary = offer.itineraries[0];
  const segments = firstItinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  const durationMinutes = parseDuration(firstItinerary.duration);
  const stops = segments.length - 1;
  const stopLocations = segments.slice(0, -1).map(s => s.arrival.iataCode);

  return {
    id: offer.id,
    airline: carriers[firstSegment.carrierCode] || firstSegment.carrierCode,
    airlineCode: firstSegment.carrierCode,
    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
    origin: firstSegment.departure.iataCode,
    destination: lastSegment.arrival.iataCode,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: durationMinutes,
    durationFormatted: formatDuration(durationMinutes),
    stops,
    stopLocations,
    price: parseFloat(offer.price.grandTotal),
    currency: offer.price.currency,
    cabinClass: offer.travelerPricings[0]?.fareOption || 'ECONOMY',
  };
}

// Add badges to flights
function addBadges(flights: Flight[]): Flight[] {
  if (flights.length === 0) return flights;

  const cheapest = Math.min(...flights.map(f => f.price));
  const fastest = Math.min(...flights.map(f => f.duration));
  
  // Best value: balance of price and duration (normalized scores)
  const maxPrice = Math.max(...flights.map(f => f.price));
  const maxDuration = Math.max(...flights.map(f => f.duration));
  
  let bestValueId = flights[0].id;
  let bestValueScore = Infinity;
  
  flights.forEach(f => {
    const priceScore = f.price / maxPrice;
    const durationScore = f.duration / maxDuration;
    const score = priceScore * 0.6 + durationScore * 0.4; // Weight price more
    if (score < bestValueScore) {
      bestValueScore = score;
      bestValueId = f.id;
    }
  });

  return flights.map(f => ({
    ...f,
    isCheapest: f.price === cheapest,
    isFastest: f.duration === fastest,
    isBestValue: f.id === bestValueId && !f.isCheapest && !f.isFastest,
  }));
}

// Main search function
export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      travelClass: params.travelClass,
      nonStop: params.nonStop,
      maxPrice: params.maxPrice,
      max: 50, // Limit results
    });

    const offers = response.data as FlightOffer[];
    const carriers = response.result?.dictionaries?.carriers || {};
    
    const flights = offers.map(offer => transformFlightOffer(offer, carriers));
    const flightsWithBadges = addBadges(flights);

    const dictionaries = response.result?.dictionaries;

    return {
      flights: flightsWithBadges,
      dictionaries: dictionaries ? {
        carriers: dictionaries.carriers || {},
        aircraft: dictionaries.aircraft || {},
      } : undefined,
      isFromCache: false,
      isMockData: false,
    };
  } catch (error: unknown) {
    console.error('Amadeus API error:', error);
    
    // Check for rate limit
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { statusCode?: number } };
      if (apiError.response?.statusCode === 429) {
        console.warn('Rate limit exceeded, falling back to mock data');
      }
    }
    
    // Fallback to mock data
    const mockFlights = generateMockFlights(params);
    return {
      flights: addBadges(mockFlights),
      isFromCache: false,
      isMockData: true,
    };
  }
}

// Airport search for autocomplete
export async function searchAirports(keyword: string): Promise<{ iataCode: string; name: string; city: string }[]> {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY',
      'page[limit]': 10,
    });

    return response.data.map((loc: { iataCode: string; name: string; address?: { cityName?: string } }) => ({
      iataCode: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName || '',
    }));
  } catch (error) {
    console.error('Airport search error:', error);
    return [];
  }
}
