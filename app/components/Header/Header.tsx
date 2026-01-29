'use client'

import {
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	Box,
	Tooltip,
	Container,
} from '@mui/material'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useThemeMode } from '@/app/theme/ThemeContext'

export default function Header () {
	const { mode, toggleTheme } = useThemeMode()

	return (
		<AppBar
			position="sticky"
			elevation={ 0 }
			sx={ {
				bgcolor: 'background.default',
				boxShadow: 'none',
			} }
		>
			<Container maxWidth="xl">
				<Toolbar
					disableGutters
					sx={ {
						justifyContent: 'space-between',
						borderBottom: '1px solid',
						borderColor: 'divider',
					} }
				>
					{/* Logo & Brand */ }
					<Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
						<Box
							sx={ {
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 40,
								height: 40,
								borderRadius: 2,
								bgcolor: 'primary.main',
								color: 'white',
							} }
						>
							<FlightTakeoffIcon />
						</Box>
						<Box>
							<Typography
								variant="h6"
								component="h1"
								sx={ {
									fontWeight: 700,
									color: 'text.primary',
									lineHeight: 1.2,
									fontSize: { xs: '1rem', sm: '1.25rem' },
								} }
							>
								FlightSearch
							</Typography>
							<Typography
								variant="caption"
								sx={ {
									color: 'text.secondary',
									display: { xs: 'none', sm: 'block' },
									lineHeight: 1,
								} }
							>
								Find & Compare Flights
							</Typography>
						</Box>
					</Box>

					{/* Actions */ }
					<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
						<Tooltip title={ mode === 'dark' ? 'Light mode' : 'Dark mode' }>
							<IconButton
								onClick={ toggleTheme }
								color="inherit"
								aria-label={ mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode' }
								sx={ { color: 'text.primary' } }
							>
								{ mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon /> }
							</IconButton>
						</Tooltip>
						<Tooltip title="View on GitHub">
							<IconButton
								component="a"
								href="https://github.com/AnwarKXC/Spotter---Flight-Search-Engine--task-"
								target="_blank"
								rel="noopener noreferrer"
								color="inherit"
								aria-label="View source on GitHub"
								sx={ { color: 'text.primary' } }
							>
								<GitHubIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	)
}
