import { Flight, FlightSearchParams } from './types';

// Airline data for realistic mock flights
const airlines = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
];

// Generate random flight number
function randomFlightNumber(airlineCode: string): string {
  return `${airlineCode}${Math.floor(Math.random() * 9000) + 1000}`;
}

// Generate random time
function randomTime(baseDate: string, hourRange: [number, number]): string {
  const date = new Date(baseDate);
  const hour = Math.floor(Math.random() * (hourRange[1] - hourRange[0])) + hourRange[0];
  const minute = Math.floor(Math.random() * 12) * 5; // 5-minute increments
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// Add duration to time
function addMinutes(isoDate: string, minutes: number): string {
  const date = new Date(isoDate);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// Format duration
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Stop locations for layovers
const hubAirports = ['ORD', 'DFW', 'DEN', 'ATL', 'LAX', 'JFK', 'SFO', 'MIA', 'SEA', 'PHX'];

// Generate mock flights based on search params
export function generateMockFlights(params: FlightSearchParams): Flight[] {
  const flights: Flight[] = [];
  const numFlights = 20 + Math.floor(Math.random() * 15); // 20-35 flights

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const stops = Math.random() < 0.4 ? 0 : Math.random() < 0.7 ? 1 : 2;
    
    // Base duration varies by stops
    let baseDuration = 120 + Math.floor(Math.random() * 180); // 2-5 hours base
    if (stops === 1) baseDuration += 60 + Math.floor(Math.random() * 90);
    if (stops === 2) baseDuration += 120 + Math.floor(Math.random() * 120);

    const departureTime = randomTime(params.departureDate, [6, 22]);
    const arrivalTime = addMinutes(departureTime, baseDuration);

    // Price varies by stops (nonstop usually costs more)
    let basePrice = 150 + Math.floor(Math.random() * 300);
    if (stops === 0) basePrice += 50 + Math.floor(Math.random() * 100);
    if (stops === 2) basePrice -= 30 + Math.floor(Math.random() * 50);

    // Generate stop locations
    const stopLocations: string[] = [];
    for (let s = 0; s < stops; s++) {
      let hub = hubAirports[Math.floor(Math.random() * hubAirports.length)];
      while (hub === params.origin || hub === params.destination || stopLocations.includes(hub)) {
        hub = hubAirports[Math.floor(Math.random() * hubAirports.length)];
      }
      stopLocations.push(hub);
    }

    flights.push({
      id: `mock-${i + 1}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: randomFlightNumber(airline.code),
      origin: params.origin,
      destination: params.destination,
      departureTime,
      arrivalTime,
      duration: baseDuration,
      durationFormatted: formatDuration(baseDuration),
      stops,
      stopLocations,
      price: basePrice,
      currency: 'USD',
      cabinClass: 'ECONOMY',
    });
  }

  // Sort by price by default
  return flights.sort((a, b) => a.price - b.price);
}

// Popular airports for autocomplete fallback
export const popularAirports = [
  { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { iataCode: 'ORD', name: "O'Hare International", city: 'Chicago' },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas' },
  { iataCode: 'DEN', name: 'Denver International', city: 'Denver' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta' },
  { iataCode: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
  { iataCode: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle' },
  { iataCode: 'MIA', name: 'Miami International', city: 'Miami' },
  { iataCode: 'BOS', name: 'Logan International', city: 'Boston' },
  { iataCode: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix' },
  { iataCode: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' },
  { iataCode: 'LAS', name: 'Harry Reid International', city: 'Las Vegas' },
  { iataCode: 'MCO', name: 'Orlando International', city: 'Orlando' },
  { iataCode: 'EWR', name: 'Newark Liberty International', city: 'Newark' },
  { iataCode: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte' },
  { iataCode: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis' },
  { iataCode: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit' },
  { iataCode: 'PHL', name: 'Philadelphia International', city: 'Philadelphia' },
  { iataCode: 'LGA', name: 'LaGuardia', city: 'New York' },
];
