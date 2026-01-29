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

// Popular airports for autocomplete fallback - WORLDWIDE
export const popularAirports = [
  // North America - USA
  { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'US', region: 'North America' },
  { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'US', region: 'North America' },
  { iataCode: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'US', region: 'North America' },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'US', region: 'North America' },
  { iataCode: 'DEN', name: 'Denver International', city: 'Denver', country: 'US', region: 'North America' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'US', region: 'North America' },
  { iataCode: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'US', region: 'North America' },
  { iataCode: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'US', region: 'North America' },
  { iataCode: 'MIA', name: 'Miami International', city: 'Miami', country: 'US', region: 'North America' },
  { iataCode: 'BOS', name: 'Logan International', city: 'Boston', country: 'US', region: 'North America' },
  { iataCode: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'US', region: 'North America' },
  { iataCode: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'US', region: 'North America' },
  { iataCode: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'US', region: 'North America' },
  
  // Canada
  { iataCode: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'CA', region: 'North America' },
  { iataCode: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'CA', region: 'North America' },
  { iataCode: 'YUL', name: 'Montréal-Trudeau International', city: 'Montreal', country: 'CA', region: 'North America' },
  
  // Mexico
  { iataCode: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'MX', region: 'North America' },
  { iataCode: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'MX', region: 'North America' },
  
  // Europe
  { iataCode: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB', region: 'Europe' },
  { iataCode: 'LGW', name: 'London Gatwick', city: 'London', country: 'GB', region: 'Europe' },
  { iataCode: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'FR', region: 'Europe' },
  { iataCode: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'FR', region: 'Europe' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE', region: 'Europe' },
  { iataCode: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'DE', region: 'Europe' },
  { iataCode: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'NL', region: 'Europe' },
  { iataCode: 'MAD', name: 'Madrid-Barajas', city: 'Madrid', country: 'ES', region: 'Europe' },
  { iataCode: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'ES', region: 'Europe' },
  { iataCode: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'IT', region: 'Europe' },
  { iataCode: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'IT', region: 'Europe' },
  { iataCode: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'CH', region: 'Europe' },
  { iataCode: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'AT', region: 'Europe' },
  { iataCode: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR', region: 'Europe' },
  { iataCode: 'ATH', name: 'Athens International', city: 'Athens', country: 'GR', region: 'Europe' },
  { iataCode: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'IE', region: 'Europe' },
  { iataCode: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'DK', region: 'Europe' },
  { iataCode: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'NO', region: 'Europe' },
  { iataCode: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'SE', region: 'Europe' },
  { iataCode: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'FI', region: 'Europe' },
  { iataCode: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'PL', region: 'Europe' },
  { iataCode: 'PRG', name: 'Václav Havel Prague', city: 'Prague', country: 'CZ', region: 'Europe' },
  { iataCode: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'HU', region: 'Europe' },
  { iataCode: 'LIS', name: 'Lisbon Humberto Delgado', city: 'Lisbon', country: 'PT', region: 'Europe' },
  { iataCode: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'BE', region: 'Europe' },
  
  // Middle East
  { iataCode: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'AE', region: 'Middle East' },
  { iataCode: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'AE', region: 'Middle East' },
  { iataCode: 'DOH', name: 'Hamad International', city: 'Doha', country: 'QA', region: 'Middle East' },
  { iataCode: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'SA', region: 'Middle East' },
  { iataCode: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'SA', region: 'Middle East' },
  { iataCode: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'IL', region: 'Middle East' },
  { iataCode: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'JO', region: 'Middle East' },
  { iataCode: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'KW', region: 'Middle East' },
  { iataCode: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'BH', region: 'Middle East' },
  { iataCode: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'OM', region: 'Middle East' },
  
  // Africa - Egypt
  { iataCode: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'EG', region: 'Africa' },
  { iataCode: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'EG', region: 'Africa' },
  { iataCode: 'SSH', name: 'Sharm El Sheikh International', city: 'Sharm El Sheikh', country: 'EG', region: 'Africa' },
  { iataCode: 'LXR', name: 'Luxor International', city: 'Luxor', country: 'EG', region: 'Africa' },
  { iataCode: 'ASW', name: 'Aswan International', city: 'Aswan', country: 'EG', region: 'Africa' },
  { iataCode: 'ALY', name: 'Borg El Arab', city: 'Alexandria', country: 'EG', region: 'Africa' },
  
  // Africa - Other
  { iataCode: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'ZA', region: 'Africa' },
  { iataCode: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'ZA', region: 'Africa' },
  { iataCode: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'KE', region: 'Africa' },
  { iataCode: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'MA', region: 'Africa' },
  { iataCode: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'DZ', region: 'Africa' },
  { iataCode: 'TUN', name: 'Tunis-Carthage', city: 'Tunis', country: 'TN', region: 'Africa' },
  { iataCode: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'NG', region: 'Africa' },
  { iataCode: 'ADD', name: 'Bole International', city: 'Addis Ababa', country: 'ET', region: 'Africa' },
  
  // Asia
  { iataCode: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'JP', region: 'Asia' },
  { iataCode: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'JP', region: 'Asia' },
  { iataCode: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'CN', region: 'Asia' },
  { iataCode: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'CN', region: 'Asia' },
  { iataCode: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'HK', region: 'Asia' },
  { iataCode: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'KR', region: 'Asia' },
  { iataCode: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'SG', region: 'Asia' },
  { iataCode: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH', region: 'Asia' },
  { iataCode: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'MY', region: 'Asia' },
  { iataCode: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'IN', region: 'Asia' },
  { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'IN', region: 'Asia' },
  { iataCode: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'IN', region: 'Asia' },
  { iataCode: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'ID', region: 'Asia' },
  { iataCode: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'PH', region: 'Asia' },
  { iataCode: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'VN', region: 'Asia' },
  { iataCode: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'VN', region: 'Asia' },
  { iataCode: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'TW', region: 'Asia' },
  
  // Oceania
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU', region: 'Oceania' },
  { iataCode: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'AU', region: 'Oceania' },
  { iataCode: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'AU', region: 'Oceania' },
  { iataCode: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'NZ', region: 'Oceania' },
  
  // South America
  { iataCode: 'GRU', name: 'São Paulo-Guarulhos', city: 'São Paulo', country: 'BR', region: 'South America' },
  { iataCode: 'GIG', name: 'Rio de Janeiro-Galeão', city: 'Rio de Janeiro', country: 'BR', region: 'South America' },
  { iataCode: 'EZE', name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'AR', region: 'South America' },
  { iataCode: 'SCL', name: 'Santiago International', city: 'Santiago', country: 'CL', region: 'South America' },
  { iataCode: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'CO', region: 'South America' },
  { iataCode: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'PE', region: 'South America' },
];
