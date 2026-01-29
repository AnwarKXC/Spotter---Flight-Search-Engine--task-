'use client'

import { useState, useCallback } from 'react'
import {
	Box,
	Paper,
	TextField,
	Button,
	Autocomplete,
	CircularProgress,
	IconButton,
	InputAdornment,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import { popularAirports } from '@/app/lib/mockData'

interface Airport {
	iataCode: string
	name: string
	city: string
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

export default function SearchForm ( { onSearch, isLoading = false }: SearchFormProps ) {
	const [ origin, setOrigin ] = useState<Airport | null>( null )
	const [ destination, setDestination ] = useState<Airport | null>( null )
	const [ departureDate, setDepartureDate ] = useState<Date | null>( null )
	const [ returnDate, setReturnDate ] = useState<Date | null>( null )
	const [ adults, setAdults ] = useState( 1 )
	const [ errors, setErrors ] = useState<Record<string, string>>( {} )

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
					mb: 3,
					borderRadius: 3,
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
						options={ popularAirports }
						getOptionLabel={ getOptionLabel }
						value={ origin }
						onChange={ ( _, value ) => {
							setOrigin( value )
							setErrors( prev => ( { ...prev, origin: '' } ) )
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
						options={ popularAirports }
						getOptionLabel={ getOptionLabel }
						value={ destination }
						onChange={ ( _, value ) => {
							setDestination( value )
							setErrors( prev => ( { ...prev, destination: '' } ) )
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
							minWidth: 110,
							alignSelf: 'start',
						} }
					>
						{ isLoading ? 'Searching...' : 'Search' }
					</Button>

				</Box>
			</Paper>
		</LocalizationProvider>
	)
}
