'use client'

import { Box, Typography, Button } from '@mui/material'
import FlightIcon from '@mui/icons-material/Flight'
import SearchIcon from '@mui/icons-material/Search'

interface GridEmptyStateProps {
	hasSearched: boolean
	onClearFilters?: () => void
	hasActiveFilters?: boolean
}

export default function GridEmptyState ( {
	hasSearched,
	onClearFilters,
	hasActiveFilters = false,
}: GridEmptyStateProps ) {
	if ( !hasSearched ) {
		return (
			<Box
				role="status"
				aria-live="polite"
				aria-label="Welcome message: Enter search criteria to find flights"
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					py: 8,
					px: 4,
					textAlign: 'center',
				} }
			>
				<FlightIcon sx={ { fontSize: 64, color: 'action.disabled', mb: 2 } } aria-hidden="true" />
				<Typography variant="h6" component="h3" color="text.secondary" gutterBottom>
					Search for flights
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Enter your origin, destination, and travel dates to find available flights.
				</Typography>
			</Box>
		)
	}

	if ( hasActiveFilters ) {
		return (
			<Box
				role="status"
				aria-live="polite"
				aria-label="No flights match your current filter criteria"
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					py: 8,
					px: 4,
					textAlign: 'center',
				} }
			>
				<SearchIcon sx={ { fontSize: 64, color: 'action.disabled', mb: 2 } } aria-hidden="true" />
				<Typography variant="h6" component="h3" color="text.secondary" gutterBottom>
					No flights match your filters
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
					Try adjusting your filter criteria to see more results.
				</Typography>
				{ onClearFilters && (
					<Button
						variant="outlined"
						onClick={ onClearFilters }
						aria-label="Clear all filters to show all flights"
					>
						Clear All Filters
					</Button>
				) }
			</Box>
		)
	}

	return (
		<Box
			role="status"
			aria-live="polite"
			aria-label="No flights found for your search criteria"
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				py: 8,
				px: 4,
				textAlign: 'center',
			} }
		>
			<FlightIcon sx={ { fontSize: 64, color: 'action.disabled', mb: 2 } } aria-hidden="true" />
			<Typography variant="h6" component="h3" color="text.secondary" gutterBottom>
				No flights found
			</Typography>
			<Typography variant="body2" color="text.secondary">
				We couldn&apos;t find any flights for your search criteria.
				<br />
				Try different dates or airports.
			</Typography>
		</Box>
	)
}
