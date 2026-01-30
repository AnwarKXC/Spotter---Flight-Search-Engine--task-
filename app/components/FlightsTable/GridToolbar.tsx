'use client'

import { Box, Typography, Chip, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Button, alpha } from '@mui/material'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlightIcon from '@mui/icons-material/Flight'
import { PresetName, ColumnPreset } from '@/app/hooks/useColumnPresets'
import { Flight } from '@/app/lib/types'

export interface CustomToolbarProps {
	totalResults?: number
	filteredResults?: number
	isMockData?: boolean
	activePreset?: PresetName
	onPresetChange?: ( preset: PresetName ) => void
	presets?: ColumnPreset[]
	isAutoMobile?: boolean
	selectedCount?: number
	selectedFlights?: Flight[]
	onCompare?: () => void
}

export default function CustomGridToolbar ( {
	totalResults = 0,
	filteredResults = 0,
	isMockData = false,
	activePreset,
	onPresetChange,
	presets,
	isAutoMobile = false,
	selectedCount = 0,
	onCompare,
}: CustomToolbarProps ) {
	const resultsText = filteredResults === totalResults
		? `${ totalResults } flight${ totalResults !== 1 ? 's' : '' }`
		: `${ filteredResults } of ${ totalResults }`

	const handlePresetChange = ( event: SelectChangeEvent<PresetName> ) => {
		if ( onPresetChange ) {
			onPresetChange( event.target.value as PresetName )
		}
	}

	// Get current preset label for display
	const currentPreset = presets?.find( p => p.id === activePreset )

	return (
		<Box
			role="toolbar"
			aria-label="Flight results table controls"
			sx={ ( theme ) => ( {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				px: { xs: 2, md: 3 },
				py: 1.5,
				gap: 2,
				flexWrap: 'wrap',
				borderBottom: '1px solid',
				borderColor: theme.palette.divider,
				background: theme.palette.mode === 'dark'
					? `linear-gradient(180deg, ${ alpha( theme.palette.background.paper, 0.95 ) } 0%, ${ theme.palette.background.paper } 100%)`
					: `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`,
				minHeight: 60,
			} ) }
		>
			{/* Left Section - Results & Selection Info */ }
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
				{/* Flight Count */ }
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.75 } }>
					<FlightIcon sx={ { fontSize: 18, color: 'text.secondary', transform: 'rotate(45deg)' } } />
					<Typography
						variant="body2"
						fontWeight={ 600 }
						color="text.primary"
						aria-live="polite"
						aria-atomic="true"
					>
						{ resultsText }
					</Typography>
				</Box>

				{/* Demo Mode Badge */ }
				{ isMockData && (
					<Chip
						label="Demo"
						size="small"
						color="warning"
						variant="outlined"
						aria-label="Currently showing demo data"
						sx={ {
							height: 24,
							fontSize: '0.7rem',
							fontWeight: 600,
							borderRadius: 1.5,
						} }
					/>
				) }

				{/* Selection Count */ }
				{ selectedCount > 0 && (
					<Chip
						icon={ <CheckCircleIcon sx={ { fontSize: '14px !important' } } /> }
						label={ selectedCount >= 3 ? `${ selectedCount } max` : `${ selectedCount } selected` }
						size="small"
						color="primary"
						variant="filled"
						aria-label={ `${ selectedCount } flights selected for comparison` }
						sx={ {
							height: 26,
							fontSize: '0.75rem',
							fontWeight: 600,
							borderRadius: 1.5,
							'& .MuiChip-icon': {
								marginLeft: '8px',
							},
						} }
					/>
				) }
			</Box>

			{/* Right Section - Actions */ }
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
				{/* Compare Button */ }
				{ selectedCount >= 2 && (
					<Button
						variant="contained"
						size="small"
						startIcon={ <CompareArrowsIcon /> }
						aria-label={ `Compare ${ selectedCount } selected flights` }
						onClick={ onCompare }
						sx={ ( theme ) => ( {
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8125rem',
							borderRadius: 2,
							px: 2,
							py: 0.75,
							boxShadow: 'none',
							background: `linear-gradient(135deg, ${ theme.palette.primary.main } 0%, ${ theme.palette.primary.dark } 100%)`,
							'&:hover': {
								boxShadow: `0 4px 12px ${ alpha( theme.palette.primary.main, 0.4 ) }`,
								transform: 'translateY(-1px)',
							},
							transition: 'all 0.2s ease-in-out',
						} ) }
					>
						Compare { selectedCount }
					</Button>
				) }

				{/* Column Presets Selector */ }
				{ presets && activePreset && onPresetChange && (
					<FormControl size="small" sx={ { minWidth: 160 } }>
						<InputLabel
							id="column-preset-label"
							sx={ {
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								fontSize: '0.8125rem',
							} }
						>
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
							renderValue={ () => (
								<Typography variant="body2" fontWeight={ 500 } noWrap>
									{ currentPreset?.label || activePreset }
								</Typography>
							) }
							sx={ {
								borderRadius: 2,
								'& .MuiSelect-select': {
									py: 1,
									display: 'flex',
									alignItems: 'center',
								},
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'divider',
								},
							} }
						>
							{ presets.map( ( preset ) => (
								<MenuItem
									key={ preset.id }
									value={ preset.id }
									sx={ {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'flex-start',
										py: 1.5,
										px: 2,
										gap: 0.25,
									} }
								>
									<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
										<Typography variant="body2" fontWeight={ 600 }>
											{ preset.label }
										</Typography>
										{ isAutoMobile && preset.id === 'mobile' && (
											<Chip
												label="Auto"
												size="small"
												color="info"
												sx={ { height: 18, fontSize: '0.65rem', fontWeight: 600 } }
											/>
										) }
									</Box>
									<Typography variant="caption" color="text.secondary">
										{ preset.description }
									</Typography>
								</MenuItem>
							) ) }
						</Select>
					</FormControl>
				) }
			</Box>
		</Box>
	)
}
