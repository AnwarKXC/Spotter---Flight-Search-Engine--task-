'use client'

import { useMemo } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Box,
	Typography,
	Chip,
	Paper,
	Divider,
	useTheme,
	useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AirlineStopsIcon from '@mui/icons-material/AirlineStops'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Flight } from '@/app/lib/types'

interface ComparisonModalProps {
	open: boolean
	onClose: () => void
	flights: Flight[]
}

// Format time from ISO string
function formatTime ( isoString: string ): string {
	const date = new Date( isoString )
	return date.toLocaleTimeString( 'en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	} )
}

// Format duration from minutes
function formatDuration ( minutes: number ): string {
	const hours = Math.floor( minutes / 60 )
	const mins = minutes % 60
	return `${ hours }h ${ mins }m`
}

// Format price
function formatPrice ( price: number, currency: string = 'USD' ): string {
	return new Intl.NumberFormat( 'en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	} ).format( price )
}

// Get stops text
function getStopsText ( stops: number ): string {
	if ( stops === 0 ) return 'Direct'
	if ( stops === 1 ) return '1 Stop'
	return `${ stops } Stops`
}

export default function ComparisonModal ( { open, onClose, flights }: ComparisonModalProps ) {
	const theme = useTheme()
	const isMobile = useMediaQuery( theme.breakpoints.down( 'sm' ) )
	const isTablet = useMediaQuery( theme.breakpoints.down( 'md' ) )

	// Calculate best values for highlighting
	const analysis = useMemo( () => {
		if ( flights.length === 0 ) return null

		const cheapestPrice = Math.min( ...flights.map( f => f.price ) )
		const fastestDuration = Math.min( ...flights.map( f => f.duration ) )
		const fewestStops = Math.min( ...flights.map( f => f.stops ) )

		// Calculate savings
		const maxPrice = Math.max( ...flights.map( f => f.price ) )
		const priceDiff = maxPrice - cheapestPrice

		// Calculate time difference
		const maxDuration = Math.max( ...flights.map( f => f.duration ) )
		const timeDiff = maxDuration - fastestDuration

		return {
			cheapestPrice,
			fastestDuration,
			fewestStops,
			priceDiff,
			timeDiff,
			flights: flights.map( f => ( {
				...f,
				isCheapest: f.price === cheapestPrice,
				isFastest: f.duration === fastestDuration,
				hasFewestStops: f.stops === fewestStops,
			} ) ),
		}
	}, [ flights ] )

	if ( !analysis ) return null

	return (
		<Dialog
			open={ open }
			onClose={ onClose }
			maxWidth="lg"
			fullWidth
			fullScreen={ isMobile }
			aria-labelledby="comparison-dialog-title"
			PaperProps={ {
				sx: {
					borderRadius: isMobile ? 0 : 3,
					maxHeight: isMobile ? '100%' : '90vh',

				},
			} }
		>
			<DialogTitle
				id="comparison-dialog-title"
				sx={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: '1px solid',
					borderColor: 'divider',
					pb: 2,
				} }
			>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
					<EmojiEventsIcon color="primary" />
					<Typography variant="h6" fontWeight={ 700 }>
						Compare Flights
					</Typography>
					<Chip
						label={ `${ flights.length } flights` }
						size="small"
						color="primary"
						variant="outlined"
					/>
				</Box>
				<IconButton
					onClick={ onClose }
					aria-label="Close comparison"
					edge="end"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={ { p: { xs: 2, md: 3 }, mt: 2 } }>
				{/* Summary Banner */ }
				{ analysis.priceDiff > 0 && (
					<Paper
						elevation={ 0 }
						sx={ {
							p: 2,
							mb: 3,
							bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)',
							borderRadius: 2,
							border: '1px solid',
							borderColor: 'success.main',
						} }
					>
						<Typography variant="body2" color="success.main" fontWeight={ 600 }>
							💡 You could save up to { formatPrice( analysis.priceDiff ) } by choosing the cheapest option
							{ analysis.timeDiff > 0 && ` • Fastest flight saves ${ formatDuration( analysis.timeDiff ) }` }
						</Typography>
					</Paper>
				) }

				{/* Comparison Grid */ }
				<Box
					sx={ {
						display: 'grid',
						pt: analysis.priceDiff > 0 ? 0 : 2,
						gridTemplateColumns: {
							xs: '1fr',
							sm: flights.length === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
						},
						gap: { xs: 2, md: 3 },
					} }
				>
					{ analysis.flights.map( ( flight, index ) => (
						<FlightCard
							key={ flight.id }
							flight={ flight }
							index={ index }
							isCheapest={ flight.isCheapest }
							isFastest={ flight.isFastest }
							hasFewestStops={ flight.hasFewestStops }
						/>
					) ) }
				</Box>

				{/* Comparison Table for Desktop */ }
				{ !isTablet && (
					<Box sx={ { mt: 4 } }>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							Quick Comparison
						</Typography>
						<ComparisonTable flights={ analysis.flights } />
					</Box>
				) }
			</DialogContent>
		</Dialog>
	)
}

