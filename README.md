# Ygritte's Picky Picks

A Next.js application for tracking cat food preferences, inventory, and meal logs.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nbbaiers-projects/v0-cat-food-tracker)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dycOOl7Q0rF)

## Features

- Track different cat food brands and types
- Record preferences (likes, dislikes, unknown)
- Manage inventory quantities and archive foods
- Add notes about specific foods
- Filter foods by preference and inventory status
- Search through food notes
- Sort foods by name, preference, inventory, or date added
- Toggle between card and table view modes
- Log meals (morning/evening) with specific foods and amounts
- Track meal history with dates and notes

## Technology Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives with custom components
- **Package Manager**: Bun
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Bun package manager
- PostgreSQL database (via Supabase)
- Environment variables configured

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build
```

### Environment Variables

Create a `.env.local` file with the following:

```
DATABASE_URL=your_database_url
```

### Common Commands

```bash
# Development
bun run dev

# Production
bun run build
bun run start

# Code Quality
bun run lint       # Check code
bun run format     # Format code
bun run check      # Check all
bun run check:fix  # Fix all

# Database
bun run db:generate  # Generate migrations
bun run db:push      # Push schema to database
```

## Project Structure

```
/
├── app/              # Next.js app router
│   ├── api/         # API routes (foods, meals)
│   ├── meals/       # Meals tracking page
│   └── page.tsx     # Home page (foods list)
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...          # Feature components
├── lib/
│   ├── db/          # Database schema and client
│   └── utils.ts     # Utility functions
└── supabase/
    └── migrations/  # Database migrations
```

## Database Schema

### Foods Table

- name, notes, preference (likes/dislikes/unknown)
- inventory_quantity, archived
- Timestamps: created_at, updated_at

### Meals Table

- meal_date, meal_time (morning/evening)
- food_id (foreign key), amount, notes
- Unique constraint on (meal_date, meal_time, food_id)
- Timestamps: created_at, updated_at

## v0.app Integration

_Automatically synced with your [v0.app](https://v0.app) deployments_

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app). Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

### How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

### Continue Building

**[https://v0.app/chat/dycOOl7Q0rF](https://v0.app/chat/dycOOl7Q0rF)**
