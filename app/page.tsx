'use client'

import { Container, Typography, Box, Alert, Link } from '@mui/material'
import Grid from '@mui/material/Grid'
import { visuallyHidden } from '@mui/utils'
import SearchForm from '@/app/components/SearchForm/SearchForm'
import { FilterPanel } from '@/app/components/Filters/FilterPanel'
import { FilterChips } from '@/app/components/Filters/FilterChips'
import { useFlightsSearch } from '@/app/hooks/useFlightsSearch'
import { useFlightsFilters } from '@/app/hooks/useFlightsFilters'
import FlightsDataGrid from './components/FlightsTable/FlightsDataGrid'

export default function Home () {
  const {
    flights,
    isLoading,
    error,
    isMockData,
    hasSearched,
    search,
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

  return (
    <Box
      component="div"
      sx={ { minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, sm: 3, md: 4 } } }
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

      <Container maxWidth="xl">
        {/* Header with semantic heading */ }
        <Box
          component="header"
          role="banner"
          sx={ { mb: { xs: 2, sm: 3, md: 4 } } }
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={ 600 }
            gutterBottom
            id="page-title"
          >
            <span role="img" aria-label="Airplane">✈️</span> Flight Search Engine
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find and compare flights with real-time pricing
          </Typography>
        </Box>

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
                  <FlightsDataGrid
                    flights={ filteredFlights }
                    isLoading={ isLoading }
                    hasSearched={ hasSearched }
                    isMockData={ isMockData }
                    onClearFilters={ clearFilters }
                    hasActiveFilters={ hasActiveFilters }
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <FlightsDataGrid
              flights={ filteredFlights }
              isLoading={ isLoading }
              hasSearched={ hasSearched }
              isMockData={ isMockData }
              onClearFilters={ clearFilters }
              hasActiveFilters={ hasActiveFilters }
            />
          ) }
        </Box>
      </Container>
    </Box>
  )
}

