// IP-based geolocation service (no permission required)
// Uses internal API route to proxy requests (avoids mixed content on HTTPS)

export interface UserLocation {
	city: string
	country: string
	countryCode: string
	latitude: number
	longitude: number
	timezone: string
}

/**
 * Detects user location using IP geolocation (no permission needed)
 * Uses internal API route to avoid mixed content issues on HTTPS
 * Falls back to a default location if detection fails
 */
export async function detectUserLocation (): Promise<UserLocation> {
	try {
		// Use internal API route to proxy geolocation request (avoids mixed content on HTTPS)
		const response = await fetch( '/api/geolocation', {
			cache: 'force-cache', // Cache the result
		} )

		if ( !response.ok ) {
			throw new Error( 'Failed to fetch location' )
		}

		const data = await response.json()

		return {
			city: data.city || 'Unknown',
			country: data.countryName || data.country,
			countryCode: data.countryCode,
			latitude: data.latitude,
			longitude: data.longitude,
			timezone: data.timezone,
		}
	} catch ( error ) {
		console.warn( 'Could not detect location via IP:', error )

		// Return a sensible default (can be customized)
		return {
			city: 'Unknown',
			country: 'Unknown',
			countryCode: 'US',
			latitude: 40.7128,
			longitude: -74.006,
			timezone: 'America/New_York',
		}
	}
}

// Popular destinations by region/country
export interface SuggestedDestination {
	city: string
	country: string
	airportCode: string
	imageUrl: string
	priceFrom: number
	currency: string
	flightDuration: string
	highlights: string[]
	departureDate?: string  // ISO date string
	returnDate?: string     // ISO date string
}

// Helper to generate suggested travel dates (2 weeks from now, 1 week trip)
export function generateTravelDates (): { departureDate: string; returnDate: string } {
	const departure = new Date()
	departure.setDate( departure.getDate() + 14 ) // 2 weeks from now

	const returnD = new Date( departure )
	returnD.setDate( returnD.getDate() + 7 ) // 1 week trip

	return {
		departureDate: departure.toISOString().split( 'T' )[ 0 ],
		returnDate: returnD.toISOString().split( 'T' )[ 0 ],
	}
}

// Format date for display (e.g., "Feb 22 - Mar 2")
export function formatDateRange ( departureDate: string, returnDate: string ): string {
	const departure = new Date( departureDate )
	const returnD = new Date( returnDate )

	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
	const depStr = departure.toLocaleDateString( 'en-US', options )
	const retStr = returnD.toLocaleDateString( 'en-US', options )

	return `${ depStr } – ${ retStr }`
}

