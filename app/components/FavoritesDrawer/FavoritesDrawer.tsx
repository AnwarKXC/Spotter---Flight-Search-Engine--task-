'use client'

import { useState } from 'react'
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	List,
	ListItem,
	Paper,
	Chip,
	Button,
	Divider,
	useTheme,
	alpha,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import SearchIcon from '@mui/icons-material/Search'
import { FavoriteFlight } from '@/app/hooks/useFavorites'

interface FavoritesDrawerProps {
	open: boolean
	onClose: () => void
	favorites: FavoriteFlight[]
	onRemove: ( flightId: string ) => void
	onClearAll: () => void
	onSelectFlight?: ( flight: FavoriteFlight ) => void
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

// Format duration from minutes
function formatDuration ( minutes: number ): string {
	const hours = Math.floor( minutes / 60 )
	const mins = minutes % 60
	return `${ hours }h ${ mins }m`
}

// Format saved date
function formatSavedDate ( isoString: string ): string {
	const date = new Date( isoString )
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor( diffMs / 60000 )
	const diffHours = Math.floor( diffMs / 3600000 )
	const diffDays = Math.floor( diffMs / 86400000 )

	if ( diffMins < 1 ) return 'Just now'
	if ( diffMins < 60 ) return `${ diffMins }m ago`
	if ( diffHours < 24 ) return `${ diffHours }h ago`
	if ( diffDays < 7 ) return `${ diffDays }d ago`
	return date.toLocaleDateString()
}

// Get stops text
function getStopsText ( stops: number ): string {
	if ( stops === 0 ) return 'Direct'
	if ( stops === 1 ) return '1 Stop'
	return `${ stops } Stops`
}

export default function FavoritesDrawer ( {
	open,
	onClose,
	favorites,
	onRemove,
	onClearAll,
	onSelectFlight,
}: FavoritesDrawerProps ) {
	const theme = useTheme()
	const [ confirmClear, setConfirmClear ] = useState( false )

	const handleSelectFlight = ( flight: FavoriteFlight ) => {
		onSelectFlight?.( flight )
		onClose()
	}

	const handleClearAll = () => {
		if ( confirmClear ) {
			onClearAll()
			setConfirmClear( false )
		} else {
			setConfirmClear( true )
			// Reset after 3 seconds
			setTimeout( () => setConfirmClear( false ), 3000 )
		}
	}

	return (
		<Drawer
			anchor="right"
			open={ open }
			onClose={ onClose }
			PaperProps={ {
				sx: {
					width: { xs: '100%', sm: 400 },
					maxWidth: '100vw',
				},
			} }
		>
			{/* Header */ }
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					p: 2,
					borderBottom: '1px solid',
					borderColor: 'divider',
					background: theme.palette.mode === 'dark'
						? `linear-gradient(180deg, ${ alpha( theme.palette.primary.dark, 0.15 ) } 0%, ${ theme.palette.background.paper } 100%)`
						: `linear-gradient(180deg, ${ alpha( theme.palette.primary.light, 0.15 ) } 0%, ${ theme.palette.background.paper } 100%)`,
				} }
			>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
					<FavoriteIcon color="error" />
					<Typography variant="h6" fontWeight={ 700 }>
						Saved Flights
					</Typography>
					{ favorites.length > 0 && (
						<Chip
							label={ favorites.length }
							size="small"
							color="primary"
							sx={ { height: 22, fontWeight: 600 } }
						/>
					) }
				</Box>
				<IconButton onClick={ onClose } edge="end" aria-label="Close favorites">
					<CloseIcon />
				</IconButton>
			</Box>

			{/* Content */ }
			<Box sx={ { flexGrow: 1, overflow: 'auto', p: 2 } }>
				{ favorites.length === 0 ? (
					<Box
						sx={ {
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							minHeight: 300,
							gap: 2,
							textAlign: 'center',
						} }
					>
						<FavoriteIcon sx={ { fontSize: 64, color: 'action.disabled' } } />
						<Typography variant="h6" color="text.secondary">
							No saved flights
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={ { maxWidth: 280 } }>
							Click the heart icon on any flight to save it for later
						</Typography>
						<Button
							variant="outlined"
							startIcon={ <SearchIcon /> }
							onClick={ onClose }
							sx={ { mt: 2 } }
						>
							Search Flights
						</Button>
					</Box>
				) : (
					<List disablePadding sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
						{ favorites.map( ( flight ) => (
							<ListItem key={ flight.id } disablePadding>
								<Paper
									elevation={ 0 }
									onClick={ () => handleSelectFlight( flight ) }
									sx={ {
										width: '100%',
										p: 2,
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 2,
										cursor: 'pointer',
										transition: 'all 0.2s ease-in-out',
										'&:hover': {
											borderColor: 'primary.main',
											boxShadow: `0 4px 12px ${ alpha( theme.palette.primary.main, 0.15 ) }`,
											transform: 'translateX(-4px)',
										},
									} }
								>
									{/* Route & Time Saved */ }
									<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 } }>
										<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.75 } }>
											<FlightTakeoffIcon sx={ { fontSize: 16, color: 'primary.main' } } />
											<Typography variant="subtitle2" fontWeight={ 700 }>
												{ flight.searchRoute }
											</Typography>
										</Box>
										<Typography variant="caption" color="text.secondary">
											{ formatSavedDate( flight.savedAt ) }
										</Typography>
									</Box>

									{/* Airline */ }
									<Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
										{ flight.airline } • { flight.flightNumber }
									</Typography>

									{/* Details Row */ }
									<Box sx={ { display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 } }>
										<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
											<AccessTimeIcon sx={ { fontSize: 14, color: 'text.secondary' } } />
											<Typography variant="caption" color="text.secondary">
												{ formatDuration( flight.duration ) }
											</Typography>
										</Box>
										<Chip
											label={ getStopsText( flight.stops ) }
											size="small"
											variant="outlined"
											sx={ { height: 20, fontSize: '0.7rem' } }
										/>
									</Box>

									{/* Price & Remove */ }
									<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
										<Typography variant="h6" fontWeight={ 700 } color="success.main">
											{ formatPrice( flight.price, flight.currency ) }
										</Typography>
										<IconButton
											size="small"
											onClick={ () => onRemove( flight.id ) }
											aria-label="Remove from favorites"
											sx={ {
												color: 'text.secondary',
												'&:hover': { color: 'error.main' },
											} }
										>
											<DeleteOutlineIcon fontSize="small" />
										</IconButton>
									</Box>
								</Paper>
							</ListItem>
						) ) }
					</List>
				) }
			</Box>

			{/* Footer - Clear All */ }
			{ favorites.length > 0 && (
				<>
					<Divider />
					<Box sx={ { p: 2 } }>
						<Button
							fullWidth
							variant={ confirmClear ? 'contained' : 'outlined' }
							color={ confirmClear ? 'error' : 'inherit' }
							startIcon={ <DeleteSweepIcon /> }
							onClick={ handleClearAll }
							sx={ { textTransform: 'none' } }
						>
							{ confirmClear ? 'Confirm Clear All' : 'Clear All Favorites' }
						</Button>
					</Box>
				</>
			) }
		</Drawer>
	)
}
