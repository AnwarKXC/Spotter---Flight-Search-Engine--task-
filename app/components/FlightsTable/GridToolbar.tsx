'use client'

import {
	GridToolbarContainer,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
	GridToolbarDensitySelector,
	GridToolbarExport,
} from '@mui/x-data-grid'
import { Box, Typography, Chip } from '@mui/material'

interface GridToolbarProps {
	totalResults: number
	filteredResults: number
	isMockData?: boolean
}

export default function GridToolbar ( {
	totalResults,
	filteredResults,
	isMockData = false,
}: GridToolbarProps ) {
	const resultsText = filteredResults === totalResults
		? `${ totalResults } flight${ totalResults !== 1 ? 's' : '' }`
		: `${ filteredResults } of ${ totalResults } flights`

	return (
		<GridToolbarContainer
			role="toolbar"
			aria-label="Flight results table controls"
			sx={ { px: 2, py: 1, gap: 2 } }
		>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
				<Typography
					variant="body2"
					color="text.secondary"
					aria-live="polite"
					aria-atomic="true"
				>
					{ resultsText }
				</Typography>
				{ isMockData && (
					<Chip
						label="Demo Mode"
						size="small"
						color="warning"
						aria-label="Currently showing demo data, not live flight information"
						sx={ { height: 20, fontSize: '0.7rem' } }
					/>
				) }
			</Box>
			<Box sx={ { flexGrow: 1 } } aria-hidden="true" />
			<GridToolbarColumnsButton
				slotProps={ {
					button: {
						'aria-label': 'Show or hide table columns',
					},
				} }
			/>
			<GridToolbarFilterButton
				slotProps={ {
					button: {
						'aria-label': 'Filter table data',
					},
				} }
			/>
			<GridToolbarDensitySelector
				slotProps={ {
					button: {
						'aria-label': 'Change table row density',
					},
				} }
			/>
			<GridToolbarExport
				slotProps={ {
					button: {
						'aria-label': 'Export flight data',
					},
				} }
			/>
		</GridToolbarContainer>
	)
}
