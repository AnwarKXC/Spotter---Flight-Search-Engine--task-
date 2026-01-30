'use client'

import { useState, useCallback, useMemo } from 'react'
import { Flight } from '@/app/lib/types'

const STORAGE_KEY = 'flights-favorites'
const MAX_FAVORITES = 20

export interface FavoriteFlight extends Flight {
	savedAt: string // ISO timestamp
	searchRoute: string // e.g., "JFK → CDG"
	departureDate?: string // YYYY-MM-DD format
	returnDate?: string // YYYY-MM-DD format
}

// Helper to get favorites from localStorage
function getStoredFavorites (): FavoriteFlight[] {
	if ( typeof window === 'undefined' ) return []
	try {
		const stored = localStorage.getItem( STORAGE_KEY )
		if ( stored ) {
			const parsed = JSON.parse( stored ) as FavoriteFlight[]
			// Sort by savedAt (newest first)
			parsed.sort( ( a, b ) => new Date( b.savedAt ).getTime() - new Date( a.savedAt ).getTime() )
			return parsed
		}
	} catch ( error ) {
		console.error( 'Failed to load favorites:', error )
	}
	return []
}

export function useFavorites () {
	// Use lazy initialization to load from localStorage
	const [ favorites, setFavorites ] = useState<FavoriteFlight[]>( () => getStoredFavorites() )

	// Save favorites to localStorage
	const saveFavorites = useCallback( ( newFavorites: FavoriteFlight[] ) => {
		try {
			localStorage.setItem( STORAGE_KEY, JSON.stringify( newFavorites ) )
			setFavorites( newFavorites )
		} catch ( error ) {
			console.error( 'Failed to save favorites:', error )
		}
	}, [] )

	// Generate a unique key for a flight (based on properties, not ID)
	const getFlightKey = useCallback( ( flight: Flight ) => {
		return `${ flight.flightNumber }-${ flight.origin }-${ flight.destination }-${ flight.departureTime }`
	}, [] )

	// Check if a flight is favorited (compare by flight properties, not ID)
	const isFavorite = useCallback( ( flightId: string, flight?: Flight ) => {
		if ( flight ) {
			const key = getFlightKey( flight )
			return favorites.some( f => getFlightKey( f ) === key )
		}
		// Fallback to ID check
		return favorites.some( f => f.id === flightId )
	}, [ favorites, getFlightKey ] )

	// Add a flight to favorites
	const addFavorite = useCallback( ( flight: Flight, searchContext?: { departureDate?: string; returnDate?: string } ) => {
		// Check if already favorited by key
		const key = getFlightKey( flight )
		if ( favorites.some( f => getFlightKey( f ) === key ) ) {
			return // Already favorited
		}

		if ( favorites.length >= MAX_FAVORITES ) {
			// Remove oldest if at max
			const newFavorites = favorites.slice( 0, MAX_FAVORITES - 1 )
			const favoriteFlight: FavoriteFlight = {
				...flight,
				savedAt: new Date().toISOString(),
				searchRoute: `${ flight.origin } → ${ flight.destination }`,
				departureDate: searchContext?.departureDate,
				returnDate: searchContext?.returnDate,
			}
			saveFavorites( [ favoriteFlight, ...newFavorites ] )
		} else {
			const favoriteFlight: FavoriteFlight = {
				...flight,
				savedAt: new Date().toISOString(),
				searchRoute: `${ flight.origin } → ${ flight.destination }`,
				departureDate: searchContext?.departureDate,
				returnDate: searchContext?.returnDate,
			}
			saveFavorites( [ favoriteFlight, ...favorites ] )
		}
	}, [ favorites, saveFavorites, getFlightKey ] )

	// Remove a flight from favorites (by key, not ID)
	const removeFavorite = useCallback( ( flightId: string, flight?: Flight ) => {
		if ( flight ) {
			const key = getFlightKey( flight )
			const newFavorites = favorites.filter( f => getFlightKey( f ) !== key )
			saveFavorites( newFavorites )
		} else {
			// Fallback to ID
			const newFavorites = favorites.filter( f => f.id !== flightId )
			saveFavorites( newFavorites )
		}
	}, [ favorites, saveFavorites, getFlightKey ] )

	// Toggle favorite status
	const toggleFavorite = useCallback( ( flight: Flight, searchContext?: { departureDate?: string; returnDate?: string } ) => {
		if ( isFavorite( flight.id, flight ) ) {
			removeFavorite( flight.id, flight )
		} else {
			addFavorite( flight, searchContext )
		}
	}, [ isFavorite, removeFavorite, addFavorite ] )

	// Clear all favorites
	const clearFavorites = useCallback( () => {
		saveFavorites( [] )
	}, [ saveFavorites ] )

	// Get favorites count
	const favoritesCount = useMemo( () => favorites.length, [ favorites ] )

	return {
		favorites,
		isFavorite,
		addFavorite,
		removeFavorite,
		toggleFavorite,
		clearFavorites,
		favoritesCount,
		maxFavorites: MAX_FAVORITES,
	}
}
