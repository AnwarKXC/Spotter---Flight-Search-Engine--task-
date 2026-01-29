# Copilot Instructions

## Project: Flight Search Engine

A **data-product UI** flight search engine built with **Next.js 16 (App Router)**, TypeScript, MUI v5, MUI X DataGrid, and Recharts. Integrates with **Amadeus Self-Service API** (credentials in `.env`).

> **Philosophy**: Flight results are structured, filterable, customizable data. Design for dense data and real-world usability.

---

## Project Structure
```
app/
├── page.tsx                    # Main flights page
├── layout.tsx                  # MUI ThemeProvider setup
├── lib/
│   ├── amadeus.ts              # Amadeus API (server-side)
│   └── mockData.ts             # Fallback data
├── components/
│   ├── SearchForm/SearchForm.tsx    # "use client"
│   ├── FlightsTable/
│   │   ├── FlightsDataGrid.tsx      # "use client"
│   │   ├── columns.tsx              # Column definitions
│   │   ├── GridToolbar.tsx          # Custom toolbar
│   │   └── GridEmptyState.tsx       # Empty state component
│   ├── Filters/
│   │   ├── FilterPanel.tsx          # "use client"
│   │   └── FilterChips.tsx          # Active filter display
│   └── PriceChart/
│       └── InteractiveChart.tsx     # "use client"
├── hooks/
│   ├── useFlightsSearch.ts
│   ├── useFlightsFilters.ts
│   ├── useGridPreferences.ts
│   └── useApiErrorHandling.ts
└── theme/theme.ts
```

---

# 📋 DEVELOPMENT ROADMAP

## ✅ Phase 0: Project Setup
- [x] Initialize Next.js 16 with App Router
- [x] Configure TypeScript strict mode
- [x] Set up Amadeus API credentials in `.env`
- [x] Install dependencies:
  ```bash
  npm install @mui/material @mui/x-data-grid @emotion/react @emotion/styled recharts amadeus
  ```
- [x] Configure MUI ThemeProvider in `app/layout.tsx`
- [x] Set up emotion cache for App Router SSR

---

## 📅 Day 1: Search & Core Results (~4h)

### TODO 1.1: Amadeus API Client
- [x] Create `app/lib/amadeus.ts`
  - [x] Initialize Amadeus client with env credentials
  - [x] Implement `searchFlights(params)` function
  - [x] Add TypeScript interfaces for API response
  - [x] Handle authentication token refresh
- [x] Create `app/lib/mockData.ts`
  - [x] Generate 20+ realistic flight objects
  - [x] Match Amadeus response structure
  - [x] Include variety: airlines, stops, prices, durations

### TODO 1.2: Search Form Component
- [x] Create `app/components/SearchForm/SearchForm.tsx`
  - [x] Add `"use client"` directive
  - [x] Origin airport autocomplete (MUI Autocomplete)
  - [x] Destination airport autocomplete
  - [x] Departure date picker (MUI DatePicker)
  - [x] Return date picker (optional)
  - [x] Passengers selector
  - [x] Search button with loading state
- [x] Implement form validation
  - [x] Required fields check
  - [x] Date logic (return after departure)
  - [x] Display inline error messages
- [x] Sync search params to URL
  - [x] Use `useSearchParams` hook
  - [x] Enable shareable search links

### TODO 1.3: Basic Results Display
- [x] Create `app/components/FlightsTable/FlightsDataGrid.tsx`
  - [x] Add `"use client"` directive
  - [x] Basic MUI DataGrid setup
  - [x] Display: airline, price, duration, stops
  - [x] Loading skeleton rows (use `loading` prop)
- [x] Create `app/components/FlightsTable/GridEmptyState.tsx`
  - [x] "No flights found" message
  - [x] Helpful guidance text
  - [x] Search adjustment suggestions

### TODO 1.4: Error Handling
- [x] Create `app/hooks/useApiErrorHandling.ts`
  - [x] Exponential backoff retry (3 attempts)
  - [x] Rate limit detection (429 status)
  - [x] Network failure handling
  - [x] Error state management
- [x] Implement error messages:
  - [x] 429: "API quota exceeded, showing cached results"
  - [x] Network: "Connection failed, retrying..."
  - [x] Invalid: "Please adjust search criteria"
- [x] Add fallback to mock data when API fails

---

## 📅 Day 2: Data Grid Mastery + Filter UI (~4.5h)

### TODO 2.1: Custom Column Renderers
- [x] Create `app/components/FlightsTable/columns.tsx`
  - [x] **Price column**: Currency format, green for cheapest
  - [x] **Stops column**: Visual indicators (DIRECT / 1 STOP / 2+ STOPS)
  - [x] **Duration column**: Minutes → "2h 15m" format
  - [x] **Departure/Arrival**: "14:30 JFK" format
  - [x] **Airline column**: Name + flight number