// Flight Card Component
interface FlightCardProps {
	flight: Flight & { isCheapest: boolean; isFastest: boolean; hasFewestStops: boolean }
	index: number
	isCheapest: boolean
	isFastest: boolean
	hasFewestStops: boolean
}

function FlightCard ( { flight, index, isCheapest, isFastest, hasFewestStops }: FlightCardProps ) {
	const theme = useTheme()
	const hasBadge = isCheapest || isFastest

	return (
		<Paper
			elevation={ hasBadge ? 4 : 1 }
			sx={ {
				p: { xs: 2, md: 3 },
				borderRadius: 3,
				position: 'relative',
				border: '2px solid',
				borderColor: hasBadge
					? ( isCheapest ? 'success.main' : 'primary.main' )
					: 'transparent',
				bgcolor: hasBadge
					? ( theme.palette.mode === 'dark'
						? ( isCheapest ? 'rgba(46, 125, 50, 0.08)' : 'rgba(25, 118, 210, 0.08)' )
						: ( isCheapest ? 'rgba(46, 125, 50, 0.04)' : 'rgba(25, 118, 210, 0.04)' )
					)
					: 'background.paper',
				transition: 'all 0.2s ease-in-out',
				'&:hover': {
					transform: 'translateY(-2px)',
					boxShadow: theme.shadows[ 6 ],
				},
			} }
		>
			{/* Badges */ }
			<Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 } }>
				{ isCheapest && (
					<Chip
						icon={ <AttachMoneyIcon /> }
						label="Cheapest"
						size="small"
						color="success"
						sx={ { fontWeight: 600 } }
					/>
				) }
				{ isFastest && (
					<Chip
						icon={ <AccessTimeIcon /> }
						label="Fastest"
						size="small"
						color="primary"
						sx={ { fontWeight: 600 } }
					/>
				) }
				{ hasFewestStops && !isCheapest && !isFastest && (
					<Chip
						icon={ <AirlineStopsIcon /> }
						label="Fewest Stops"
						size="small"
						color="secondary"
						sx={ { fontWeight: 600 } }
					/>
				) }
				{ !hasBadge && !hasFewestStops && (
					<Chip
						label={ `Option ${ index + 1 }` }
						size="small"
						variant="outlined"
					/>
				) }
			</Box>

			{/* Airline */ }
			<Typography variant="subtitle1" fontWeight={ 700 } gutterBottom>
				{ flight.airline }
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 2 } }>
				{ flight.flightNumber }
			</Typography>

			<Divider sx={ { my: 2 } } />

			{/* Route */ }
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } }>
				<FlightTakeoffIcon fontSize="small" color="action" />
				<Box>
					<Typography variant="body2" fontWeight={ 600 }>
						{ formatTime( flight.departureTime ) }
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{ flight.origin }
					</Typography>
				</Box>
				<Box sx={ { flexGrow: 1, borderTop: '1px dashed', borderColor: 'divider', mx: 1 } } />
				<FlightLandIcon fontSize="small" color="action" />
				<Box>
					<Typography variant="body2" fontWeight={ 600 }>
						{ formatTime( flight.arrivalTime ) }
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{ flight.destination }
					</Typography>
				</Box>
			</Box>

			{/* Details */ }
			<Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 2 } }>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
					<AccessTimeIcon fontSize="small" color="action" />
					<Typography
						variant="body2"
						fontWeight={ isFastest ? 700 : 400 }
						color={ isFastest ? 'primary.main' : 'text.secondary' }
					>
						{ formatDuration( flight.duration ) }
					</Typography>
				</Box>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
					<AirlineStopsIcon fontSize="small" color="action" />
					<Typography variant="body2" color="text.secondary">
						{ getStopsText( flight.stops ) }
					</Typography>
				</Box>
			</Box>

			<Divider sx={ { my: 2 } } />

			{/* Price */ }
			<Box sx={ { textAlign: 'center' } }>
				<Typography
					variant="h5"
					fontWeight={ 800 }
					color={ isCheapest ? 'success.main' : 'text.primary' }
				>
					{ formatPrice( flight.price, flight.currency ) }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					per person
				</Typography>
			</Box>
		</Paper>
	)
}

