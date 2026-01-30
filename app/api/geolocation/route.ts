import { NextResponse } from 'next/server'

interface IPAPIResponse {
	status?: string
	country: string
	countryCode: string
	city: string
	region?: string
	lat: number
	lon: number
	timezone: string
}

interface GeolocationResponse {
	country: string
	countryCode: string
	countryName: string
	city: string
	region: string
	latitude: number
	longitude: number
	timezone: string
}

// Server-side geolocation endpoint to avoid mixed content issues
// This proxies requests to ip-api.com from the server where HTTP is allowed
export async function GET ( request: Request ): Promise<NextResponse<GeolocationResponse | { error: string }>> {
	try {
		// Get client IP from headers (Vercel/Next.js provides this)
		const forwardedFor = request.headers.get( 'x-forwarded-for' )
		const realIp = request.headers.get( 'x-real-ip' )
		const clientIp = forwardedFor?.split( ',' )[ 0 ] || realIp || ''

		// Use ip-api.com with the client's IP (HTTP is fine server-side)
		const ipApiUrl = clientIp
			? `http://ip-api.com/json/${ clientIp }?fields=status,country,countryCode,city,region,lat,lon,timezone`
			: 'http://ip-api.com/json/?fields=status,country,countryCode,city,region,lat,lon,timezone'

		const response = await fetch( ipApiUrl, {
			headers: {
				Accept: 'application/json',
			},
			// Cache for 1 hour
			next: { revalidate: 3600 },
		} )

		if ( !response.ok ) {
			throw new Error( 'Failed to fetch location from ip-api.com' )
		}

		const data: IPAPIResponse = await response.json()

		if ( data.status && data.status !== 'success' ) {
			throw new Error( 'Location detection failed' )
		}

		const result: GeolocationResponse = {
			country: data.country,
			countryCode: data.countryCode,
			countryName: data.country,
			city: data.city || 'Unknown',
			region: data.region || '',
			latitude: data.lat,
			longitude: data.lon,
			timezone: data.timezone,
		}

		return NextResponse.json( result, {
			headers: {
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
			},
		} )
	} catch ( error ) {
		console.error( 'Geolocation API error:', error )

		// Return default location on error
		return NextResponse.json( {
			country: 'United States',
			countryCode: 'US',
			countryName: 'United States',
			city: 'New York',
			region: 'North America',
			latitude: 40.7128,
			longitude: -74.006,
			timezone: 'America/New_York',
		} )
	}
}