- [x] Add sorting configuration per column
- [x] Add column visibility defaults

### TODO 2.2: DataGrid Advanced Features
- [x] Enable column resize & reorder
- [x] Configure virtualized scrolling
- [x] Add row hover states
- [x] Implement sticky header
- [x] Create `app/components/FlightsTable/GridToolbar.tsx`
  - [x] Column visibility toggle
  - [x] Export button (optional)
  - [x] Density selector

### TODO 2.3: Grid Preferences Persistence
- [x] Create `app/hooks/useGridPreferences.ts`
  - [x] Save column order to localStorage
  - [x] Save column widths to localStorage
  - [x] Save column visibility to localStorage
  - [x] Load preferences on mount
  - [x] Debounce saves (500ms)

### TODO 2.4: Filter UI Components (No Logic Yet)
- [x] Create `app/components/Filters/FilterPanel.tsx`
  - [x] Add `"use client"` directive
  - [x] **Stops filter**: Chip selection (0 / 1 / 2+)
  - [x] **Airline filter**: Autocomplete multi-select
  - [x] **Price range**: Dual-thumb slider
  - [x] Clear all button
- [x] Responsive layout:
  - [x] Desktop: Collapsible sidebar
  - [x] Mobile: Bottom drawer (MUI SwipeableDrawer)

---

## 📅 Day 3: Filter Logic + Live Chart (~5.5h)

### TODO 3.1: Filter State Management
- [x] Create `app/hooks/useFlightsFilters.ts`
  ```typescript
  const [filters, setFilters] = useState({
    stops: [],           // [0, 1, 2]
    airlines: [],        // ['AA', 'UA']
    priceRange: [0, 10000]
  });
  ```
  - [x] Implement `applyFilters(flights, filters)` function
  - [x] Add debouncing (300ms) for performance
  - [x] Memoize filtered results with `useMemo`

### TODO 3.2: Wire Filters to DataGrid
- [x] Connect FilterPanel to useFlightsFilters hook
- [x] Pass filtered flights to DataGrid
- [x] Show loading overlay during filter application
- [x] Create `app/components/Filters/FilterChips.tsx`
  - [x] Display active filters as chips
  - [x] Individual chip remove buttons
  - [x] "Clear all" option

### TODO 3.3: URL Filter Synchronization
- [x] Sync filter state to URL params
- [x] Parse filters from URL on load
- [x] Enable shareable filtered views

### TODO 3.4: Live Price Chart
- [x] Create `app/components/PriceChart/InteractiveChart.tsx`
  - [x] Add `"use client"` directive
  - [x] Recharts AreaChart with gradient fill
  - [x] X-axis: Price ranges or dates
  - [x] Y-axis: Number of flights
  - [x] Show min/max/avg price markers
  - [x] Highlight current filter range
- [x] Chart-filter synchronization:
  - [x] Chart updates when filters change
  - [x] (Enhanced) Click chart point → apply filter
- [x] Empty chart state with message

### TODO 3.5: Flight Badges
- [x] Compute badges per result set:
  - [x] "Cheapest" → lowest price flight
  - [x] "Fastest" → shortest duration flight
  - [x] "Best Value" → price/duration heuristic
- [x] Display as chips on flight rows

---

## 📅 Day 4: Responsive Design & Polish (~5h)

### TODO 4.1: Desktop UX Polish
- [x] Sticky table header
- [x] Sticky filter sidebar
- [x] Dense layout for fast scanning
- [x] Row hover states with quick actions
- [x] Proper spacing and alignment

### TODO 4.2: Mobile UX
- [x] Filters in SwipeableDrawer (bottom)
- [x] Touch-friendly controls (larger targets)
- [x] Collapsible price chart
- [x] Simplified column layout
- [ ] Test on 320px, 375px, 768px widths

### TODO 4.3: Loading States
- [x] Skeleton loaders during search
- [x] Skeleton for filter panel
- [x] Chart loading placeholder
- [x] Button loading spinners

### TODO 4.4: Error States
- [x] Inline error banners (not modals)
- [x] Retry buttons for network errors
- [x] "Demo mode" banner when using mock data
- [x] Form validation error display

### TODO 4.5: Empty States
- [x] No results: suggestions to broaden search
- [x] No filters match: clear filters prompt
- [x] Initial state: search prompt

### TODO 4.6: Accessibility
- [x] Keyboard navigation for filters
- [x] ARIA labels on all interactive elements
- [x] Focus management in drawers/modals
- [x] Color contrast WCAG AA compliance
- [ ] Screen reader testing (basic)

