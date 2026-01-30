'use client'

import { useState, useMemo, useCallback } from 'react'
import { DataGrid, GridColumnVisibilityModel } from '@mui/x-data-grid'
import { Paper, Box, Alert } from '@mui/material'
import { Flight } from '@/app/lib/types'
import { useFlightColumns } from './columns'
import GridEmptyState from './GridEmptyState'
import GridToolbar from './GridToolbar'
import { useColumnPresets } from '@/app/hooks/useColumnPresets'

interface FlightsDataGridProps {
	flights: Flight[]
	isLoading?: boolean
	hasSearched?: boolean
	isMockData?: boolean
	error?: string | null
	onClearFilters?: () => void
	hasActiveFilters?: boolean
}

export default function FlightsDataGrid ( {
	flights,
	isLoading = false,
	hasSearched = false,
	isMockData = false,
	error = null,
	onClearFilters,
	hasActiveFilters = false,
}: FlightsDataGridProps ) {
	const columns = useFlightColumns()
	const [ paginationModel, setPaginationModel ] = useState( {
		pageSize: 25,
		page: 0,
	} )

	// Column presets hook
	const { activePreset, setPreset, columnVisibility, presets, isAutoMobile } = useColumnPresets()

	// Allow manual column visibility overrides on top of presets
	const [ manualVisibility, setManualVisibility ] = useState<GridColumnVisibilityModel>( {} )

	// Merge preset visibility with manual overrides
	const mergedVisibility = useMemo( () => ( {
		...columnVisibility,
		...manualVisibility,
	} ), [ columnVisibility, manualVisibility ] )

	// Reset manual overrides when preset changes
	const handlePresetChange = useCallback( ( preset: typeof activePreset ) => {
		setManualVisibility( {} )
		setPreset( preset )
	}, [ setPreset ] )

	// Memoize rows for performance
	const rows = useMemo( () => flights, [ flights ] )

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

	// Custom toolbar with flight count and preset selector
	const CustomToolbar = useCallback(
		() => (
			<GridToolbar
				totalResults={ flights.length }
				filteredResults={ flights.length }
				isMockData={ isMockData }
				activePreset={ activePreset }
				onPresetChange={ handlePresetChange }
				presets={ presets }
				isAutoMobile={ isAutoMobile }
			/>
		),
		[ flights.length, isMockData, activePreset, handlePresetChange, presets, isAutoMobile ]
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
					disableRowSelectionOnClick
					columnVisibilityModel={ mergedVisibility }
					onColumnVisibilityModelChange={ setManualVisibility }
					aria-label="Flight search results"
					aria-describedby="flights-table-description"
					slots={ {
						noRowsOverlay: NoRowsOverlay,
						toolbar: CustomToolbar,
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
						'& .MuiDataGrid-row': {
							cursor: 'pointer',
							transition: 'all 0.15s ease-in-out',
							borderLeft: '4px solid transparent',
							bgcolor: 'background.paper',
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
							py: 1,
						},
						'& .MuiTablePagination-root': {
							color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
						},
					} ) }
				/>
				{/* Hidden description for screen readers */ }
				<span id="flights-table-description" style={ { display: 'none' } }>
					Sortable table of flight results. Use arrow keys to navigate between cells, Enter to sort columns.
				</span>
			</Box>
		</Paper>
	)
}
