'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
	Box,
	Paper,
	TextField,
	Button,
	Autocomplete,
	CircularProgress,
	IconButton,
	InputAdornment,
	Typography,
	Chip,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import NearMeIcon from '@mui/icons-material/NearMe'
import { popularAirports } from '@/app/lib/mockData'
import { useUserLocation } from '@/app/hooks/useUserLocation'

interface Airport {
	iataCode: string
	name: string
	city: string
	country: string
	region: string
}

interface SearchFormProps {
	onSearch: ( params: {
		origin: string
		destination: string
		departureDate: string
		returnDate?: string
		adults: number
	} ) => void
	isLoading?: boolean
}

// Helper to get initial values from URL params
function getInitialValuesFromURL ( searchParams: URLSearchParams ) {
	const originCode = searchParams.get( 'origin' )
	const destinationCode = searchParams.get( 'destination' )
	const departureDateParam = searchParams.get( 'departureDate' )
	const returnDateParam = searchParams.get( 'returnDate' )
	const adultsParam = searchParams.get( 'adults' )

	return {
		origin: originCode ? popularAirports.find( a => a.iataCode === originCode ) || null : null,
		destination: destinationCode ? popularAirports.find( a => a.iataCode === destinationCode ) || null : null,
		departureDate: departureDateParam ? new Date( departureDateParam ) : null,
		returnDate: returnDateParam ? new Date( returnDateParam ) : null,
		adults: adultsParam ? parseInt( adultsParam, 10 ) || 1 : 1,
	}
}