---

## ✨ Enhanced Features (Only If Core Complete)

### TODO E.1: Column Presets
- [ ] "Quick View": Price, Airline, Duration only
- [ ] "Detailed": All columns visible
- [ ] "Mobile Optimized": Auto-applied on <768px
- [ ] Preset selector in toolbar

### TODO E.2: Comparison Mode
- [ ] DataGrid row checkboxes
- [ ] "Compare Selected" button (2+ selected)
- [ ] ComparisonModal component
  - [ ] Side-by-side view (max 3 flights)
  - [ ] Price difference display
  - [ ] Duration difference
  - [ ] Layover comparison

### TODO E.3: Interactive Chart
- [ ] Click data point → auto-filter to price range
- [ ] Hover tooltips with flight count
- [ ] Zoom/pan controls

### TODO E.4: Dark Mode ✅
- [x] MUI theme dark palette
- [x] Theme toggle button (in Header)
- [x] Persist preference in localStorage
- [x] DataGrid dark mode (footer, scrollbar, cells, headers)
- [x] Theme-aware global scrollbars

### TODO E.5: IP-Based Geolocation ✅
- [x] Auto-detect user location via IP
- [x] Show nearby airports with "Nearby" badge
- [x] Sort airports by distance from user

### TODO E.6: Worldwide Airports Database ✅
- [x] 100+ major international airports
- [x] Grouped by region (North America, Europe, Asia, etc.)
- [x] Search by city, IATA code, airport name, or country

### TODO E.7: Design System Standardization ✅
- [x] Centralized BORDER_RADIUS constants (small=8, medium=12, large=16)
- [x] Consistent border radius across all components
- [x] Fancy gradient Search button with hover animations
- [x] Enhanced input styling with focus rings
- [x] Disabled state for form inputs during loading

### TODO E.8: Responsive Chart ✅
- [x] Chart adapts for screens <400px
- [x] Collapsible chart on mobile
- [x] Touch-friendly controls

---

## Key Patterns

### Client vs Server Components
- **Server**: API calls in `app/lib/` (keep Amadeus credentials server-side)
- **Client**: All MUI components require `"use client"` directive

### State Flow
- **URL params** → Search criteria (shareable links)
- **React state** → Filters (debounced 300ms)
- **localStorage** → Column preferences

### Filter Architecture
```typescript
const [filters, setFilters] = useState({
  stops: [],           // [0, 1, 2]
  airlines: [],        // ['AA', 'UA']
  priceRange: [0, 10000]
});
// Single source of truth → applies to both DataGrid and Chart
```

---

## API & Error Handling

### Amadeus Constraints
- Rate: 10 req/sec, 1000/month (test env)
- Use `mockData.ts` as fallback, label in UI: "Demo mode"

### Error Messages
- 429 → "API quota exceeded, showing cached results"
- Network → "Connection failed" + retry button
- Invalid → "Please adjust search criteria"

---

## Commands
```bash
npm run dev      # Development
npm run build    # Production build
npm run lint     # ESLint
```

---

## Priority Rules
1. Working core (search → results → filters → chart) over extra features
2. Polished UX over feature quantity
3. Bug-free over feature-complete

> **If running behind schedule**: Ship core features with excellent UX over feature-complete with bugs.

---

## BRV Integration

This project uses **brv** for context management and progress tracking.

### Context Source
- **Use `brv query`** to retrieve project context by asking questions
  - Example: `brv query "How do we handle error responses?"`
  - Example: `brv query "What is the project structure?"`
- Context categories in `.brv/context-tree/`:
  - `compliance/` - Compliance requirements
  - `design/` - Design specifications
  - `structure/` - Project structure and architecture
  - `testing/` - Testing requirements
- Read `.brv/context-tree/.snapshot.json` for the current context state

### Progress Curation (REQUIRED)
After completing any task or significant work:
1. **Curate your progress** by running: `brv curate "<brief description of what was done>"`
2. This saves context for future sessions and maintains project continuity
3. Include key decisions, changes made, and any important notes

### Workflow
1. **Before starting**: Check `.brv/` for existing context relevant to the task
2. **During work**: Reference context from `.brv/context-tree/` as needed
3. **After finishing**: Run `brv curate` with a summary of completed work

### BRV Commands
- `brv query "<question>"` - Ask questions to retrieve project context
- `brv curate "<context>"` - Save progress and context after completing work
- Check `.brv/sessions/` for previous session history if needed


## General Guidelines
- Use TypeScript with strict mode
- Follow existing project patterns and conventions
- Maintain clean, readable code