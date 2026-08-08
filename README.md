# Coin Compass — Currency Converter

**Coin Compass** is a playful, fast currency converter built with React and Vite. Enter an amount, pick a base currency or country, and instantly see conversions into other currencies. Toggle between **Currency** and **Country** views to explore exchange rates or compare real-world purchasing power.

## Features

- **Instant conversions** — Live exchange rates from a public, zero-config API.
- **Currency view** — Convert into a list of world currencies and add them as you go.
- **Country view** — See how much your money is worth in another country using Purchasing Power Parity (PPP) estimates.
- **Dark mode** — Comfortable viewing in light and dark themes.
- **Responsive design** — Works on desktop and mobile.

## Tech Stack

- **React 19** + **TypeScript**
- **Tailwind CSS 4** for styling
- **Vite** for development and production builds
- **Vitest** + **Testing Library** for unit tests
- **oxlint** for linting

## AI Augmentation
- [UX Pilot](https://uxpilot.ai/) - UI Design
- [Cascade](https://devin.ai/) - Coding assistance

## Getting Started

Requires [Node.js](https://nodejs.org/) (v20+ recommended).

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run the test suite
npm run test

# Run the test suite once (CI mode)
npm run test:run

# Lint the codebase
npm run lint
```

## Project Structure

```
src/
├── api/              # Exchange-rate API client
├── components/       # React UI components
├── contexts/         # React context for currency state
├── data/             # Currency, country and PPP datasets
├── App.tsx           # Root application component
└── main.tsx          # Entry point
```

## Data Sources

- **Exchange rates** — [fawazahmed0/exchange-api](https://github.com/fawazahmed0/exchange-api) via jsDelivr
- **Purchasing Power Parity (PPP)** — [World Bank ICP data](https://www.worldbank.org/en/programs/icp/data), 2021

