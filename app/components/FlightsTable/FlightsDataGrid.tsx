'use client'

import { useState, useMemo, useCallback } from 'react'
import { DataGrid, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid'
import { Paper, Box, Alert } from '@mui/material'
import { Flight } from '@/app/lib/types'
import { useFlightColumns } from './columns'
import GridEmptyState from './GridEmptyState'
import CustomGridToolbar from './GridToolbar'
import { useColumnPresets } from '@/app/hooks/useColumnPresets'
import ComparisonModal from '@/app/components/ComparisonModal/ComparisonModal'

interface FlightsDataGridProps {
	flights: Flight[]
	isLoading?: boolean
	hasSearched?: boolean
	isMockData?: boolean
	error?: string | null
	onClearFilters?: () => void
	hasActiveFilters?: boolean
	onToggleFavorite?: ( flight: Flight ) => void
	isFavorite?: ( flightId: string, flight?: Flight ) => boolean
	highlightedFlightId?: string | null
}

export default function FlightsDataGrid ( {
	flights,
	isLoading = false,
	hasSearched = false,
	isMockData = false,
	error = null,
	onClearFilters,
	hasActiveFilters = false,
	onToggleFavorite,
	isFavorite,
	highlightedFlightId,
}: FlightsDataGridProps ) {
	const columns = useFlightColumns( { onToggleFavorite, isFavorite } )
	const [ paginationModel, setPaginationModel ] = useState( {
		pageSize: 25,
		page: 0,
	} )

	// Column presets hook (includes persisted manual visibility)
	const {
		activePreset,
		setPreset,
		columnVisibility,
		presets,
		isAutoMobile,
		manualVisibility,
		setManualVisibility,
	} = useColumnPresets()

	// Merge preset visibility with manual overrides
	const mergedVisibility = useMemo( () => ( {
		...columnVisibility,
		...manualVisibility,
	} ), [ columnVisibility, manualVisibility ] )

	// Reset manual overrides when preset changes (handled in hook now)
	const handlePresetChange = useCallback( ( preset: typeof activePreset ) => {
		setPreset( preset )
	}, [ setPreset ] )

	// Memoize rows for performance
	const rows = useMemo( () => flights, [ flights ] )

	// Row selection for comparison (max 3)
	const [ selectedRowIds, setSelectedRowIds ] = useState<GridRowId[]>( [] )

	const handleRowSelection = useCallback( ( model: GridRowSelectionModel ) => {
		// MUI X v8: model has { type, ids } structure
		const ids = Array.from( model.ids )
		// Limit to max 3 selections for comparison
		if ( ids.length <= 3 ) {
			setSelectedRowIds( ids )
		}
	}, [] )

	// Create the selection model for DataGrid
	const rowSelectionModel: GridRowSelectionModel = useMemo( () => ( {
		type: 'include' as const,
		ids: new Set( selectedRowIds ),
	} ), [ selectedRowIds ] )

	// Get selected flight objects for comparison
	const selectedFlights = useMemo( () => {
		return flights.filter( f => selectedRowIds.includes( f.id ) )
	}, [ flights, selectedRowIds ] )

	// Comparison modal state
	const [ isCompareModalOpen, setIsCompareModalOpen ] = useState( false )

	const handleOpenCompare = useCallback( () => {
		if ( selectedFlights.length >= 2 ) {
			setIsCompareModalOpen( true )
		}
	}, [ selectedFlights.length ] )

	const handleCloseCompare = useCallback( () => {
		setIsCompareModalOpen( false )
	}, [] )

	// Custom empty state
	const NoRowsOverlay = useCallback(
		() => (
			<GridEmptyState
				hasSearched={ hasSearched }
				onClearFilters={ onClearFilters }
				hasActiveFilters={ hasActiveFilters }
			/>
		),
		[ hasSearched, onClearFilters, hasActiveFilters ]
	)

	return (
		<Paper
			elevation={ 1 }
			component="section"
			aria-labelledby="flights-table-heading"
			sx={ { width: '100%', borderRadius: 2, minWidth: 0 } }
		>
			{/* Screen reader heading */ }
			<h2
				id="flights-table-heading"
				style={ { position: 'absolute', left: '-9999px' } }
			>
				Flight search results table
			</h2>

			{ error && (
				<Alert severity="error" sx={ { m: 2 } } role="alert">
					{ error }
				</Alert>
			) }

			{/* Custom Toolbar - Rendered outside DataGrid for reliability */ }
			<CustomGridToolbar
				totalResults={ flights.length }
				filteredResults={ flights.length }
				isMockData={ isMockData }
				activePreset={ activePreset }
				onPresetChange={ handlePresetChange }
				presets={ presets }
				isAutoMobile={ isAutoMobile }
				selectedCount={ selectedRowIds.length }
				onCompare={ handleOpenCompare }
			/>

			<Box sx={ {
				height: { xs: 450, sm: 500, md: 600 },
				width: '100%',
				minWidth: 0,
			} }>
				<DataGrid
					rows={ rows }
					columns={ columns }
					loading={ isLoading }
					paginationModel={ paginationModel }
					onPaginationModelChange={ setPaginationModel }
					pageSizeOptions={ [ 10, 25, 50, 100 ] }
					checkboxSelection
					rowSelectionModel={ rowSelectionModel }
					onRowSelectionModelChange={ handleRowSelection }
					disableRowSelectionOnClick
					columnVisibilityModel={ mergedVisibility }
					onColumnVisibilityModelChange={ setManualVisibility }
					aria-label="Flight search results"
					aria-describedby="flights-table-description"
					getRowClassName={ ( params ) =>
						params.id === highlightedFlightId ? 'highlighted-row' : ''
					}
					slots={ {
						noRowsOverlay: NoRowsOverlay,
					} }
					slotProps={ {
						loadingOverlay: {
							variant: 'skeleton',
							noRowsVariant: 'skeleton',
						},
					} }
					initialState={ {
						sorting: {
							sortModel: [ { field: 'price', sort: 'asc' } ],
						},
					} }
					localeText={ {
						columnMenuSortAsc: 'Sort ascending',
						columnMenuSortDesc: 'Sort descending',
						columnMenuFilter: 'Filter flights',
						columnMenuHideColumn: 'Hide this column',
						columnMenuManageColumns: 'Manage columns',
						noRowsLabel: 'No flights found',
						footerRowSelected: ( count: number ) => `${ count } flight${ count !== 1 ? 's' : '' } selected`,
					} }
					rowHeight={ 72 }
					columnHeaderHeight={ 56 }
					sx={ ( theme ) => ( {
						border: 'none',
						borderRadius: 3,
						overflow: 'hidden',
						boxShadow: theme.palette.mode === 'dark'
							? '0 1px 3px rgba(0,0,0,0.3)'
							: '0 1px 3px rgba(0,0,0,0.08)',
						bgcolor: 'background.paper',
						// Checkbox column styling - larger checkboxes and wider column
						'& .MuiDataGrid-cellCheckbox, & .MuiDataGrid-columnHeaderCheckbox': {
							minWidth: 70,
							width: 70,
							justifyContent: 'center',
							'& .MuiCheckbox-root': {
								padding: 1,
								'& .MuiSvgIcon-root': {
									fontSize: '1.5rem',
								},
							},
						},
						'& .MuiDataGrid-row': {
							cursor: 'pointer',
							transition: 'all 0.15s ease-in-out',
							borderLeft: '4px solid transparent',
							bgcolor: 'background.paper',
							'&.highlighted-row': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(239, 68, 68, 0.15)'
									: 'rgba(239, 68, 68, 0.1)',
								borderLeftColor: '#ef4444',
								animation: 'pulse-highlight 1.5s ease-in-out 3',
								'& .MuiDataGrid-cell': {
									fontWeight: 600,
								},
							},
							'&:nth-of-type(even)': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(255, 255, 255, 0.02)'
									: 'rgba(0, 0, 0, 0.02)',
							},
							'&:hover': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(144, 202, 249, 0.08)'
									: 'rgba(25, 118, 210, 0.04)',
								borderLeftColor: 'primary.main',
								boxShadow: theme.palette.mode === 'dark'
									? '0 2px 8px rgba(0,0,0,0.3)'
									: '0 2px 8px rgba(0,0,0,0.08)',
							},
							'&.Mui-selected': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(144, 202, 249, 0.16)'
									: 'rgba(25, 118, 210, 0.08)',
								borderLeftColor: 'primary.main',
								'&:hover': {
									backgroundColor: theme.palette.mode === 'dark'
										? 'rgba(144, 202, 249, 0.24)'
										: 'rgba(25, 118, 210, 0.12)',
								},
							},
						},
						'& .MuiDataGrid-cell': {
							borderBottom: '1px solid',
							borderColor: theme.palette.mode === 'dark'
								? 'rgba(255, 255, 255, 0.08)'
								: 'rgba(0, 0, 0, 0.06)',
							px: 2,
							display: 'flex',
							alignItems: 'center',
							color: 'text.primary',
							'&:focus': {
								outline: '2px solid',
								outlineColor: 'primary.main',
								outlineOffset: -2,
							},
						},
						'& .MuiDataGrid-columnHeaders': {
							backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f8fafc',
							borderBottom: '2px solid',
							borderColor: theme.palette.mode === 'dark'
								? 'rgba(255, 255, 255, 0.12)'
								: '#e2e8f0',
							'& .MuiDataGrid-columnHeaderTitle': {
								fontWeight: 700,
								color: theme.palette.mode === 'dark' ? '#94a3b8' : '#475569',
								textTransform: 'uppercase',
								fontSize: '0.7rem',
								letterSpacing: '0.08em',
							},
						},
						'& .MuiDataGrid-columnHeader': {
							px: 2,
							'&:focus': {
								outline: '2px solid',
								outlineColor: 'primary.main',
								outlineOffset: -2,
							},
						},
						'& .MuiDataGrid-virtualScroller': {
							minHeight: 400,
							bgcolor: 'background.paper',
						},
						'& .MuiDataGrid-footerContainer': {
							borderTop: '1px solid',
							borderColor: theme.palette.mode === 'dark'
								? 'rgba(255, 255, 255, 0.12)'
								: '#e2e8f0',
							backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
							minHeight: 52,
						},
						'& .MuiDataGrid-toolbarContainer': {
							borderBottom: '1px solid',
							borderColor: theme.palette.mode === 'dark'
								? 'rgba(255, 255, 255, 0.12)'
								: '#e2e8f0',
							backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
							px: 2,
							py: 1.5,
							minHeight: 56,
							display: 'flex',
							alignItems: 'center',
						},
						'& .MuiTablePagination-root': {
							color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
						},
						'@keyframes pulse-highlight': {
							'0%, 100%': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(239, 68, 68, 0.15)'
									: 'rgba(239, 68, 68, 0.1)',
							},
							'50%': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(239, 68, 68, 0.25)'
									: 'rgba(239, 68, 68, 0.2)',
							},
						},
					} ) }
				/>
				{/* Hidden description for screen readers */ }
				<span id="flights-table-description" style={ { display: 'none' } }>
					Sortable table of flight results. Use arrow keys to navigate between cells, Enter to sort columns.
				</span>
			</Box>

			{/* Comparison Modal */ }
			<ComparisonModal
				open={ isCompareModalOpen }
				onClose={ handleCloseCompare }
				flights={ selectedFlights }
			/>
		</Paper>
	)
}