// Suggested destinations based on origin country
export const destinationsByOrigin: Record<string, SuggestedDestination[]> = {
	// Egypt origins
	EG: [
		{
			city: 'Dubai',
			country: 'UAE',
			airportCode: 'DXB',
			imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop',
			priceFrom: 12784,
			currency: 'EGP',
			flightDuration: '3h 30m',
			highlights: [ 'Shopping', 'Luxury', 'Beaches' ],
		},
		{
			city: 'London',
			country: 'UK',
			airportCode: 'LHR',
			imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
			priceFrom: 11426,
			currency: 'EGP',
			flightDuration: '5h 15m',
			highlights: [ 'History', 'Culture', 'Museums' ],
		},
		{
			city: 'Milan',
			country: 'Italy',
			airportCode: 'MXP',
			imageUrl: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=400&h=250&fit=crop',
			priceFrom: 7024,
			currency: 'EGP',
			flightDuration: '3h 45m',
			highlights: [ 'Fashion', 'Art', 'Food' ],
		},
		{
			city: 'Istanbul',
			country: 'Turkey',
			airportCode: 'IST',
			imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=250&fit=crop',
			priceFrom: 5500,
			currency: 'EGP',
			flightDuration: '2h 15m',
			highlights: [ 'History', 'Food', 'Shopping' ],
		},
		{
			city: 'Paris',
			country: 'France',
			airportCode: 'CDG',
			imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
			priceFrom: 9800,
			currency: 'EGP',
			flightDuration: '4h 45m',
			highlights: [ 'Romance', 'Art', 'Cuisine' ],
		},
		{
			city: 'Jeddah',
			country: 'Saudi Arabia',
			airportCode: 'JED',
			imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=400&h=250&fit=crop',
			priceFrom: 4200,
			currency: 'EGP',
			flightDuration: '1h 45m',
			highlights: [ 'Religious', 'Culture', 'Beaches' ],
		},
	],

	// US origins
	US: [
		{
			city: 'London',
			country: 'UK',
			airportCode: 'LHR',
			imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
			priceFrom: 450,
			currency: 'USD',
			flightDuration: '7h 30m',
			highlights: [ 'History', 'Culture', 'Theater' ],
		},
		{
			city: 'Paris',
			country: 'France',
			airportCode: 'CDG',
			imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
			priceFrom: 520,
			currency: 'USD',
			flightDuration: '8h 15m',
			highlights: [ 'Romance', 'Art', 'Cuisine' ],
		},
		{
			city: 'Tokyo',
			country: 'Japan',
			airportCode: 'NRT',
			imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
			priceFrom: 780,
			currency: 'USD',
			flightDuration: '14h',
			highlights: [ 'Technology', 'Culture', 'Food' ],
		},
		{
			city: 'Cancun',
			country: 'Mexico',
			airportCode: 'CUN',
			imageUrl: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400&h=250&fit=crop',
			priceFrom: 280,
			currency: 'USD',
			flightDuration: '3h 30m',
			highlights: [ 'Beaches', 'Resorts', 'Nightlife' ],
		},
		{
			city: 'Rome',
			country: 'Italy',
			airportCode: 'FCO',
			imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=250&fit=crop',
			priceFrom: 580,
			currency: 'USD',
			flightDuration: '9h',
			highlights: [ 'History', 'Art', 'Food' ],
		},
		{
			city: 'Barcelona',
			country: 'Spain',
			airportCode: 'BCN',
			imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=250&fit=crop',
			priceFrom: 490,
			currency: 'USD',
			flightDuration: '8h 30m',
			highlights: [ 'Architecture', 'Beaches', 'Nightlife' ],
		},
	],

	// UK origins
	GB: [
		{
			city: 'New York',
			country: 'USA',
			airportCode: 'JFK',
			imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
			priceFrom: 380,
			currency: 'GBP',
			flightDuration: '8h',
			highlights: [ 'Shopping', 'Shows', 'Food' ],
		},
		{
			city: 'Dubai',
			country: 'UAE',
			airportCode: 'DXB',
			imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop',
			priceFrom: 420,
			currency: 'GBP',
			flightDuration: '7h',
			highlights: [ 'Luxury', 'Shopping', 'Beaches' ],
		},
		{
			city: 'Amsterdam',
			country: 'Netherlands',
			airportCode: 'AMS',
			imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=250&fit=crop',
			priceFrom: 85,
			currency: 'GBP',
			flightDuration: '1h 15m',
			highlights: [ 'Culture', 'Canals', 'Museums' ],
		},
		{
			city: 'Malaga',
			country: 'Spain',
			airportCode: 'AGP',
			imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=250&fit=crop',
			priceFrom: 65,
			currency: 'GBP',
			flightDuration: '2h 45m',
			highlights: [ 'Beaches', 'Sun', 'Tapas' ],
		},
		{
			city: 'Lisbon',
			country: 'Portugal',
			airportCode: 'LIS',
			imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
			priceFrom: 75,
			currency: 'GBP',
			flightDuration: '2h 40m',
			highlights: [ 'History', 'Food', 'Beaches' ],
		},
		{
			city: 'Reykjavik',
			country: 'Iceland',
			airportCode: 'KEF',
			imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&h=250&fit=crop',
			priceFrom: 150,
			currency: 'GBP',
			flightDuration: '3h',
			highlights: [ 'Nature', 'Northern Lights', 'Adventure' ],
		},
	],

	// Default for other countries
	DEFAULT: [
		{
			city: 'Paris',
			country: 'France',
			airportCode: 'CDG',
			imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
			priceFrom: 350,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'Romance', 'Art', 'Cuisine' ],
		},
		{
			city: 'Tokyo',
			country: 'Japan',
			airportCode: 'NRT',
			imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
			priceFrom: 600,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'Technology', 'Culture', 'Food' ],
		},
		{
			city: 'New York',
			country: 'USA',
			airportCode: 'JFK',
			imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop',
			priceFrom: 450,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'Shopping', 'Shows', 'Diversity' ],
		},
		{
			city: 'Dubai',
			country: 'UAE',
			airportCode: 'DXB',
			imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop',
			priceFrom: 400,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'Luxury', 'Shopping', 'Sun' ],
		},
		{
			city: 'London',
			country: 'UK',
			airportCode: 'LHR',
			imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop',
			priceFrom: 380,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'History', 'Culture', 'Theater' ],
		},
		{
			city: 'Bali',
			country: 'Indonesia',
			airportCode: 'DPS',
			imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop',
			priceFrom: 550,
			currency: 'USD',
			flightDuration: 'Varies',
			highlights: [ 'Beaches', 'Temples', 'Nature' ],
		},
	],
}

/**
 * Get suggested destinations based on user's country
 */
export function getSuggestedDestinations ( countryCode: string ): SuggestedDestination[] {
	return destinationsByOrigin[ countryCode ] || destinationsByOrigin.DEFAULT
}

/**
 * Get nearest major airport based on user's location
 */
export function getNearestAirport ( countryCode: string, _city?: string ): { code: string; name: string } {
	const airportsByCountry: Record<string, { code: string; name: string }[]> = {
		EG: [
			{ code: 'CAI', name: 'Cairo International' },
			{ code: 'HRG', name: 'Hurghada International' },
			{ code: 'SSH', name: 'Sharm El Sheikh International' },
		],
		US: [
			{ code: 'JFK', name: 'John F. Kennedy International' },
			{ code: 'LAX', name: 'Los Angeles International' },
			{ code: 'ORD', name: "O'Hare International" },
		],
		GB: [
			{ code: 'LHR', name: 'London Heathrow' },
			{ code: 'LGW', name: 'London Gatwick' },
			{ code: 'MAN', name: 'Manchester Airport' },
		],
		DEFAULT: [
			{ code: 'JFK', name: 'John F. Kennedy International' },
		],
	}

	const airports = airportsByCountry[ countryCode ] || airportsByCountry.DEFAULT
	return airports[ 0 ] // Return first (main) airport for simplicity
}
