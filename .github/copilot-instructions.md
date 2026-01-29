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
- [ ] Create `app/lib/amadeus.ts`
  - [ ] Initialize Amadeus client with env credentials
  - [ ] Implement `searchFlights(params)` function
  - [ ] Add TypeScript interfaces for API response
  - [ ] Handle authentication token refresh
- [ ] Create `app/lib/mockData.ts`
  - [ ] Generate 20+ realistic flight objects
  - [ ] Match Amadeus response structure
  - [ ] Include variety: airlines, stops, prices, durations

### TODO 1.2: Search Form Component
- [ ] Create `app/components/SearchForm/SearchForm.tsx`
  - [ ] Add `"use client"` directive
  - [ ] Origin airport autocomplete (MUI Autocomplete)
  - [ ] Destination airport autocomplete
  - [ ] Departure date picker (MUI DatePicker)
  - [ ] Return date picker (optional)
  - [ ] Passengers selector
  - [ ] Search button with loading state
- [ ] Implement form validation
  - [ ] Required fields check
  - [ ] Date logic (return after departure)
  - [ ] Display inline error messages
- [ ] Sync search params to URL
  - [ ] Use `useSearchParams` hook
  - [ ] Enable shareable search links

### TODO 1.3: Basic Results Display
- [ ] Create `app/components/FlightsTable/FlightsDataGrid.tsx`
  - [ ] Add `"use client"` directive
  - [ ] Basic MUI DataGrid setup
  - [ ] Display: airline, price, duration, stops
  - [ ] Loading skeleton rows (use `loading` prop)
- [ ] Create `app/components/FlightsTable/GridEmptyState.tsx`
  - [ ] "No flights found" message
  - [ ] Helpful guidance text
  - [ ] Search adjustment suggestions

### TODO 1.4: Error Handling
- [ ] Create `app/hooks/useApiErrorHandling.ts`
  - [ ] Exponential backoff retry (3 attempts)
  - [ ] Rate limit detection (429 status)
  - [ ] Network failure handling
  - [ ] Error state management
- [ ] Implement error messages:
  - [ ] 429: "API quota exceeded, showing cached results"
  - [ ] Network: "Connection failed, retrying..."
  - [ ] Invalid: "Please adjust search criteria"
- [ ] Add fallback to mock data when API fails

---

## 📅 Day 2: Data Grid Mastery + Filter UI (~4.5h)

### TODO 2.1: Custom Column Renderers
- [ ] Create `app/components/FlightsTable/columns.tsx`
  - [ ] **Price column**: Currency format, green for cheapest
  - [ ] **Stops column**: Visual indicators
    - 0: "✈️ Nonstop"
    - 1: "✈️━✈️ 1 stop"
    - 2+: "✈️━━✈️ 2+ stops"
  - [ ] **Duration column**: Minutes → "2h 15m" format
  - [ ] **Departure/Arrival**: "14:30 JFK" format
  - [ ] **Airline column**: Logo + name (if available)
- [ ] Add sorting configuration per column
- [ ] Add column visibility defaults

### TODO 2.2: DataGrid Advanced Features
- [ ] Enable column resize & reorder
- [ ] Configure virtualized scrolling
- [ ] Add row hover states
- [ ] Implement sticky header
- [ ] Create `app/components/FlightsTable/GridToolbar.tsx`
  - [ ] Column visibility toggle
  - [ ] Export button (optional)
  - [ ] Density selector

### TODO 2.3: Grid Preferences Persistence
- [ ] Create `app/hooks/useGridPreferences.ts`
  - [ ] Save column order to localStorage
  - [ ] Save column widths to localStorage
  - [ ] Save column visibility to localStorage
  - [ ] Load preferences on mount
  - [ ] Debounce saves (500ms)

