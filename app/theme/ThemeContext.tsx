'use client'

import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useSyncExternalStore } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import NextAppDirEmotionCacheProvider from './EmotionCache'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
	mode: ThemeMode
	toggleTheme: () => void
	setMode: ( mode: ThemeMode ) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>( undefined )

export function useThemeMode () {
	const context = useContext( ThemeContext )
	if ( !context ) {
		throw new Error( 'useThemeMode must be used within ThemeContextProvider' )
	}
	return context
}

// Standard design tokens for consistency across the app
const BORDER_RADIUS = {
	small: 8,      // Chips, small elements, autocomplete options
	medium: 12,    // Inputs, buttons, cards
	large: 16,     // Large cards, modals
} as const

// Get design tokens based on mode
const getDesignTokens = ( mode: ThemeMode ) => ( {
	shape: {
		borderRadius: BORDER_RADIUS.medium, // Default border radius
	},
	palette: {
		mode,
		...( mode === 'light'
			? {
				// Light mode
				primary: {
					main: '#1976d2',
					light: '#42a5f5',
					dark: '#1565c0',
				},
				secondary: {
					main: '#9c27b0',
					light: '#ba68c8',
					dark: '#7b1fa2',
				},
				success: {
					main: '#2e7d32',
					light: '#4caf50',
				},
				background: {
					default: '#f5f5f5',
					paper: '#ffffff',
				},
				text: {
					primary: '#1a1a1a',
					secondary: '#666666',
				},
			}
			: {
				// Dark mode
				primary: {
					main: '#90caf9',
					light: '#e3f2fd',
					dark: '#42a5f5',
				},
				secondary: {
					main: '#ce93d8',
					light: '#f3e5f5',
					dark: '#ab47bc',
				},
				success: {
					main: '#66bb6a',
					light: '#81c784',
				},
				background: {
					default: '#121212',
					paper: '#1e1e1e',
				},
				text: {
					primary: '#ffffff',
					secondary: '#b0b0b0',
				},
			} ),
	},
	typography: {
		fontFamily: 'var(--font-geist-sans), "Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none' as const,
					borderRadius: BORDER_RADIUS.medium,
					fontWeight: 600,
					padding: '10px 24px',
					transition: 'all 0.2s ease-in-out',
				},
				contained: {
					boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)',
					'&:hover': {
						boxShadow: '0 6px 20px rgba(25, 118, 210, 0.45)',
						transform: 'translateY(-1px)',
					},
					'&:active': {
						transform: 'translateY(0)',
						boxShadow: '0 2px 8px rgba(25, 118, 210, 0.35)',
					},
				},
				containedPrimary: {
					background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
					'&:hover': {
						background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 100%)',
					},
				},
				outlined: {
					borderWidth: 2,
					'&:hover': {
						borderWidth: 2,
						backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: BORDER_RADIUS.medium,
						backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
						transition: 'all 0.2s ease-in-out',
						'&:hover': {
							backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
						},
						'&.Mui-focused': {
							backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
							boxShadow: mode === 'dark'
								? '0 0 0 3px rgba(144, 202, 249, 0.2)'
								: '0 0 0 3px rgba(25, 118, 210, 0.1)',
						},
						'& fieldset': {
							borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
							borderWidth: 1,
							transition: 'border-color 0.2s ease-in-out',
						},
						'&:hover fieldset': {
							borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
						},
						'&.Mui-focused fieldset': {
							borderWidth: 2,
						},
					},
					'& .MuiInputLabel-root': {
						fontWeight: 500,
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: BORDER_RADIUS.medium,
					backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
					transition: 'all 0.2s ease-in-out',
					'&:hover': {
						backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
					},
					'&.Mui-focused': {
						backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
						boxShadow: mode === 'dark'
							? '0 0 0 3px rgba(144, 202, 249, 0.2)'
							: '0 0 0 3px rgba(25, 118, 210, 0.1)',
					},
					'& fieldset': {
						borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
						transition: 'border-color 0.2s ease-in-out',
					},
					'&:hover fieldset': {
						borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
					},
				},
				notchedOutline: {
					borderRadius: BORDER_RADIUS.medium,
				},
			},
		},
		MuiAutocomplete: {
			styleOverrides: {
				paper: {
					borderRadius: BORDER_RADIUS.medium,
					boxShadow: mode === 'dark'
						? '0 8px 32px rgba(0, 0, 0, 0.4)'
						: '0 8px 32px rgba(0, 0, 0, 0.12)',
					marginTop: 8,
				},
				listbox: {
					padding: 8,
					'& .MuiAutocomplete-option': {
						borderRadius: BORDER_RADIUS.small,
						margin: '2px 0',
						'&[aria-selected="true"]': {
							backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
						},
						'&.Mui-focused': {
							backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
						},
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: BORDER_RADIUS.medium,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: BORDER_RADIUS.small,
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
				},
			},
		},
		MuiDataGrid: {
			styleOverrides: {
				root: {
					border: 'none',
					backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
					'& .MuiDataGrid-cell': {
						borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
						color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
					},
					'& .MuiDataGrid-row': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
						color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
					},
					'& .MuiDataGrid-columnHeaders': {
						backgroundColor: mode === 'dark' ? '#2d2d2d' : '#fafafa',
						borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
						color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
					},
					'& .MuiDataGrid-columnHeader': {
						backgroundColor: mode === 'dark' ? '#2d2d2d' : '#fafafa',
						color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
					},
					'& .MuiDataGrid-columnHeaderTitle': {
						color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
						fontWeight: 600,
					},
					'& .MuiDataGrid-filler': {
						backgroundColor: mode === 'dark' ? '#2d2d2d' : '#fafafa',
					},
					'& .MuiDataGrid-footerContainer': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
						borderTop: '1px solid',
						borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
					},
					'& .MuiTablePagination-root': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					'& .MuiTablePagination-toolbar': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					'& .MuiTablePagination-selectLabel': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
					},
					'& .MuiTablePagination-displayedRows': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
					},
					'& .MuiTablePagination-select': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
					},
					'& .MuiTablePagination-selectIcon': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
					},
					'& .MuiTablePagination-actions .MuiIconButton-root': {
						color: mode === 'dark' ? '#ffffff' : 'inherit',
					},
					'& .MuiDataGrid-row:hover': {
						backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
					},
					'& .MuiDataGrid-virtualScroller': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					'& .MuiDataGrid-scrollbar': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					'& .MuiDataGrid-scrollbar--horizontal': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					// Scrollbar styling
					'& ::-webkit-scrollbar': {
						width: 8,
						height: 8,
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
					},
					'& ::-webkit-scrollbar-track': {
						backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f1f1f1',
					},
					'& ::-webkit-scrollbar-thumb': {
						backgroundColor: mode === 'dark' ? '#555' : '#c1c1c1',
						borderRadius: 4,
					},
					'& ::-webkit-scrollbar-thumb:hover': {
						backgroundColor: mode === 'dark' ? '#777' : '#a1a1a1',
					},
				},
			},
		},
	},
} )

