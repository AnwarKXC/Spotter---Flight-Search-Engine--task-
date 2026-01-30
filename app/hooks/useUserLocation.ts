'use client'

import { useState, useEffect } from 'react'

export interface UserLocation {
	country: string      // ISO country code (e.g., 'EG', 'US')
	countryName: string  // Full country name
	city: string
	region: string       // Geographic region
	latitude: number
	longitude: number
	timezone: string
}

// Map countries to regions for airport grouping
const countryToRegion: Record<string, string> = {
	// North America
	US: 'North America', CA: 'North America', MX: 'North America',
	// Europe
	GB: 'Europe', FR: 'Europe', DE: 'Europe', NL: 'Europe', ES: 'Europe',
	IT: 'Europe', CH: 'Europe', AT: 'Europe', TR: 'Europe', GR: 'Europe',
	IE: 'Europe', DK: 'Europe', NO: 'Europe', SE: 'Europe', FI: 'Europe',
	PL: 'Europe', CZ: 'Europe', HU: 'Europe', PT: 'Europe', BE: 'Europe',
	// Middle East
	AE: 'Middle East', QA: 'Middle East', SA: 'Middle East', IL: 'Middle East',
	JO: 'Middle East', KW: 'Middle East', BH: 'Middle East', OM: 'Middle East',
	// Africa
	EG: 'Africa', ZA: 'Africa', KE: 'Africa', MA: 'Africa', DZ: 'Africa',
	TN: 'Africa', NG: 'Africa', ET: 'Africa',
	// Asia
	JP: 'Asia', CN: 'Asia', HK: 'Asia', KR: 'Asia', SG: 'Asia',
	TH: 'Asia', MY: 'Asia', IN: 'Asia', ID: 'Asia', PH: 'Asia',
	VN: 'Asia', TW: 'Asia',
	// Oceania
	AU: 'Oceania', NZ: 'Oceania',
	// South America
	BR: 'South America', AR: 'South America', CL: 'South America',
	CO: 'South America', PE: 'South America',
}

export function useUserLocation () {
	const [ location, setLocation ] = useState<UserLocation | null>( null )
	const [ isLoading, setIsLoading ] = useState( true )
	const [ error, setError ] = useState<string | null>( null )

	useEffect( () => {
		const fetchLocation = async () => {
			try {
				// Use internal API route to avoid mixed content issues on HTTPS
				const response = await fetch( '/api/geolocation' )

				if ( !response.ok ) {
					throw new Error( 'Failed to fetch location' )
				}

				const data = await response.json()

				const region = countryToRegion[ data.countryCode ] || data.region || 'Unknown'

				setLocation( {
					country: data.countryCode,
					countryName: data.countryName || data.country,
					city: data.city || 'Unknown',
					region: region,
					latitude: data.latitude,
					longitude: data.longitude,
					timezone: data.timezone,
				} )
			} catch {
				// Fallback: try ipapi.co (also free, supports HTTPS)
				try {
					const fallbackResponse = await fetch( 'https://ipapi.co/json/' )
					if ( fallbackResponse.ok ) {
						const fallbackData = await fallbackResponse.json()
						const region = countryToRegion[ fallbackData.country_code ] || 'Unknown'
						setLocation( {
							country: fallbackData.country_code,
							countryName: fallbackData.country_name,
							city: fallbackData.city,
							region: region,
							latitude: fallbackData.latitude,
							longitude: fallbackData.longitude,
							timezone: fallbackData.timezone,
						} )
					} else {
						throw new Error( 'Fallback API failed' )
					}
				} catch {
					setError( 'Could not detect location' )
					// Default to a neutral location
					setLocation( {
						country: 'US',
						countryName: 'United States',
						city: 'New York',
						region: 'North America',
						latitude: 40.7128,
						longitude: -74.006,
						timezone: 'America/New_York',
					} )
				}
			} finally {
				setIsLoading( false )
			}
		}

		fetchLocation()
	}, [] )

	return { location, isLoading, error }
}

export default useUserLocation
