'use client'

import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import NextAppDirEmotionCacheProvider from './EmotionCache'
import { ThemeContextProvider } from './ThemeContext'

export default function ThemeRegistry ( {
  children,
}: {
  children: React.ReactNode
} ) {
  return (
    <NextAppDirEmotionCacheProvider>
      <ThemeContextProvider>
        <CssBaseline />
        { children }
      </ThemeContextProvider>
    </NextAppDirEmotionCacheProvider>
  )
}
