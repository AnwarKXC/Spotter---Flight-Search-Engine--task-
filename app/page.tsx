'use client'

import { useState, useCallback } from 'react'
import { Container, Typography, Box, Alert, Link } from '@mui/material'
import Grid from '@mui/material/Grid'
import { visuallyHidden } from '@mui/utils'
import SearchForm from '@/app/components/SearchForm/SearchForm'
import { FilterPanel } from '@/app/components/Filters/FilterPanel'
import { FilterChips } from '@/app/components/Filters/FilterChips'
import { InteractiveChart } from '@/app/components/PriceChart/InteractiveChart'
import { DestinationSuggestions } from '@/app/components/DestinationSuggestions/DestinationSuggestions'
import FavoritesDrawer from '@/app/components/FavoritesDrawer/FavoritesDrawer'
import { useFlightsSearch } from '@/app/hooks/useFlightsSearch'
import { useFlightsFilters } from '@/app/hooks/useFlightsFilters'
import { useFavorites, FavoriteFlight } from '@/app/hooks/useFavorites'
import FlightsDataGrid from './components/FlightsTable/FlightsDataGrid'
import { type SuggestedDestination } from '@/app/lib/geolocation'
import Header from './components/Header/Header'

export default function Home () {
  const [ favoritesDrawerOpen, setFavoritesDrawerOpen ] = useState( false )
  const [ highlightedFlightId, setHighlightedFlightId ] = useState<string | null>( null )

  const {
    flights,
    isLoading,
    error,
    isMockData,
    hasSearched,
    search,
    searchParams,
  } = useFlightsSearch()

  const {
    filters,
    filteredFlights,
    setStops,
    setAirlines,
    setPriceRange,
    clearFilters,
    hasActiveFilters,
    availableAirlines,
    priceExtent,
  } = useFlightsFilters( flights )

  const {
    favorites,
    favoritesCount,
    toggleFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  } = useFavorites()

  const handleSearch = async ( params: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    adults: number
  } ) => {
    await search( {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
    } )
  }

  const handleRemoveStop = ( stop: number ) => {
    setStops( filters.stops.filter( s => s !== stop ) )
  }

  const handleRemoveAirline = ( airline: string ) => {
    setAirlines( filters.airlines.filter( a => a !== airline ) )
  }

  const handleResetPriceRange = () => {
    setPriceRange( priceExtent )
  }

  // Handle selecting a suggested destination
  const handleSelectDestination = ( destination: SuggestedDestination, originCode: string, departureDate: string, returnDate?: string ) => {
    // Trigger search with the selected destination
    search( {
      origin: originCode,
      destination: destination.airportCode,
      departureDate: departureDate,
      returnDate: returnDate,
      adults: 1,
    } )
  }

  // Handle selecting a favorite flight - search and highlight it
  const handleSelectFavorite = useCallback( async ( flight: FavoriteFlight ) => {
    // Use stored departure date or generate a future date
    const departureDate = flight.departureDate || new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ).toISOString().split( 'T' )[ 0 ]

    // Set the flight to highlight
    setHighlightedFlightId( flight.id )

    // Perform search with the flight's route
    await search( {
      origin: flight.origin,
      destination: flight.destination,
      departureDate: departureDate,
      returnDate: flight.returnDate,
      adults: 1,
    } )

    // Clear highlight after 5 seconds
    setTimeout( () => setHighlightedFlightId( null ), 5000 )
  }, [ search ] )

  return (
    <Box
      component="div"
      sx={ { minHeight: '100vh', bgcolor: 'background.default' } }
    >
      {/* Skip Navigation Link for keyboard users */ }
      <Link
        href="#main-content"
        sx={ {
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          '&:focus': {
            left: 0,
            top: 0,
          },
        } }
      >
        Skip to main content
      </Link>

      {/* App Header with Dark Mode Toggle */ }
      <Header
        favoritesCount={ favoritesCount }
        onOpenFavorites={ () => setFavoritesDrawerOpen( true ) }
      />

      {/* Favorites Drawer */ }
      <FavoritesDrawer
        open={ favoritesDrawerOpen }
        onClose={ () => setFavoritesDrawerOpen( false ) }
        favorites={ favorites }
        onRemove={ removeFavorite }
        onClearAll={ clearFavorites }
        onSelectFlight={ handleSelectFavorite }
      />

      <Container maxWidth="xl" sx={ { py: { xs: 2, sm: 3, md: 4 } } }>
        {/* Search Form Section */ }
        <Box
          component="section"
          aria-labelledby="search-section-heading"
          sx={ { mb: 3 } }
        >
          <Box component="span" sx={ visuallyHidden }>
            <Typography component="h2" id="search-section-heading">
              Flight Search Form
            </Typography>
          </Box>
          <SearchForm onSearch={ handleSearch } isLoading={ isLoading } />
        </Box>

        {/* Demo Mode Alert */ }
        { isMockData && hasSearched && (
          <Alert
            severity="info"
            sx={ { mb: 3 } }
            role="status"
            aria-live="polite"
          >
            Demo mode active — showing sample flight data. API quota may be exceeded.
          </Alert>
        ) }

        {/* Error Alert */ }
        { error && !isMockData && (
          <Alert
            severity="error"
            sx={ { mb: 3 } }
            role="alert"
            aria-live="assertive"
          >
            { error }
          </Alert>
        ) }

        {/* Active Filter Chips */ }
        { hasSearched && (
          <FilterChips
            filters={ filters }
            onRemoveStop={ handleRemoveStop }
            onRemoveAirline={ handleRemoveAirline }
            onResetPriceRange={ handleResetPriceRange }
            onClearAll={ clearFilters }
            hasActiveFilters={ hasActiveFilters }
            availableAirlines={ availableAirlines }
            priceExtent={ priceExtent }
          />
        ) }

        {/* Main Content with Filters and Results */ }
        <Box
          component="main"
          id="main-content"
          role="main"
          aria-label="Flight search results"
          tabIndex={ -1 }
        >
          {/* Screen reader announcement for search results */ }
          <Box
            aria-live="polite"
            aria-atomic="true"
            sx={ { position: 'absolute', left: '-9999px' } }
          >
            { hasSearched && (
              <span>
                { filteredFlights.length } flight{ filteredFlights.length !== 1 ? 's' : '' } found.
                { isLoading && ' Loading more results.' }
              </span>
            ) }
          </Box>

          { hasSearched ? (
            <Box sx={ { flexGrow: 1, width: '100%' } }>
              <Grid container spacing={ { xs: 2, md: 3 } } sx={ { flexWrap: { xs: 'wrap', md: 'nowrap' } } }>
                {/* Filter Panel - Desktop sidebar */ }
                <Grid size={ { xs: 12, md: 'auto' } } sx={ { flexShrink: 0, width: { md: 280 } } }>
                  <FilterPanel
                    filters={ filters }
                    onStopsChange={ setStops }
                    onAirlinesChange={ setAirlines }
                    onPriceRangeChange={ setPriceRange }
                    onClearFilters={ clearFilters }
                    hasActiveFilters={ hasActiveFilters }
                    availableAirlines={ availableAirlines }
                    priceExtent={ priceExtent }
                    resultCount={ filteredFlights.length }
                  />
                </Grid>

                {/* Results Grid */ }
                <Grid size={ { xs: 12, md: 'grow' } } sx={ { minWidth: 0, width: { xs: '100%', md: 'auto' } } }>
                  {/* Price Distribution Chart */ }
                  <InteractiveChart
                    flights={ flights }
                    filteredFlights={ filteredFlights }
                    priceRange={ filters.priceRange }
                    priceExtent={ priceExtent }
                    onPriceRangeChange={ setPriceRange }
                    isLoading={ isLoading }
                  />

                  <FlightsDataGrid
                    flights={ filteredFlights }
                    isLoading={ isLoading }
                    hasSearched={ hasSearched }
                    isMockData={ isMockData }
                    onClearFilters={ clearFilters }
                    hasActiveFilters={ hasActiveFilters }
                    onToggleFavorite={ ( flight ) => toggleFavorite( flight, {
                      departureDate: searchParams?.departureDate,
                      returnDate: searchParams?.returnDate,
                    } ) }
                    isFavorite={ isFavorite }
                    highlightedFlightId={ highlightedFlightId }
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <>
              {/* Destination Suggestions - Show when no search */ }
              <DestinationSuggestions onSelectDestination={ handleSelectDestination } />
            </>
          ) }
        </Box>
      </Container>
    </Box>
  )
}

