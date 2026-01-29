'use client'

import { useMemo } from 'react'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, Typography, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Flight } from '@/app/lib/types'

// Format price with currency
const formatPrice = ( price: number, currency: string = 'USD' ): string => {
	return new Intl.NumberFormat( 'en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	} ).format( price )
}

const badgeStyle = {
	px: 0.75,
	py: 0.25,
	fontSize: '0.65rem',
	fontWeight: 700,
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	borderRadius: '2px', // Sharper corners for technical look
	lineHeight: 1.2,
	display: 'inline-block',
}

// Stops cell renderer with accessible labels
const StopsCell = ( { value, row }: GridRenderCellParams<Flight, number> ) => {
	const stopLocations = row.stopLocations || []
	const stops = value ?? 0

	if ( stops === 0 ) {
		return (
			<Typography
				variant="body2"
				role="text"
				aria-label="Nonstop flight"
				sx={ {
					fontWeight: 700,
					color: '#059669',
					textTransform: 'uppercase',
					fontSize: '0.75rem',
					letterSpacing: '0.05em',
					display: 'flex',
					alignItems: 'center',
					height: '100%',
				} }
			>
				DIRECT
			</Typography>
		)
	}

	const stopText = stops === 1 ? '1 STOP' : `${ stops } STOPS`
	const stopInfo = stopLocations.length > 0 ? stopLocations.join( ', ' ) : ''
	const ariaLabel = stopInfo ? `${ stopText } via ${ stopInfo }` : stopText

	return (
		<Tooltip title={ stopInfo ? `Via ${ stopInfo }` : 'Connecting flight' } placement="top" arrow>
			<Box
				role="text"
				aria-label={ ariaLabel }
				sx={ {
					display: 'flex',
					alignItems: 'center',
					height: '100%',
					gap: 0.5,
					cursor: 'help',
				} }
			>
				<Typography
					variant="body2"
					sx={ {
						fontWeight: 600,
						color: stops === 1 ? '#d97706' : '#dc2626',
						textTransform: 'uppercase',
						fontSize: '0.75rem',
						letterSpacing: '0.05em',
					} }
				>
					{ stopText }
				</Typography>
				<InfoOutlinedIcon
					aria-hidden="true"
					sx={ {
						fontSize: '0.9rem',
						color: '#94a3b8',
						'&:hover': { color: '#64748b' },
					} }
				/>
			</Box>
		</Tooltip>
	)
}

// Price cell renderer with accessible labels
const PriceCell = ( { value, row }: GridRenderCellParams<Flight, number> ) => {
	const isCheapest = row.isCheapest
	const isBestValue = row.isBestValue
	const price = value ?? 0
	const formattedPrice = formatPrice( price, row.currency )
	const ariaLabel = isCheapest ? `${ formattedPrice }, cheapest option` : formattedPrice

	return (
		<Box
			sx={ {
				display: 'flex',
				flexDirection: 'column', // Stack price and badges for cleaner vertical rhythm
				justifyContent: 'center',
				alignItems: 'flex-start',
				height: '100%',
				gap: 0.5,
			} }
			role="text"
			aria-label={ ariaLabel }
		>
			<Typography
				variant="body1"
				fontWeight={ 700 }
				color="text.primary"
				sx={ { fontSize: '1rem', fontFamily: 'monospace', lineHeight: 1 } }
			>
				{ formattedPrice }
			</Typography>
			<Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
				{ isCheapest && (
					<Box
						aria-hidden="true"
						sx={ {
							...badgeStyle,
							backgroundColor: '#059669', // Emerald 600
							color: 'white',
							whiteSpace: 'nowrap',
						} }
					>
						CHEAPEST
					</Box>
				) }
				{ isBestValue && (
					<Box
						aria-hidden="true"
						sx={ {
							...badgeStyle,
							backgroundColor: '#7c3aed', // Violet 600
							color: 'white',
							whiteSpace: 'nowrap',
						} }
					>
						BEST VALUE
					</Box>
				) }
			</Box>
		</Box>
	)
}

// Time cell renderer with accessible labels
const TimeCell = ( { row, field }: GridRenderCellParams<Flight, string> ) => {
	const timeValue = field === 'departureTime' ? row.departureTime : row.arrivalTime
	const time = new Date( timeValue ).toLocaleTimeString( 'en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	} )

	const airport = field === 'departureTime' ? row.origin : row.destination
	const label = field === 'departureTime' ? 'Departure' : 'Arrival'
	const ariaLabel = `${ label } at ${ time } from ${ airport }`

	return (
		<Box
			role="text"
			aria-label={ ariaLabel }
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'flex-start',
				height: '100%',
				gap: 0.25,
			} }
		>
			<Typography
				variant="body1"
				fontWeight={ 700 }
				color="text.primary"
				sx={ { fontSize: '1.1rem', lineHeight: 1, fontFamily: 'monospace' } }
			>
				{ time }
			</Typography>
			<Typography
				variant="caption"
				aria-hidden="true"
				sx={ {
					color: 'text.secondary',
					fontWeight: 600,
					fontSize: '0.8rem',
					letterSpacing: '0.1em', // Wider letter spacing for airport codes (JFK)
				} }
			>
				{ airport }
			</Typography>
		</Box>
	)
}

