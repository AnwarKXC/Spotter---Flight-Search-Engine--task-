# ✈️ Flight Search Engine

A modern, data-product UI flight search engine built with **Next.js 16**, **TypeScript**, **Material UI v7**, and **Recharts**. Features real-time flight data from the **Amadeus Self-Service API** with intelligent fallback to demo data.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![MUI](https://img.shields.io/badge/MUI-v7-007FFF?logo=mui)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Functionality
- 🔍 **Smart Flight Search** - Search with autocomplete for 100+ worldwide airports
- 📊 **Advanced DataGrid** - Sortable, filterable, resizable columns with virtualized scrolling
- 📈 **Interactive Price Chart** - Visual price distribution with filter synchronization
- 🔄 **Real-time Filtering** - Filter by stops, airlines, and price range
- 🏷️ **Flight Badges** - "Cheapest", "Fastest", and "Best Value" indicators

### Enhanced UX
- 🌓 **Dark/Light Mode** - System-aware with persistent preference
- 📍 **IP-Based Geolocation** - Auto-detect nearby airports
- 🌍 **Worldwide Airports** - 100+ airports grouped by region
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ♿ **Accessible** - WCAG AA compliant with full keyboard navigation

### Developer Experience
- 🎨 **Design System** - Standardized border radius and spacing tokens
- 🧩 **Component Architecture** - Clean separation of concerns
- 🔗 **Shareable URLs** - Search and filter state synced to URL
- 💾 **Persistent Preferences** - Column settings saved to localStorage

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.x or later (or pnpm/yarn)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sportAI-task
   ```

2. **Create environment file**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Amadeus API Credentials (required for live flight data)
   AMADEUS_CLIENT_ID=your_amadeus_client_id
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
   
   # Optional: Set to 'production' for live API
   AMADEUS_ENV=test
   ```

   > 📝 **Get API Keys**: Sign up at [Amadeus for Developers](https://developers.amadeus.com/) to get your free API credentials. The test environment includes 10 req/sec and 1000 requests/month.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/
├── page.tsx                    # Main flights page (Server Component)
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles + scrollbar theming
│
├── lib/
│   ├── amadeus.ts              # Amadeus API client (server-side only)
│   ├── mockData.ts             # Fallback demo flight data
│   └── airports.ts             # Worldwide airports database
│
├── components/
│   ├── Header/
│   │   └── Header.tsx          # App header with dark mode toggle
│   │
│   ├── SearchForm/
│   │   └── SearchForm.tsx      # Flight search form with validation
│   │
│   ├── FlightsTable/
│   │   ├── FlightsDataGrid.tsx # MUI X DataGrid with custom columns
│   │   ├── columns.tsx         # Column definitions & renderers
│   │   ├── GridToolbar.tsx     # Custom toolbar with export
│   │   └── GridEmptyState.tsx  # Empty state component
│   │
│   ├── Filters/
│   │   ├── FilterPanel.tsx     # Sidebar filter controls
│   │   └── FilterChips.tsx     # Active filter display
│   │
│   └── PriceChart/
│       └── InteractiveChart.tsx # Recharts price visualization
│
├── hooks/
│   ├── useFlightsSearch.ts     # Search state & API integration
│   ├── useFlightsFilters.ts    # Filter state management
│   ├── useGridPreferences.ts   # Column preferences persistence
│   └── useApiErrorHandling.ts  # Error handling with retry
│
└── theme/
    └── ThemeContext.tsx        # MUI theme + dark mode provider
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start with Turbopack (fast refresh)
npm run dev:legacy   # Start without Turbopack

# Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

---

## 🎨 Design System

### Border Radius Tokens
```typescript
const BORDER_RADIUS = {
  small: 8,      // Chips, autocomplete options
  medium: 12,    // Inputs, buttons, cards
  large: 16,     // Large cards, modals
}
```

### Theme Colors
- **Primary**: MUI Blue (#1976d2)
- **Background (Light)**: #f8fafc
- **Background (Dark)**: #121212
- **DataGrid**: Full dark mode support

---

## 🔌 API Integration

### Amadeus Self-Service API

The app uses Amadeus Flight Offers Search API for real-time flight data.

**Rate Limits (Test Environment)**:
- 10 requests/second
- 1,000 requests/month

**Fallback Behavior**:
When the API is unavailable or rate-limited, the app automatically falls back to demo data with a visible "Demo Mode" indicator.

### Error Handling
| Status | Message | Action |
|--------|---------|--------|
| 429 | API quota exceeded | Show cached/demo results |
| Network Error | Connection failed | Retry with exponential backoff |
| Invalid Params | Adjust search criteria | Form validation error |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 600px | Stacked, drawer filters |
| Tablet | 600-900px | Compact grid, collapsible chart |
| Desktop | > 900px | Full grid with sidebar filters |

---

## 🧪 Development Notes

### Client vs Server Components
- **Server Components**: API calls in `app/lib/` (credentials secure)
- **Client Components**: All MUI components require `"use client"`

### State Management
```
URL Params → Search criteria (shareable links)
React State → Filters (debounced 300ms)
localStorage → Theme & column preferences
```

### Hydration Safety
Uses `useSyncExternalStore` for localStorage access to prevent hydration mismatches.

---

## 📋 Roadmap

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the complete development roadmap and task tracking.

### Completed ✅
- [x] Amadeus API integration with fallback
- [x] MUI DataGrid with custom renderers
- [x] Advanced filtering (stops, airlines, price)
- [x] Interactive price chart
- [x] Dark/Light mode with persistence
- [x] IP-based geolocation
- [x] 100+ worldwide airports
- [x] Responsive design
- [x] Accessibility (WCAG AA)

### Planned 📋
- [ ] Flight comparison mode
- [ ] Column presets
- [ ] Advanced chart interactions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Amadeus for Developers](https://developers.amadeus.com/) - Flight data API
- [Material UI](https://mui.com/) - React component library
- [Recharts](https://recharts.org/) - Charting library
- [Next.js](https://nextjs.org/) - React framework
