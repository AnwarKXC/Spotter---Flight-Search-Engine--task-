'use client'

import { Box, Typography, Button, Chip, Stack } from '@mui/material'
import FlightIcon from '@mui/icons-material/Flight'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'

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
					background: 'linear-gradient(180deg, rgba(25, 118, 210, 0.02) 0%, transparent 100%)',
				} }
			>
				<Box
					sx={ {
						width: 80,
						height: 80,
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'rgba(25, 118, 210, 0.08)',
						mb: 3,
					} }
				>
					<FlightIcon sx={ { fontSize: 40, color: 'primary.main' } } aria-hidden="true" />
				</Box>
				<Typography variant="h5" component="h3" fontWeight={ 600 } color="text.primary" gutterBottom>
					Ready to explore?
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={ { mb: 3, maxWidth: 400 } }>
					Enter your origin, destination, and travel dates above to discover available flights.
				</Typography>
				<Stack direction="row" spacing={ 1 } flexWrap="wrap" justifyContent="center" useFlexGap sx={ { rowGap: 1 } }>
					<Chip
						icon={ <LightbulbOutlinedIcon sx={ { fontSize: 16 } } /> }
						label="Popular routes are shown first"
						size="small"
						variant="outlined"
						sx={ { borderColor: 'divider' } }
					/>
					<Chip
						icon={ <CalendarTodayIcon sx={ { fontSize: 16 } } /> }
						label="Flexible dates get more options"
						size="small"
						variant="outlined"
						sx={ { borderColor: 'divider' } }
					/>
				</Stack>
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
					background: 'linear-gradient(180deg, rgba(237, 137, 54, 0.04) 0%, transparent 100%)',
				} }
			>
				<Box
					sx={ {
						width: 80,
						height: 80,
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'rgba(237, 137, 54, 0.08)',
						mb: 3,
					} }
				>
					<TuneIcon sx={ { fontSize: 40, color: 'warning.main' } } aria-hidden="true" />
				</Box>
				<Typography variant="h5" component="h3" fontWeight={ 600 } color="text.primary" gutterBottom>
					Filters too strict
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={ { mb: 3, maxWidth: 400 } }>
					No flights match your current filter settings. Try expanding your criteria.
				</Typography>
				<Stack direction="column" spacing={ 1 } alignItems="center">
					{ onClearFilters && (
						<Button
							variant="contained"
							onClick={ onClearFilters }
							aria-label="Clear all filters to show all flights"
							sx={ { textTransform: 'none' } }
						>
							Clear All Filters
						</Button>
					) }
					<Typography variant="caption" color="text.secondary">
						💡 Tip: Try widening the price range or including more stops
					</Typography>
				</Stack>
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
				background: 'linear-gradient(180deg, rgba(244, 67, 54, 0.02) 0%, transparent 100%)',
			} }
		>
			<Box
				sx={ {
					width: 80,
					height: 80,
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'rgba(244, 67, 54, 0.08)',
					mb: 3,
				} }
			>
				<SearchIcon sx={ { fontSize: 40, color: 'error.light' } } aria-hidden="true" />
			</Box>
			<Typography variant="h5" component="h3" fontWeight={ 600 } color="text.primary" gutterBottom>
				No flights found
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={ { mb: 3, maxWidth: 400 } }>
				We couldn&apos;t find any flights for your search criteria.
			</Typography>
			<Stack direction="row" spacing={ 1 } flexWrap="wrap" justifyContent="center" useFlexGap sx={ { rowGap: 1 } }>
				<Chip
					icon={ <CalendarTodayIcon sx={ { fontSize: 16 } } /> }
					label="Try different dates"
					size="small"
					variant="outlined"
					sx={ { borderColor: 'divider' } }
				/>
				<Chip
					icon={ <FlightIcon sx={ { fontSize: 16 } } /> }
					label="Try nearby airports"
					size="small"
					variant="outlined"
					sx={ { borderColor: 'divider' } }
				/>
			</Stack>
		</Box>
	)
}