// Duration cell renderer with accessible labels
const DurationCell = ( { row }: GridRenderCellParams<Flight> ) => {
	const isFastest = row.isFastest
	const ariaLabel = isFastest
		? `${ row.durationFormatted }, fastest option`
		: `Flight duration: ${ row.durationFormatted }`

	return (
		<Box
			sx={ {
				display: 'flex',
				alignItems: 'center',
				height: '100%',
				gap: 1.5,
			} }
			role="text"
			aria-label={ ariaLabel }
		>
			<Typography
				variant="body2"
				fontWeight={ 500 }
				color="text.primary"
				sx={ { fontFamily: 'monospace', fontSize: '0.9rem' } }
			>
				{ row.durationFormatted }
			</Typography>
			{ isFastest && (
				<Box
					aria-hidden="true"
					sx={ {
						...badgeStyle,
						backgroundColor: '#0284c7', // Sky 600
						color: 'white',
					} }
				>
					FASTEST
				</Box>
			) }
		</Box>
	)
}

// Airline cell renderer with accessible labels
const AirlineCell = ( { value, row }: GridRenderCellParams<Flight, string> ) => {
	const ariaLabel = `${ value }, flight number ${ row.flightNumber }`

	return (
		<Box
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				height: '100%',
				gap: 0.25,
			} }
			role="text"
			aria-label={ ariaLabel }
		>
			<Typography
				variant="body2"
				fontWeight={ 700 }
				color="text.primary"
				sx={ {
					textTransform: 'uppercase',
					fontSize: '0.85rem',
					letterSpacing: '0.05em'
				} }
			>
				{ value }
			</Typography>
			<Typography
				variant="caption"
				aria-hidden="true"
				sx={ {
					color: 'text.secondary',
					fontWeight: 500,
					fontFamily: 'monospace',
					fontSize: '0.75rem',
				} }
			>
				{ row.flightNumber }
			</Typography>
		</Box>
	)
}

// Column definitions with accessibility improvements
export const useFlightColumns = (): GridColDef<Flight>[] => {
	return useMemo(
		() => [
			{
				field: 'airline',
				headerName: 'Airline',
				description: 'Airline name and flight number',
				minWidth: 160,
				flex: 1,
				renderCell: AirlineCell,
			},
			{
				field: 'departureTime',
				headerName: 'Departure',
				description: 'Flight departure time and airport',
				minWidth: 120, // Increased slightly
				flex: 0.8,
				renderCell: TimeCell,
			},
			{
				field: 'arrivalTime',
				headerName: 'Arrival',
				description: 'Flight arrival time and airport',
				minWidth: 120, // Increased slightly
				flex: 0.8,
				renderCell: TimeCell,
			},
			{
				field: 'duration',
				headerName: 'Duration',
				description: 'Total flight duration',
				minWidth: 160,
				flex: 1,
				renderCell: DurationCell,
			},
			{
				field: 'stops',
				headerName: 'Stops',
				description: 'Number of stops during flight',
				minWidth: 140,
				flex: 0.9,
				renderCell: StopsCell,
			},
			{
				field: 'price',
				headerName: 'Price',
				description: 'Total ticket price',
				minWidth: 180,
				flex: 1,
				renderCell: PriceCell,
			},
		],
		[]
	)
}

export default useFlightColumns
