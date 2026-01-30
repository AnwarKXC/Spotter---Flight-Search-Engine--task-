'use client'

import { useState, useCallback, useEffect } from 'react'
import { GridColumnVisibilityModel } from '@mui/x-data-grid'

// Preset definitions
export type PresetName = 'quick' | 'detailed' | 'mobile'

export interface ColumnPreset {
	id: PresetName
	label: string
	description: string
	columns: GridColumnVisibilityModel
}

// Preset configurations
export const COLUMN_PRESETS: ColumnPreset[] = [
	{
		id: 'quick',
		label: 'Quick View',
		description: 'Essential info: Price, Airline, Duration',
		columns: {
			airline: true,
			departureTime: false,
			arrivalTime: false,
			duration: true,
			stops: false,
			price: true,
		},
	},
	{
		id: 'detailed',
		label: 'Detailed',
		description: 'All columns visible',
		columns: {
			airline: true,
			departureTime: true,
			arrivalTime: true,
			duration: true,
			stops: true,
			price: true,
		},
	},
	{
		id: 'mobile',
		label: 'Mobile',
		description: 'Optimized for small screens',
		columns: {
			airline: true,
			departureTime: false,
			arrivalTime: false,
			duration: false,
			stops: true,
			price: true,
		},
	},
]

const STORAGE_KEY = 'flights-column-preset'
const MOBILE_BREAKPOINT = 768

export interface UseColumnPresetsReturn {
	activePreset: PresetName
	setPreset: (preset: PresetName) => void
	columnVisibility: GridColumnVisibilityModel
	presets: ColumnPreset[]
	isAutoMobile: boolean
}

export function useColumnPresets(): UseColumnPresetsReturn {
	// Use lazy initialization to avoid effect-based setState
	const [manualPreset, setManualPreset] = useState<PresetName | null>(() => {
		if (typeof window === 'undefined') return null
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved && ['quick', 'detailed', 'mobile'].includes(saved)) {
			return saved as PresetName
		}
		return null
	})
	
	const [activePreset, setActivePreset] = useState<PresetName>(() => {
		if (typeof window === 'undefined') return 'detailed'
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved && ['quick', 'detailed', 'mobile'].includes(saved)) {
			return saved as PresetName
		}
		return 'detailed'
	})
	
	const [isAutoMobile, setIsAutoMobile] = useState(false)

	// Handle responsive auto-mobile
	useEffect(() => {
		if (typeof window === 'undefined') return

		const checkMobile = () => {
			const isMobile = window.innerWidth < MOBILE_BREAKPOINT
			setIsAutoMobile(isMobile)

			// Auto-apply mobile preset only if user hasn't manually selected one
			if (isMobile && !manualPreset) {
				setActivePreset('mobile')
			} else if (!isMobile && !manualPreset) {
				setActivePreset('detailed')
			} else if (manualPreset) {
				setActivePreset(manualPreset)
			}
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [manualPreset])

	const setPreset = useCallback((preset: PresetName) => {
		setManualPreset(preset)
		setActivePreset(preset)
		
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, preset)
		}
	}, [])

	// Get column visibility from active preset
	const columnVisibility = COLUMN_PRESETS.find(p => p.id === activePreset)?.columns ?? COLUMN_PRESETS[1].columns

	return {
		activePreset,
		setPreset,
		columnVisibility,
		presets: COLUMN_PRESETS,
		isAutoMobile,
	}
}

export default useColumnPresets
