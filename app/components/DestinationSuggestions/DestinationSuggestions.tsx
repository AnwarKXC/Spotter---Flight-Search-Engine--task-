'use client'

import { useState, useEffect, useMemo } from 'react'
import {
	Box,
	Typography,
	Card,
	CardMedia,
	CardContent,
	Chip,
	Skeleton,
	IconButton,
	Stack,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import {
	detectUserLocation,
	getSuggestedDestinations,
	getNearestAirport,
	generateTravelDates,
	formatDateRange,
	type SuggestedDestination,
	type UserLocation,
} from '@/app/lib/geolocation'

interface DestinationSuggestionsProps {
	onSelectDestination?: ( destination: SuggestedDestination, originCode: string, departureDate: string, returnDate?: string ) => void
}

export function DestinationSuggestions ( { onSelectDestination }: DestinationSuggestionsProps ) {
	const [ location, setLocation ] = useState<UserLocation | null>( null )
	const [ destinations, setDestinations ] = useState<SuggestedDestination[]>( [] )
	const [ isLoading, setIsLoading ] = useState( true )
	const [ nearestAirport, setNearestAirport ] = useState<{ code: string; name: string } | null>( null )

	// Generate travel dates once
	const travelDates = useMemo( () => generateTravelDates(), [] )

	useEffect( () => {
		const fetchLocation = async () => {
			try {
				const userLocation = await detectUserLocation()
				setLocation( userLocation )

				const suggestions = getSuggestedDestinations( userLocation.countryCode )
				setDestinations( suggestions )

				const airport = getNearestAirport( userLocation.countryCode, userLocation.city )
				setNearestAirport( airport )
			} catch ( error ) {
				console.error( 'Failed to detect location:', error )
				// Use default destinations
				setDestinations( getSuggestedDestinations( 'DEFAULT' ) )
			} finally {
				setIsLoading( false )
			}
		}

		fetchLocation()
	}, [] )

	const handleCardClick = ( destination: SuggestedDestination ) => {
		if ( onSelectDestination && nearestAirport ) {
			onSelectDestination( destination, nearestAirport.code, travelDates.departureDate, travelDates.returnDate )
		}
	}

	if ( isLoading ) {
		return (
			<Box sx={ { mt: 4 } }>
				<Skeleton variant="text" width={ 300 } height={ 32 } sx={ { mb: 2 } } />
				<Grid container spacing={ 2 }>
					{ [ 1, 2, 3 ].map( ( i ) => (
						<Grid key={ i } size={ { xs: 12, sm: 6, md: 4 } }>
							<Skeleton variant="rectangular" height={ 200 } sx={ { borderRadius: 2 } } />
						</Grid>
					) ) }
				</Grid>
			</Box>
		)
	}

	return (
		<Box
			component="section"
			aria-labelledby="destination-suggestions-heading"
			sx={ { mt: 4 } }
		>
			{/* Header */ }
			<Box sx={ { mb: 3 } }>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
					<FlightTakeoffIcon sx={ { color: 'primary.main' } } />
					<Typography
						variant="h5"
						component="h2"
						id="destination-suggestions-heading"
						fontWeight={ 600 }
					>
						Find cheap flights from { location?.city || 'your location' } to anywhere
					</Typography>
				</Box>
				{ nearestAirport && (
					<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' } }>
						<LocationOnIcon sx={ { fontSize: 16 } } />
						<Typography variant="body2" color="text.secondary">
							Departing from { nearestAirport.name } ({ nearestAirport.code })
						</Typography>
					</Box>
				) }
			</Box>

			{/* Location Pills */ }
			{ location && (
				<Stack
					direction="row"
					spacing={ 1 }
					sx={ { mb: 3 } }
					role="tablist"
					aria-label="Nearby departure cities"
				>
					<Chip
						label={ location.city }
						color="primary"
						variant="filled"
						aria-selected="true"
						role="tab"
					/>
					<Chip
						label="Nearby cities"
						variant="outlined"
						aria-selected="false"
						role="tab"
						sx={ { cursor: 'pointer' } }
					/>
				</Stack>
			) }

			{/* Destination Cards */ }
			<Grid container spacing={ 2 }>
				{ destinations.slice( 0, 6 ).map( ( destination ) => (
					<Grid key={ destination.airportCode } size={ { xs: 12, sm: 6, md: 4 } }>
						<Card
							onClick={ () => handleCardClick( destination ) }
							sx={ {
								cursor: 'pointer',
								transition: 'all 0.2s ease-in-out',
								border: '1px solid',
								borderColor: 'divider',
								'&:hover': {
									transform: 'translateY(-4px)',
									boxShadow: 4,
									borderColor: 'primary.main',
								},
								'&:focus-within': {
									outline: '2px solid',
									outlineColor: 'primary.main',
									outlineOffset: 2,
								},
							} }
							component="article"
							role="button"
							tabIndex={ 0 }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' || e.key === ' ' ) {
									e.preventDefault()
									handleCardClick( destination )
								}
							} }
							aria-label={ `Flight to ${ destination.city }, ${ destination.country } from ${ destination.currency } ${ destination.priceFrom.toLocaleString() }` }
						>
							<CardMedia
								component="img"
								height="140"
								image={ destination.imageUrl }
								alt={ `${ destination.city }, ${ destination.country }` }
								sx={ { objectFit: 'cover' } }
							/>
							<CardContent sx={ { pb: 2 } }>
								{/* Route */ }
								<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 } }>
									<Typography variant="h6" component="h3" fontWeight={ 600 } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
										{ location?.city || 'Your City' }
										<ArrowForwardIcon sx={ { fontSize: 18, color: 'text.secondary' } } />
										{ destination.city }
									</Typography>
								</Box>

								{/* Flight info with date */ }
								<Box sx={ { display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, color: 'text.secondary', flexWrap: 'wrap' } }>
									<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
										<CalendarTodayIcon sx={ { fontSize: 14 } } />
										<Typography variant="caption" fontWeight={ 500 }>
											{ formatDateRange( travelDates.departureDate, travelDates.returnDate ) }
										</Typography>
									</Box>
									<Typography variant="caption">•</Typography>
									<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
										<AccessTimeIcon sx={ { fontSize: 14 } } />
										<Typography variant="caption">
											{ destination.flightDuration }
										</Typography>
									</Box>
									<Typography variant="caption">•</Typography>
									<Typography variant="caption">
										Nonstop
									</Typography>
								</Box>

								{/* Highlights */ }
								<Stack direction="row" spacing={ 0.5 } flexWrap="wrap" useFlexGap sx={ { mb: 2, rowGap: 0.5 } }>
									{ destination.highlights.map( ( tag ) => (
										<Chip
											key={ tag }
											label={ tag }
											size="small"
											variant="outlined"
											sx={ { fontSize: '0.7rem', height: 22 } }
										/>
									) ) }
								</Stack>

								{/* Price */ }
								<Box sx={ { display: 'flex', alignItems: 'baseline', gap: 0.5 } }>
									<Typography variant="body2" color="text.secondary">
										from
									</Typography>
									<Typography variant="h6" fontWeight={ 700 } color="primary.main">
										{ destination.currency } { destination.priceFrom.toLocaleString() }
									</Typography>
									<IconButton
										size="small"
										sx={ { ml: 'auto' } }
										aria-label={ `View flights to ${ destination.city }` }
									>
										<ArrowForwardIcon fontSize="small" />
									</IconButton>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				) ) }
			</Grid>

			{/* Explore more hint */ }
			<Box sx={ { mt: 3, textAlign: 'center' } }>
				<Typography variant="body2" color="text.secondary">
					💡 Click a destination to search for flights, or use the search form above for custom routes
				</Typography>
			</Box>
		</Box>
	)
}

export default DestinationSuggestions
