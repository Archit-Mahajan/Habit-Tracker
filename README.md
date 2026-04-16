A modern habit and goal tracking web app built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Create, update, complete, and delete habits
- Track daily completions, streaks, and total completions
- Goal management with milestones and progress tracking
- Dashboard with:
  - Stats overview
  - Activity heatmap
  - Weekly/monthly analytics charts
  - Weekly and monthly review views
- Gamification with XP and leveling
- Light/dark/system theme support
- Local persistence using `localStorage`

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
src/
  components/    # UI and feature components
  context/       # Habit and theme state providers
  hooks/         # Reusable hooks
  lib/           # Utilities
  types/         # TypeScript types
```

## Notes

- Habit and goal data are stored in browser `localStorage` under `habitTrackerState`.
- Theme preference is stored under `theme`.

