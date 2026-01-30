'use client'

// Note: These toolbar components are marked as "legacy" in MUI X v8
// They still work but will be replaced by the new Toolbar API in future versions
// See: https://mui.com/x/react-data-grid/components/toolbar/
import {
	GridToolbarContainer,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
	GridToolbarDensitySelector,
	GridToolbarExport,
} from '@mui/x-data-grid'
import { Box, Typography, Chip, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import { PresetName, ColumnPreset } from '@/app/hooks/useColumnPresets'

interface GridToolbarProps {
	totalResults: number
	filteredResults: number
	isMockData?: boolean
	// Column preset props
	activePreset?: PresetName
	onPresetChange?: ( preset: PresetName ) => void
	presets?: ColumnPreset[]
	isAutoMobile?: boolean
}

export default function GridToolbar ( {
	totalResults,
	filteredResults,
	isMockData = false,
	activePreset,
	onPresetChange,
	presets,
	isAutoMobile = false,
}: GridToolbarProps ) {
	const resultsText = filteredResults === totalResults
		? `${ totalResults } flight${ totalResults !== 1 ? 's' : '' }`
		: `${ filteredResults } of ${ totalResults } flights`

	const handlePresetChange = ( event: SelectChangeEvent<PresetName> ) => {
		if ( onPresetChange ) {
			onPresetChange( event.target.value as PresetName )
		}
	}

	return (
		<GridToolbarContainer
			role="toolbar"
			aria-label="Flight results table controls"
			sx={ { px: 2, py: 1, gap: 2, flexWrap: 'wrap' } }
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

			{/* Column Presets Selector */ }
			{ presets && activePreset && onPresetChange && (
				<FormControl size="small" sx={ { minWidth: 140 } }>
					<InputLabel id="column-preset-label" sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
						<ViewColumnIcon sx={ { fontSize: 16 } } />
						View
					</InputLabel>
					<Select
						labelId="column-preset-label"
						id="column-preset-select"
						value={ activePreset }
						label="View"
						onChange={ handlePresetChange }
						aria-label="Select column preset view"
						sx={ {
							'& .MuiSelect-select': {
								display: 'flex',
								alignItems: 'center',
								py: 0.75,
							}
						} }
					>
						{ presets.map( ( preset ) => (
							<MenuItem
								key={ preset.id }
								value={ preset.id }
								sx={ { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }
							>
								<Typography variant="body2" fontWeight={ 500 }>
									{ preset.label }
									{ isAutoMobile && preset.id === 'mobile' && (
										<Chip
											label="Auto"
											size="small"
											color="info"
											sx={ { ml: 1, height: 16, fontSize: '0.65rem' } }
										/>
									) }
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{ preset.description }
								</Typography>
							</MenuItem>
						) ) }
					</Select>
				</FormControl>
			) }

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