// Comparison Table Component
interface ComparisonTableProps {
	flights: ( Flight & { isCheapest: boolean; isFastest: boolean; hasFewestStops: boolean } )[]
}

function ComparisonTable ( { flights }: ComparisonTableProps ) {
	const theme = useTheme()

	const rows = [
		{ label: 'Airline', getValue: ( f: Flight ) => f.airline },
		{ label: 'Flight', getValue: ( f: Flight ) => f.flightNumber },
		{ label: 'Departure', getValue: ( f: Flight ) => `${ formatTime( f.departureTime ) } (${ f.origin })` },
		{ label: 'Arrival', getValue: ( f: Flight ) => `${ formatTime( f.arrivalTime ) } (${ f.destination })` },
		{ label: 'Duration', getValue: ( f: Flight ) => formatDuration( f.duration ), highlight: 'fastest' },
		{ label: 'Stops', getValue: ( f: Flight ) => getStopsText( f.stops ) },
		{ label: 'Price', getValue: ( f: Flight ) => formatPrice( f.price, f.currency ), highlight: 'cheapest' },
	]

	return (
		<Paper
			variant="outlined"
			sx={ {
				borderRadius: 2,
				overflow: 'hidden',
			} }
		>
			<Box
				component="table"
				sx={ {
					width: '100%',
					borderCollapse: 'collapse',
					'& th, & td': {
						p: 1.5,
						textAlign: 'left',
						borderBottom: '1px solid',
						borderColor: 'divider',
					},
					'& th': {
						bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
						fontWeight: 600,
						fontSize: '0.75rem',
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						color: 'text.secondary',
					},
					'& tr:last-child td': {
						borderBottom: 'none',
					},
				} }
			>
				<thead>
					<tr>
						<th>Attribute</th>
						{ flights.map( ( f, i ) => (
							<th key={ f.id }>
								{ f.isCheapest ? '🏆 ' : f.isFastest ? '⚡ ' : '' }
								Option { i + 1 }
							</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ rows.map( row => (
						<tr key={ row.label }>
							<td>
								<Typography variant="body2" color="text.secondary">
									{ row.label }
								</Typography>
							</td>
							{ flights.map( f => {
								const isBest =
									( row.highlight === 'cheapest' && f.isCheapest ) ||
									( row.highlight === 'fastest' && f.isFastest )

								return (
									<td key={ f.id }>
										<Typography
											variant="body2"
											fontWeight={ isBest ? 700 : 400 }
											color={ isBest ? 'success.main' : 'text.primary' }
										>
											{ row.getValue( f ) }
										</Typography>
									</td>
								)
							} ) }
						</tr>
					) ) }
				</tbody>
			</Box>
		</Paper>
	)
}