interface ThemeContextProviderProps {
	children: ReactNode
}

// Helper to detect if we're on the client
const emptySubscribe = () => () => { }
const getServerSnapshot = () => false
const getClientSnapshot = () => true

export function ThemeContextProvider ( { children }: ThemeContextProviderProps ) {
	// Use useSyncExternalStore to safely track hydration
	const isClient = useSyncExternalStore( emptySubscribe, getClientSnapshot, getServerSnapshot )

	const [ mode, setMode ] = useState<ThemeMode>( () => {
		// Initialize from localStorage if on client, otherwise default to light
		if ( typeof window !== 'undefined' ) {
			const savedMode = localStorage.getItem( 'theme-mode' ) as ThemeMode | null
			if ( savedMode && ( savedMode === 'light' || savedMode === 'dark' ) ) {
				return savedMode
			}
			// Check system preference
			return window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? 'dark' : 'light'
		}
		return 'light'
	} )

	// Save theme preference and update DOM when mode changes
	useEffect( () => {
		if ( isClient ) {
			localStorage.setItem( 'theme-mode', mode )
			// Set data-theme attribute for CSS scrollbar styling
			document.documentElement.setAttribute( 'data-theme', mode )
			document.body.setAttribute( 'data-theme', mode )
		}
	}, [ mode, isClient ] )

	const toggleTheme = () => {
		setMode( prevMode => ( prevMode === 'light' ? 'dark' : 'light' ) )
	}

	const theme = useMemo( () => createTheme( getDesignTokens( mode ) ), [ mode ] )

	const contextValue = useMemo( () => ( {
		mode,
		toggleTheme,
		setMode,
	} ), [ mode ] )

	// Prevent flash of wrong theme during SSR
	if ( !isClient ) {
		return null
	}

	return (
		<ThemeContext.Provider value={ contextValue }>
			<NextAppDirEmotionCacheProvider>
				<ThemeProvider theme={ theme }>
					<CssBaseline />
					{ children }
				</ThemeProvider>
			</NextAppDirEmotionCacheProvider>
		</ThemeContext.Provider>
	)
}
