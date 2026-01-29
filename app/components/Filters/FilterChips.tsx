'use client'

import React from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { FlightFilters } from '@/app/lib/types'

interface FilterChipsProps {
	filters: FlightFilters
	onRemoveStop: ( stop: number ) => void
	onRemoveAirline: ( airline: string ) => void
	onResetPriceRange: () => void
	onClearAll: () => void
	hasActiveFilters: boolean
	availableAirlines: { code: string; name: string }[]
	priceExtent: [ number, number ]
}

const STOP_LABELS: Record<number, string> = {
	0: 'Nonstop',
	1: '1 Stop',
	2: '2+ Stops',
}

export function FilterChips ( {
	filters,
	onRemoveStop,
	onRemoveAirline,
	onResetPriceRange,
	onClearAll,
	hasActiveFilters,
	availableAirlines,
	priceExtent,
}: FilterChipsProps ) {
	if ( !hasActiveFilters ) {
		return null
	}

	const getAirlineName = ( code: string ) => {
		const airline = availableAirlines.find( a => a.code === code )
		return airline ? airline.name : code
	}

	const isPriceFiltered =
		filters.priceRange[ 0 ] > priceExtent[ 0 ] ||
		filters.priceRange[ 1 ] < priceExtent[ 1 ]

	// Calculate total active filters for screen reader
	const activeFilterCount = filters.stops.length + filters.airlines.length + ( isPriceFiltered ? 1 : 0 )

	return (
		<Box
			component="section"
			aria-labelledby="active-filters-heading"
			sx={ {
				mb: { xs: 1.5, sm: 2 },
				minWidth: 285
			} }
		>
			{/* Screen reader heading */ }
			<Typography
				id="active-filters-heading"
				component="h2"
				sx={ { position: 'absolute', left: '-9999px' } }
			>
				Active filters ({ activeFilterCount })
			</Typography>

			<Stack
				direction="row"
				spacing={ { xs: 0.5, sm: 1 } }
				alignItems="center"
				flexWrap="wrap"
				useFlexGap
				role="list"
				aria-label="Active flight filters"
				sx={ { rowGap: 1 } }
			>
				<Typography
					variant="body2"
					color="text.secondary"
					aria-hidden="true"
					sx={ {
						mr: { xs: 0.5, sm: 1 },
						display: { xs: 'none', sm: 'block' }
					} }
				>
					Active filters:
				</Typography>

				{/* Stop chips */ }
				{ filters.stops.map( stop => (
					<Chip
						key={ `stop-${ stop }` }
						label={ STOP_LABELS[ stop ] || `${ stop } Stops` }
						size="small"
						onDelete={ () => onRemoveStop( stop ) }
						color="primary"
						variant="outlined"
						role="listitem"
						aria-label={ `${ STOP_LABELS[ stop ] || `${ stop } Stops` } filter. Press delete to remove.` }
						deleteIcon={
							<span aria-hidden="true">×</span>
						}
					/>
				) ) }

				{/* Airline chips */ }
				{ filters.airlines.map( airline => (
					<Chip
						key={ `airline-${ airline }` }
						label={ getAirlineName( airline ) }
						size="small"
						onDelete={ () => onRemoveAirline( airline ) }
						color="primary"
						variant="outlined"
						role="listitem"
						aria-label={ `${ getAirlineName( airline ) } airline filter. Press delete to remove.` }
						deleteIcon={
							<span aria-hidden="true">×</span>
						}
					/>
				) ) }

				{/* Price range chip */ }
				{ isPriceFiltered && (
					<Chip
						label={ `$${ filters.priceRange[ 0 ].toLocaleString() } - $${ filters.priceRange[ 1 ].toLocaleString() }` }
						size="small"
						onDelete={ onResetPriceRange }
						color="primary"
						variant="outlined"
						role="listitem"
						aria-label={ `Price range $${ filters.priceRange[ 0 ].toLocaleString() } to $${ filters.priceRange[ 1 ].toLocaleString() } filter. Press delete to remove.` }
						deleteIcon={
							<span aria-hidden="true">×</span>
						}
					/>
				) }

				{/* Clear all */ }
				<Chip
					label="Clear all"
					size="small"
					onClick={ onClearAll }
					variant="filled"
					color="secondary"
					role="listitem"
					aria-label={ `Clear all ${ activeFilterCount } active filters` }
					sx={ { ml: { xs: 0, sm: 1 } } }
				/>
			</Stack>
		</Box>
	)
}
