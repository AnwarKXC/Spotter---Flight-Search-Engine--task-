'use client'

import { useMemo, useState } from 'react'
import {
	Box,
	Paper,
	Typography,
	Skeleton,
	Collapse,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from 'recharts'
import { Flight } from '@/app/lib/types'

interface InteractiveChartProps {
	flights: Flight[]
	filteredFlights: Flight[]
	priceRange: [ number, number ]
	priceExtent: [ number, number ]
	onPriceRangeChange?: ( range: [ number, number ] ) => void
	isLoading?: boolean
}

interface PriceBucket {
	range: string
	rangeStart: number
	rangeEnd: number
	count: number
	filteredCount: number
	minPrice: number
	maxPrice: number
}

interface TooltipPayload {
	range: string
	count: number
	filteredCount: number
	minPrice: number
	maxPrice: number
}

const formatPrice = ( value: number ): string => {
	return `$${ value.toLocaleString() }`
}

// Custom tooltip component
const CustomTooltip = ( {
	active,
	payload,
}: {
	active?: boolean
	payload?: Array<{ payload: TooltipPayload }>
} ) => {
	if ( !active || !payload || payload.length === 0 ) return null

	const data = payload[ 0 ].payload
	return (
		<Paper
			sx={ {
				p: 1.5,
				backgroundColor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				boxShadow: 2,
			} }
		>
			<Typography variant="body2" fontWeight={ 600 } gutterBottom>
				{ data.range }
			</Typography>
			<Typography variant="body2" color="text.secondary">
				{ data.filteredCount } of { data.count } flights
			</Typography>
			<Typography variant="caption" color="text.secondary">
				{ formatPrice( data.minPrice ) } - { formatPrice( data.maxPrice ) }
			</Typography>
		</Paper>
	)
}

export function InteractiveChart ( {
	flights,
	filteredFlights,
	priceRange,
	priceExtent,
	onPriceRangeChange,
	isLoading = false,
}: InteractiveChartProps ) {
	const theme = useTheme()
	const isMobile = useMediaQuery( theme.breakpoints.down( 'md' ) )
	const isVerySmall = useMediaQuery( '(max-width: 400px)' )
	const [ isExpanded, setIsExpanded ] = useState( !isMobile ) // Collapsed by default on mobile
	// Calculate price distribution buckets
	const chartData = useMemo( (): PriceBucket[] => {
		if ( flights.length === 0 ) return []

		const [ minPrice, maxPrice ] = priceExtent
		const bucketCount = 10
		const bucketSize = Math.ceil( ( maxPrice - minPrice ) / bucketCount ) || 1

		const buckets: PriceBucket[] = []

		for ( let i = 0; i < bucketCount; i++ ) {
			const rangeStart = minPrice + i * bucketSize
			const rangeEnd = i === bucketCount - 1 ? maxPrice : rangeStart + bucketSize - 1

			const flightsInBucket = flights.filter(
				( f ) => f.price >= rangeStart && f.price <= rangeEnd
			)
			const filteredInBucket = filteredFlights.filter(
				( f ) => f.price >= rangeStart && f.price <= rangeEnd
			)

			const prices = flightsInBucket.map( ( f ) => f.price )

			buckets.push( {
				range: `${ formatPrice( rangeStart ) } - ${ formatPrice( rangeEnd ) }`,
				rangeStart,
				rangeEnd,
				count: flightsInBucket.length,
				filteredCount: filteredInBucket.length,
				minPrice: prices.length > 0 ? Math.min( ...prices ) : rangeStart,
				maxPrice: prices.length > 0 ? Math.max( ...prices ) : rangeEnd,
			} )
		}

		return buckets
	}, [ flights, filteredFlights, priceExtent ] )

	// Calculate statistics
	const stats = useMemo( () => {
		if ( filteredFlights.length === 0 ) {
			return { min: 0, max: 0, avg: 0 }
		}
		const prices = filteredFlights.map( ( f ) => f.price )
		return {
			min: Math.min( ...prices ),
			max: Math.max( ...prices ),
			avg: Math.round( prices.reduce( ( a, b ) => a + b, 0 ) / prices.length ),
		}
	}, [ filteredFlights ] )

	// Handle chart click for price range filtering
	const handleChartClick = ( data: unknown ) => {
		const chartData = data as { activePayload?: Array<{ payload: PriceBucket }> }
		if ( chartData.activePayload && chartData.activePayload.length > 0 && onPriceRangeChange ) {
			const bucket = chartData.activePayload[ 0 ].payload
			onPriceRangeChange( [ bucket.rangeStart, bucket.rangeEnd ] )
		}
	}

	if ( isLoading ) {
		return (
			<Paper sx={ { p: 2, mb: 3 } }>
				<Skeleton variant="text" width={ 200 } height={ 32 } />
				<Skeleton variant="rectangular" height={ 200 } sx={ { mt: 2 } } />
			</Paper>
		)
	}

	if ( flights.length === 0 ) {
		return (
			<Paper sx={ { p: 3, mb: 3, textAlign: 'center' } }>
				<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 } }>
					<ShowChartIcon sx={ { color: 'text.secondary' } } />
					<Typography variant="body2" color="text.secondary">
						Search for flights to see price distribution
					</Typography>
				</Box>
			</Paper>
		)
	}

	return (
		<Paper
			component="section"
			aria-labelledby="price-chart-heading"
			sx={ { p: 2, mb: 3 } }
		>
			{/* Header - Always visible, clickable on mobile to expand/collapse */ }
			<Box
				component={ isMobile ? 'button' : 'div' }
				type={ isMobile ? 'button' : undefined }
				aria-expanded={ isMobile ? isExpanded : undefined }
				aria-controls={ isMobile ? 'price-chart-content' : undefined }
				onClick={ isMobile ? () => setIsExpanded( !isExpanded ) : undefined }
				sx={ {
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: isExpanded ? 2 : 0,
					width: '100%',
					background: 'none',
					border: 'none',
					padding: 0,
					cursor: isMobile ? 'pointer' : 'default',
					textAlign: 'left',
					'&:focus': isMobile ? {
						outline: '2px solid',
						outlineColor: 'primary.main',
						outlineOffset: 2,
						borderRadius: 1,
					} : {},
				} }
			>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
					<ShowChartIcon sx={ { color: 'primary.main', fontSize: 20 } } />
					<Typography variant="h6" component="h3" id="price-chart-heading" fontWeight={ 600 }>
						Price Distribution
					</Typography>
					{ isMobile && (
						<Box
							component="span"
							sx={ {
								ml: 0.5,
								display: 'flex',
								alignItems: 'center',
								color: 'action.active',
							} }
							aria-hidden="true"
						>
							{ isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" /> }
						</Box>
					) }
				</Box>

				{/* Stats - Always visible even when collapsed */ }
				<Box sx={ { display: 'flex', gap: { xs: 1.5, sm: 3 } } }>
					<Box sx={ { textAlign: 'center' } }>
						<Typography variant="caption" color="text.secondary" display="block" sx={ { fontSize: { xs: '0.65rem', sm: '0.75rem' } } }>
							MIN
						</Typography>
						<Typography variant="body2" fontWeight={ 700 } color="success.main" sx={ { fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem' } } }>
							{ formatPrice( stats.min ) }
						</Typography>
					</Box>
					<Box sx={ { textAlign: 'center' } }>
						<Typography variant="caption" color="text.secondary" display="block" sx={ { fontSize: { xs: '0.65rem', sm: '0.75rem' } } }>
							AVG
						</Typography>
						<Typography variant="body2" fontWeight={ 700 } sx={ { fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem' } } }>
							{ formatPrice( stats.avg ) }
						</Typography>
					</Box>
					<Box sx={ { textAlign: 'center' } }>
						<Typography variant="caption" color="text.secondary" display="block" sx={ { fontSize: { xs: '0.65rem', sm: '0.75rem' } } }>
							MAX
						</Typography>
						<Typography variant="body2" fontWeight={ 700 } color="error.main" sx={ { fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem' } } }>
							{ formatPrice( stats.max ) }
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Collapsible Chart Content */ }
			<Collapse in={ isExpanded } id="price-chart-content">
				<Box
					sx={ {
						width: '100%',
						height: isVerySmall ? 160 : 200,
						overflow: 'hidden',
					} }
					role="img"
					aria-label="Price distribution chart"
				>
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={ chartData }
							margin={ { top: 10, right: isVerySmall ? 5 : 10, left: isVerySmall ? -15 : 0, bottom: 0 } }
							onClick={ handleChartClick }
							style={ { cursor: onPriceRangeChange ? 'pointer' : 'default' } }
						>
							<defs>
								<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#0284c7" stopOpacity={ 0.3 } />
									<stop offset="95%" stopColor="#0284c7" stopOpacity={ 0 } />
								</linearGradient>
								<linearGradient id="colorFiltered" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#059669" stopOpacity={ 0.8 } />
									<stop offset="95%" stopColor="#059669" stopOpacity={ 0.1 } />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={ false } />
							{ !isVerySmall && (
								<XAxis
									dataKey="range"
									tick={ { fontSize: 10 } }
									tickLine={ false }
									axisLine={ { stroke: '#e2e8f0' } }
									interval="preserveStartEnd"
								/>
							) }
							<YAxis
								tick={ { fontSize: 10 } }
								tickLine={ false }
								axisLine={ false }
								allowDecimals={ false }
								width={ isVerySmall ? 30 : 40 }
							/>
							<Tooltip content={ <CustomTooltip /> } />

							{/* Background area showing all flights */ }
							<Area
								type="monotone"
								dataKey="count"
								stroke="#0284c7"
								strokeWidth={ 1 }
								fill="url(#colorCount)"
								name="All Flights"
							/>

							{/* Foreground area showing filtered flights */ }
							<Area
								type="monotone"
								dataKey="filteredCount"
								stroke="#059669"
								strokeWidth={ 2 }
								fill="url(#colorFiltered)"
								name="Filtered Flights"
							/>

							{/* Reference lines for current filter range */ }
							{ priceRange[ 0 ] > priceExtent[ 0 ] && (
								<ReferenceLine
									x={ chartData.find( ( b ) => b.rangeStart <= priceRange[ 0 ] && b.rangeEnd >= priceRange[ 0 ] )?.range }
									stroke="#7c3aed"
									strokeDasharray="5 5"
									strokeWidth={ 2 }
								/>
							) }
							{ priceRange[ 1 ] < priceExtent[ 1 ] && (
								<ReferenceLine
									x={ chartData.find( ( b ) => b.rangeStart <= priceRange[ 1 ] && b.rangeEnd >= priceRange[ 1 ] )?.range }
									stroke="#7c3aed"
									strokeDasharray="5 5"
									strokeWidth={ 2 }
								/>
							) }
						</AreaChart>
					</ResponsiveContainer>
				</Box>

				{/* Legend and instruction */ }
				<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 } }>
					<Box sx={ { display: 'flex', gap: 2 } }>
						<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
							<Box sx={ { width: 12, height: 12, bgcolor: '#0284c7', borderRadius: 0.5, opacity: 0.5 } } />
							<Typography variant="caption" color="text.secondary">
								All Flights
							</Typography>
						</Box>
						<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
							<Box sx={ { width: 12, height: 12, bgcolor: '#059669', borderRadius: 0.5 } } />
							<Typography variant="caption" color="text.secondary">
								Filtered
							</Typography>
						</Box>
					</Box>
					{ onPriceRangeChange && (
						<Typography variant="caption" color="text.secondary">
							Click a bar to filter by price range
						</Typography>
					) }
				</Box>
			</Collapse>
		</Paper>
	)
}

export default InteractiveChart
