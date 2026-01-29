'use client'

import { useState } from 'react'
import {
	Box,
	Paper,
	Typography,
	Chip,
	Slider,
	Autocomplete,
	TextField,
	Button,
	IconButton,
	SwipeableDrawer,
	Divider,
	Collapse,
	useMediaQuery,
	useTheme,
	Stack,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { FlightFilters } from '@/app/lib/types'

interface FilterPanelProps {
	filters: FlightFilters
	onStopsChange: ( stops: number[] ) => void
	onAirlinesChange: ( airlines: string[] ) => void
	onPriceRangeChange: ( range: [ number, number ] ) => void
	onClearFilters: () => void
	hasActiveFilters: boolean
	availableAirlines: { code: string; name: string }[]
	priceExtent: [ number, number ]
	resultCount: number
}

const STOP_OPTIONS = [
	{ value: 0, label: 'Nonstop' },
	{ value: 1, label: '1 Stop' },
	{ value: 2, label: '2+ Stops' },
]

export function FilterPanel ( {
	filters,
	onStopsChange,
	onAirlinesChange,
	onPriceRangeChange,
	onClearFilters,
	hasActiveFilters,
	availableAirlines,
	priceExtent,
	resultCount,
}: FilterPanelProps ) {
	const theme = useTheme()
	const isMobile = useMediaQuery( theme.breakpoints.down( 'md' ) )
	const [ mobileOpen, setMobileOpen ] = useState( false )
	const [ sectionsExpanded, setSectionsExpanded ] = useState( {
		stops: true,
		airlines: true,
		price: true,
	} )

	const toggleSection = ( section: keyof typeof sectionsExpanded ) => {
		setSectionsExpanded( prev => ( {
			...prev,
			[ section ]: !prev[ section ],
		} ) )
	}

	const handleStopToggle = ( stopValue: number ) => {
		const newStops = filters.stops.includes( stopValue )
			? filters.stops.filter( s => s !== stopValue )
			: [ ...filters.stops, stopValue ]
		onStopsChange( newStops )
	}

	const formatPrice = ( value: number ) => {
		return `$${ value.toLocaleString() }`
	}

	const filterContent = (
		<Box
			component="aside"
			role="complementary"
			aria-label="Flight filters"
			sx={ { p: { xs: 2, sm: 3 }, minWidth: 280 } }
		>
			{/* Header */ }
			<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 } }>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
					<FilterListIcon aria-hidden="true" />
					<Typography variant="h6" component="h2" id="filters-heading">
						Filters
					</Typography>
				</Box>
				{ isMobile && (
					<IconButton
						onClick={ () => setMobileOpen( false ) }
						size="small"
						aria-label="Close filters panel"
					>
						<CloseIcon aria-hidden="true" />
					</IconButton>
				) }
			</Box>

			{/* Clear all button */ }
			{ hasActiveFilters && (
				<Button
					variant="text"
					color="secondary"
					size="small"
					onClick={ onClearFilters }
					aria-label="Clear all active filters"
					sx={ { mb: 2 } }
				>
					Clear all filters
				</Button>
			) }

			<Typography
				variant="body2"
				color="text.secondary"
				sx={ { mb: 2 } }
				aria-live="polite"
				aria-atomic="true"
			>
				{ resultCount } { resultCount === 1 ? 'flight' : 'flights' } found
			</Typography>

			<Divider sx={ { mb: 2 } } />

			{/* Stops Filter */ }
			<Box sx={ { mb: 3 } } role="group" aria-labelledby="stops-filter-heading">
				<Box
					component="button"
					type="button"
					aria-expanded={ sectionsExpanded.stops }
					aria-controls="stops-filter-content"
					sx={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						cursor: 'pointer',
						mb: 1,
						width: '100%',
						background: 'none',
						border: 'none',
						padding: 0,
						textAlign: 'left',
						'&:focus': {
							outline: '2px solid',
							outlineColor: 'primary.main',
							outlineOffset: 2,
							borderRadius: 1,
						},
					} }
					onClick={ () => toggleSection( 'stops' ) }
				>
					<Typography variant="subtitle2" fontWeight={ 600 } id="stops-filter-heading">
						Stops
					</Typography>
					{ sectionsExpanded.stops ? <ExpandLessIcon fontSize="small" aria-hidden="true" /> : <ExpandMoreIcon fontSize="small" aria-hidden="true" /> }
				</Box>
				<Collapse in={ sectionsExpanded.stops } id="stops-filter-content">
					<Stack
						direction="row"
						spacing={ { xs: 0.5, sm: 1 } }
						flexWrap="wrap"
						useFlexGap
						role="group"
						aria-label="Filter by number of stops"
						sx={ { rowGap: 1 } }
					>
						{ STOP_OPTIONS.map( option => (
							<Chip
								key={ option.value }
								label={ option.label }
								onClick={ () => handleStopToggle( option.value ) }
								color={ filters.stops.includes( option.value ) ? 'primary' : 'default' }
								variant={ filters.stops.includes( option.value ) ? 'filled' : 'outlined' }
								aria-pressed={ filters.stops.includes( option.value ) }
								aria-label={ `Filter by ${ option.label }${ filters.stops.includes( option.value ) ? ', currently selected' : '' }` }
							/>
						) ) }
					</Stack>
				</Collapse>
			</Box>

			{/* Airlines Filter */ }
			<Box sx={ { mb: 3 } } role="group" aria-labelledby="airlines-filter-heading">
				<Box
					component="button"
					type="button"
					aria-expanded={ sectionsExpanded.airlines }
					aria-controls="airlines-filter-content"
					sx={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						cursor: 'pointer',
						mb: 1,
						width: '100%',
						background: 'none',
						border: 'none',
						padding: 0,
						textAlign: 'left',
						'&:focus': {
							outline: '2px solid',
							outlineColor: 'primary.main',
							outlineOffset: 2,
							borderRadius: 1,
						},
					} }
					onClick={ () => toggleSection( 'airlines' ) }
				>
					<Typography variant="subtitle2" fontWeight={ 600 } id="airlines-filter-heading">
						Airlines
					</Typography>
					{ sectionsExpanded.airlines ? <ExpandLessIcon fontSize="small" aria-hidden="true" /> : <ExpandMoreIcon fontSize="small" aria-hidden="true" /> }
				</Box>
				<Collapse in={ sectionsExpanded.airlines } id="airlines-filter-content">
					<Autocomplete
						multiple
						size="small"
						id="airlines-filter-autocomplete"
						options={ availableAirlines }
						getOptionLabel={ ( option ) => option.name }
						value={ availableAirlines.filter( a => filters.airlines.includes( a.code ) ) }
						onChange={ ( _, newValue ) => {
							onAirlinesChange( newValue.map( v => v.code ) )
						} }
						renderInput={ ( params ) => (
							<TextField
								{ ...params }
								placeholder={ filters.airlines.length === 0 ? 'All airlines' : '' }
								size="small"
								label="Select airlines"
								aria-describedby="airlines-filter-description"
							/>
						) }
						renderTags={ ( tagValue, getTagProps ) =>
							tagValue.map( ( option, index ) => {
								const { key, ...tagProps } = getTagProps( { index } )
								return (
									<Chip
										key={ key }
										label={ option.code }
										{ ...tagProps }
										size="small"
										aria-label={ `Remove ${ option.name } filter` }
									/>
								)
							} )
						}
						aria-label="Filter flights by airline"
						sx={ { mt: 1 } }
					/>
					<Typography
						variant="caption"
						color="text.secondary"
						id="airlines-filter-description"
						sx={ { display: 'block', mt: 0.5 } }
					>
						Type to search and select airlines
					</Typography>
				</Collapse>
			</Box>

			{/* Price Range Filter */ }
			<Box sx={ { mb: 2 } } role="group" aria-labelledby="price-filter-heading">
				<Box
					component="button"
					type="button"
					aria-expanded={ sectionsExpanded.price }
					aria-controls="price-filter-content"
					sx={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						cursor: 'pointer',
						mb: 1,
						width: '100%',
						background: 'none',
						border: 'none',
						padding: 0,
						textAlign: 'left',
						'&:focus': {
							outline: '2px solid',
							outlineColor: 'primary.main',
							outlineOffset: 2,
							borderRadius: 1,
						},
					} }
					onClick={ () => toggleSection( 'price' ) }
				>
					<Typography variant="subtitle2" fontWeight={ 600 } id="price-filter-heading">
						Price Range
					</Typography>
					{ sectionsExpanded.price ? <ExpandLessIcon fontSize="small" aria-hidden="true" /> : <ExpandMoreIcon fontSize="small" aria-hidden="true" /> }
				</Box>
				<Collapse in={ sectionsExpanded.price } id="price-filter-content">
					<Box sx={ { px: 1, mt: 2 } }>
						<Slider
							value={ filters.priceRange }
							onChange={ ( _, newValue ) => {
								onPriceRangeChange( newValue as [ number, number ] )
							} }
							valueLabelDisplay="auto"
							valueLabelFormat={ formatPrice }
							min={ priceExtent[ 0 ] }
							max={ priceExtent[ 1 ] }
							step={ 10 }
							aria-label="Price range"
							aria-valuetext={ `${ formatPrice( filters.priceRange[ 0 ] ) } to ${ formatPrice( filters.priceRange[ 1 ] ) }` }
							getAriaLabel={ ( index ) => index === 0 ? 'Minimum price' : 'Maximum price' }
							getAriaValueText={ ( value ) => formatPrice( value ) }
						/>
						<Box sx={ { display: 'flex', justifyContent: 'space-between', mt: 1 } }>
							<Typography variant="caption" color="text.secondary" aria-hidden="true">
								{ formatPrice( filters.priceRange[ 0 ] ) }
							</Typography>
							<Typography variant="caption" color="text.secondary" aria-hidden="true">
								{ formatPrice( filters.priceRange[ 1 ] ) }
							</Typography>
						</Box>
					</Box>
				</Collapse>
			</Box>
		</Box>
	)

	// Mobile: SwipeableDrawer from bottom
	if ( isMobile ) {
		return (
			<>
				<Button
					variant="outlined"
					startIcon={ <FilterListIcon aria-hidden="true" /> }
					onClick={ () => setMobileOpen( true ) }
					aria-label={ `Open filters panel${ hasActiveFilters ? `, ${ filters.stops.length + filters.airlines.length + ( filters.priceRange[ 0 ] > priceExtent[ 0 ] || filters.priceRange[ 1 ] < priceExtent[ 1 ] ? 1 : 0 ) } active filters` : '' }` }
					aria-haspopup="dialog"
					aria-expanded={ mobileOpen }
					sx={ { mb: 2 } }
				>
					Filters
					{ hasActiveFilters && (
						<Chip
							size="small"
							label={ filters.stops.length + filters.airlines.length + ( filters.priceRange[ 0 ] > priceExtent[ 0 ] || filters.priceRange[ 1 ] < priceExtent[ 1 ] ? 1 : 0 ) }
							color="primary"
							aria-label="Number of active filters"
							sx={ { ml: 1, height: 20, fontSize: '0.75rem' } }
						/>
					) }
				</Button>
				<SwipeableDrawer
					anchor="bottom"
					open={ mobileOpen }
					onClose={ () => setMobileOpen( false ) }
					onOpen={ () => setMobileOpen( true ) }
					aria-labelledby="filters-heading"
					slotProps={ {
						paper: {
							sx: {
								borderTopLeftRadius: 16,
								borderTopRightRadius: 16,
								maxHeight: '80vh',
							},
							role: 'dialog',
							'aria-modal': true,
						},
					} }
				>
					{ filterContent }
				</SwipeableDrawer>
			</>
		)
	}

	// Desktop: Collapsible sidebar
	return (
		<Paper
			elevation={ 0 }
			component="nav"
			aria-labelledby="filters-heading"
			sx={ {
				position: 'sticky',
				top: 80,
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
				overflow: 'hidden',
			} }
		>
			{ filterContent }
		</Paper>
	)
}