### TODO 2.4: Filter UI Components (No Logic Yet)
- [ ] Create `app/components/Filters/FilterPanel.tsx`
  - [ ] Add `"use client"` directive
  - [ ] **Stops filter**: Chip selection (0 / 1 / 2+)
  - [ ] **Airline filter**: Autocomplete multi-select
  - [ ] **Price range**: Dual-thumb slider
  - [ ] Clear all button
- [ ] Responsive layout:
  - [ ] Desktop: Collapsible sidebar
  - [ ] Mobile: Bottom drawer (MUI SwipeableDrawer)

---

## 📅 Day 3: Filter Logic + Live Chart (~5.5h)

### TODO 3.1: Filter State Management
- [ ] Create `app/hooks/useFlightsFilters.ts`
  ```typescript
  const [filters, setFilters] = useState({
    stops: [],           // [0, 1, 2]
    airlines: [],        // ['AA', 'UA']
    priceRange: [0, 10000]
  });
  ```
  - [ ] Implement `applyFilters(flights, filters)` function
  - [ ] Add debouncing (300ms) for performance
  - [ ] Memoize filtered results with `useMemo`

### TODO 3.2: Wire Filters to DataGrid
- [ ] Connect FilterPanel to useFlightsFilters hook
- [ ] Pass filtered flights to DataGrid
- [ ] Show loading overlay during filter application
- [ ] Create `app/components/Filters/FilterChips.tsx`
  - [ ] Display active filters as chips
  - [ ] Individual chip remove buttons
  - [ ] "Clear all" option

### TODO 3.3: URL Filter Synchronization
- [ ] Sync filter state to URL params
- [ ] Parse filters from URL on load
- [ ] Enable shareable filtered views

### TODO 3.4: Live Price Chart
- [ ] Create `app/components/PriceChart/InteractiveChart.tsx`
  - [ ] Add `"use client"` directive
  - [ ] Recharts AreaChart with gradient fill
  - [ ] X-axis: Price ranges or dates
  - [ ] Y-axis: Number of flights
  - [ ] Show min/max/avg price markers
  - [ ] Highlight current filter range
- [ ] Chart-filter synchronization:
  - [ ] Chart updates when filters change
  - [ ] (Enhanced) Click chart point → apply filter
- [ ] Empty chart state with message

### TODO 3.5: Flight Badges
- [ ] Compute badges per result set:
  - [ ] "Cheapest" → lowest price flight
  - [ ] "Fastest" → shortest duration flight
  - [ ] "Best Value" → price/duration heuristic
- [ ] Display as chips on flight rows

---

## 📅 Day 4: Responsive Design & Polish (~5h)

### TODO 4.1: Desktop UX Polish
- [ ] Sticky table header
- [ ] Sticky filter sidebar
- [ ] Dense layout for fast scanning
- [ ] Row hover states with quick actions
- [ ] Proper spacing and alignment

### TODO 4.2: Mobile UX
- [ ] Filters in SwipeableDrawer (bottom)
- [ ] Touch-friendly controls (larger targets)
- [ ] Collapsible price chart
- [ ] Simplified column layout
- [ ] Test on 320px, 375px, 768px widths

### TODO 4.3: Loading States
- [ ] Skeleton loaders during search
- [ ] Skeleton for filter panel
- [ ] Chart loading placeholder
- [ ] Button loading spinners

### TODO 4.4: Error States
- [ ] Inline error banners (not modals)
- [ ] Retry buttons for network errors
- [ ] "Demo mode" banner when using mock data
- [ ] Form validation error display

### TODO 4.5: Empty States
- [ ] No results: suggestions to broaden search
- [ ] No filters match: clear filters prompt
- [ ] Initial state: search prompt

### TODO 4.6: Accessibility
- [ ] Keyboard navigation for filters
- [ ] ARIA labels on all interactive elements
- [ ] Focus management in drawers/modals
- [ ] Color contrast WCAG AA compliance
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

### TODO E.4: Dark Mode
- [ ] MUI theme dark palette
- [ ] Theme toggle button
- [ ] Persist preference in localStorage

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