export default function SearchForm ( { onSearch, isLoading = false }: SearchFormProps ) {
	const searchParams = useSearchParams()
	const { location } = useUserLocation()

	// Get initial values from URL (computed once on first render)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const initialValues = useMemo( () => getInitialValuesFromURL( searchParams ), [] )

	// Sort airports by user location - prioritize same country, then same region
	const sortedAirports = useMemo( () => {
		if ( !location ) return popularAirports

		const userCountry = location.country
		const userRegion = location.region

		return [ ...popularAirports ].sort( ( a, b ) => {
			// Same country gets highest priority
			const aIsUserCountry = a.country === userCountry
			const bIsUserCountry = b.country === userCountry
			if ( aIsUserCountry && !bIsUserCountry ) return -1
			if ( !aIsUserCountry && bIsUserCountry ) return 1

			// Same region gets second priority
			const aIsUserRegion = a.region === userRegion
			const bIsUserRegion = b.region === userRegion
			if ( aIsUserRegion && !bIsUserRegion ) return -1
			if ( !aIsUserRegion && bIsUserRegion ) return 1

			// Otherwise alphabetical by city
			return a.city.localeCompare( b.city )
		} )
	}, [ location ] )

	const [ origin, setOrigin ] = useState<Airport | null>( initialValues.origin )
	const [ destination, setDestination ] = useState<Airport | null>( initialValues.destination )
	const [ departureDate, setDepartureDate ] = useState<Date | null>(
		initialValues.departureDate && !isNaN( initialValues.departureDate.getTime() )
			? initialValues.departureDate
			: null
	)
	const [ returnDate, setReturnDate ] = useState<Date | null>(
		initialValues.returnDate && !isNaN( initialValues.returnDate.getTime() )
			? initialValues.returnDate
			: null
	)
	const [ adults, setAdults ] = useState(
		initialValues.adults >= 1 && initialValues.adults <= 9 ? initialValues.adults : 1
	)
	const [ errors, setErrors ] = useState<Record<string, string>>( {} )

	// Sync form state with URL params when they change (e.g., from destination card click)
	useEffect( () => {
		const originCode = searchParams.get( 'origin' )
		const destinationCode = searchParams.get( 'destination' )
		const departureDateParam = searchParams.get( 'departureDate' )
		const returnDateParam = searchParams.get( 'returnDate' )
		const adultsParam = searchParams.get( 'adults' )

		if ( originCode ) {
			const foundOrigin = popularAirports.find( a => a.iataCode === originCode )
			if ( foundOrigin ) setOrigin( foundOrigin )
		}

		if ( destinationCode ) {
			const foundDestination = popularAirports.find( a => a.iataCode === destinationCode )
			if ( foundDestination ) setDestination( foundDestination )
		}

		if ( departureDateParam ) {
			const date = new Date( departureDateParam )
			if ( !isNaN( date.getTime() ) ) setDepartureDate( date )
		}

		if ( returnDateParam ) {
			const date = new Date( returnDateParam )
			if ( !isNaN( date.getTime() ) ) setReturnDate( date )
		}

		if ( adultsParam ) {
			const num = parseInt( adultsParam, 10 )
			if ( num >= 1 && num <= 9 ) setAdults( num )
		}
	}, [ searchParams ] )

	// Swap origin and destination
	const handleSwap = useCallback( () => {
		const temp = origin
		setOrigin( destination )
		setDestination( temp )
	}, [ origin, destination ] )

	// Validate form
	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if ( !origin ) {
			newErrors.origin = 'Please select origin airport'
		}
		if ( !destination ) {
			newErrors.destination = 'Please select destination airport'
		}
		if ( origin && destination && origin.iataCode === destination.iataCode ) {
			newErrors.destination = 'Destination must be different from origin'
		}
		if ( !departureDate ) {
			newErrors.departureDate = 'Please select departure date'
		}
		if ( departureDate && departureDate < new Date() ) {
			newErrors.departureDate = 'Departure date must be in the future'
		}
		if ( returnDate && departureDate && returnDate < departureDate ) {
			newErrors.returnDate = 'Return date must be after departure'
		}
		if ( adults < 1 || adults > 9 ) {
			newErrors.adults = 'Must be between 1-9 passengers'
		}

		setErrors( newErrors )
		return Object.keys( newErrors ).length === 0
	}

	// Handle search
	const handleSearch = () => {
		if ( !validate() ) return

		onSearch( {
			origin: origin!.iataCode,
			destination: destination!.iataCode,
			departureDate: departureDate!.toISOString().split( 'T' )[ 0 ],
			returnDate: returnDate?.toISOString().split( 'T' )[ 0 ],
			adults,
		} )
	}

	// Format airport option label
	const getOptionLabel = ( option: Airport ) =>
		`${ option.city } (${ option.iataCode }) - ${ option.name }`

	// Group airports by region for better UX
	const groupByRegion = ( option: Airport ) => {
		if ( location && option.country === location.country ) {
			return '📍 Nearby'
		}
		if ( location && option.region === location.region ) {
			return `🌍 ${ option.region }`
		}
		return option.region
	}

	// Check if airport is in user's country
	const isNearbyAirport = ( airport: Airport ) =>
		location && airport.country === location.country

	return (
		<LocalizationProvider dateAdapter={ AdapterDateFns }>
			<Paper
				elevation={ 2 }
				component="form"
				role="search"
				aria-label="Flight search form"
				onSubmit={ ( e: React.FormEvent ) => {
					e.preventDefault()
					handleSearch()
				} }
				sx={ {
					p: 3,
					mb: 6,
					mt: 2,
					borderRadius: 2,
					maxWidth: 1200,
					marginInline: 'auto',
				} }
			>
				<Box
					sx={ {
						display: 'grid',
						gap: 2,
						gridTemplateColumns: {
							xs: '1fr',
							sm: '1fr auto 1fr',
						},
						alignItems: 'start',
					} }
				>
					{/* Origin */ }
					<Autocomplete
						id="origin-airport"
						options={ sortedAirports }
						groupBy={ groupByRegion }
						getOptionLabel={ getOptionLabel }
						value={ origin }
						disabled={ isLoading }
						onChange={ ( _, value ) => {
							setOrigin( value )
							setErrors( prev => ( { ...prev, origin: '' } ) )
						} }
						filterOptions={ ( options, { inputValue } ) => {
							const query = inputValue.toLowerCase()
							return options.filter( option =>
								option.city.toLowerCase().includes( query ) ||
								option.iataCode.toLowerCase().includes( query ) ||
								option.name.toLowerCase().includes( query ) ||
								option.country.toLowerCase().includes( query )
							)
						} }
						renderOption={ ( props, option ) => {
							const { key, ...otherProps } = props
							return (
								<Box
									component="li"
									key={ key }
									{ ...otherProps }
									sx={ {
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										py: 1,
									} }
								>
									<Box sx={ { flex: 1 } }>
										<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
											<Typography variant="body2" component="span" fontWeight={ 600 }>
												{ option.city } ({ option.iataCode })
											</Typography>
											{ isNearbyAirport( option ) && (
												<Chip
													icon={ <NearMeIcon sx={ { fontSize: 12 } } /> }
													label="Nearby"
													size="small"
													color="primary"
													variant="outlined"
													sx={ { height: 20, fontSize: '0.65rem' } }
												/>
											) }
										</Box>
										<Typography variant="caption" color="text.secondary" component="span" display="block">
											{ option.name }
										</Typography>
									</Box>
								</Box>
							)
						} }
						renderInput={ ( params ) => (
							<TextField
								{ ...params }
								label="From"
								placeholder="City or airport"
								error={ !!errors.origin }
								helperText={ errors.origin }
								required
								aria-required="true"
								aria-describedby={ errors.origin ? 'origin-error' : undefined }
								slotProps={ {
									input: {
										...params.InputProps,
										startAdornment: (
											<InputAdornment position="start">
												<FlightTakeoffIcon color="action" aria-hidden="true" />
											</InputAdornment>
										),
									},
								} }
							/>
						) }
						isOptionEqualToValue={ ( option, value ) => option.iataCode === value.iataCode }
						aria-label="Departure airport"
					/>

					{/* Swap button */ }
					<IconButton
						onClick={ handleSwap }
						disabled={ isLoading }
						aria-label="Swap origin and destination airports"
						title="Swap origin and destination"
						sx={ {
							alignSelf: 'center',
						} }
					>
						<SwapHorizIcon aria-hidden="true" />
					</IconButton>

					{/* Destination */ }
					<Autocomplete
						id="destination-airport"
						options={ sortedAirports }
						groupBy={ groupByRegion }
						getOptionLabel={ getOptionLabel }
						value={ destination }
						disabled={ isLoading }
						onChange={ ( _, value ) => {
							setDestination( value )
							setErrors( prev => ( { ...prev, destination: '' } ) )
						} }
						filterOptions={ ( options, { inputValue } ) => {
							const query = inputValue.toLowerCase()
							return options.filter( option =>
								option.city.toLowerCase().includes( query ) ||
								option.iataCode.toLowerCase().includes( query ) ||
								option.name.toLowerCase().includes( query ) ||
								option.country.toLowerCase().includes( query )
							)
						} }
						renderOption={ ( props, option ) => {
							const { key, ...otherProps } = props
							return (
								<Box
									component="li"
									key={ key }
									{ ...otherProps }
									sx={ {
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										py: 1,
									} }
								>
									<Box sx={ { flex: 1 } }>
										<Typography variant="body2" component="span" fontWeight={ 600 } display="block">
											{ option.city } ({ option.iataCode })
										</Typography>
										<Typography variant="caption" color="text.secondary" component="span" display="block">
											{ option.name }
										</Typography>
									</Box>
								</Box>
							)
						} }
						renderInput={ ( params ) => (
							<TextField
								{ ...params }
								label="To"
								placeholder="City or airport"
								error={ !!errors.destination }
								helperText={ errors.destination }
								required
								aria-required="true"
								aria-describedby={ errors.destination ? 'destination-error' : undefined }
								slotProps={ {
									input: {
										...params.InputProps,
										startAdornment: (
											<InputAdornment position="start">
												<FlightLandIcon color="action" aria-hidden="true" />
											</InputAdornment>
										),
									},
								} }
							/>
						) }
						isOptionEqualToValue={ ( option, value ) => option.iataCode === value.iataCode }
						aria-label="Arrival airport"
					/>

					{/* Departure Date */ }
					<DatePicker
						label="Departure"
						value={ departureDate }
						onChange={ ( date ) => {
							setDepartureDate( date )
							setErrors( prev => ( { ...prev, departureDate: '' } ) )
						} }
						minDate={ new Date() }
						disabled={ isLoading }
						slotProps={ {
							textField: {
								error: !!errors.departureDate,
								helperText: errors.departureDate,
								required: true,
								'aria-required': true,
							},
							field: {
								'aria-label': 'Departure date',
							},
							openPickerButton: {
								'aria-label': 'Open departure date calendar',
							},
						} }
					/>
					{/* Passengers */ }
					<TextField
						id="passengers-count"
						type="number"
						label="Passengers"
						className='sm:max-w-32'
						disabled={ isLoading }
						value={ adults }
						onChange={ ( e ) => {
							setAdults( Math.max( 1, Math.min( 9, parseInt( e.target.value ) || 1 ) ) )
							setErrors( prev => ( { ...prev, adults: '' } ) )
						} }
						error={ !!errors.adults }
						helperText={ errors.adults || 'Number of adult (1-9)' }
						slotProps={ {
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<PersonIcon color="action" aria-hidden="true" />
									</InputAdornment>
								),
							},
							htmlInput: {
								min: 1,
								max: 9,
								'aria-label': 'Number of passengers',
								'aria-valuemin': 1,
								'aria-valuemax': 9,
								'aria-valuenow': adults,
							},
							formHelperText: {
								sx: {
									fontSize: { sm: '0.64rem', },
									color: errors.adults ? 'error.main' : 'text.secondary',
								},
							},
						} }
						sx={ { minWidth: 100 } }
					/>


					{/* Return Date */ }
					<DatePicker
						label="Return (optional)"
						value={ returnDate }
						onChange={ ( date ) => {
							setReturnDate( date )
							setErrors( prev => ( { ...prev, returnDate: '' } ) )
						} }
						minDate={ departureDate || new Date() }
						disabled={ isLoading }
						slotProps={ {
							textField: {
								error: !!errors.returnDate,
								helperText: errors.returnDate,
							},
							field: {
								'aria-label': 'Return date, optional',
							},
							openPickerButton: {
								'aria-label': 'Open return date calendar',
							},
						} }
					/>



					{/* Search Button */ }
					<Button
						type="submit"
						variant="contained"
						className='md:col-start-2 col-span-full md:col-span-1 '
						size="large"
						onClick={ handleSearch }
						disabled={ isLoading }
						aria-label={ isLoading ? 'Searching for flights, please wait' : 'Search for flights' }
						aria-busy={ isLoading }
						startIcon={ isLoading ? <CircularProgress size={ 20 } color="inherit" aria-hidden="true" /> : <SearchIcon aria-hidden="true" /> }
						sx={ {
							height: 56,
							minWidth: 100,
							alignSelf: 'start',
							fontSize: '1rem',
							fontWeight: 700,
							letterSpacing: '0.02em',
							background: isLoading
								? 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)'
								: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
							boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
							'&:hover': {
								background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 100%)',
								boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
								transform: 'translateY(-2px)',
							},
							'&:active': {
								transform: 'translateY(0)',
								boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
							},
							'&.Mui-disabled': {
								background: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
								color: 'white',
							},
							transition: 'all 0.2s ease-in-out',
						} }
					>
						Search
					</Button>

				</Box>
			</Paper>
		</LocalizationProvider>
	)
}
