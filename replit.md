# Focus Tracker

A React-based focus and productivity tracking application with support for Hebrew (RTL) and English languages.

## Overview

This is a focus tracking web application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theming
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Animations**: Framer Motion
- **Backend**: Supabase (optional - app has demo mode)
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI primitives (button, card, input, etc.)
│   ├── auth/          # Authentication-related components
│   ├── dashboard/     # Dashboard components
│   └── vision/        # Vision board components
├── contexts/          # React contexts (Auth, Language)
├── hooks/             # Custom React hooks
├── integrations/      # External service integrations (Supabase)
├── lib/               # Utility functions
├── pages/             # Page components
│   └── setup/         # Onboarding flow pages
└── types/             # TypeScript type definitions
```

## Development

### Running Locally
```bash
npm run dev
```

The app runs on port 5000 with host 0.0.0.0.

### Building for Production
```bash
npm run build
```

Output is generated in the `dist/` directory.

## Configuration

### Supabase (Optional)
If you want to use real authentication and data persistence, set these environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Without these, the app runs in demo mode with a mock user.

## Features

- Multi-language support (Hebrew RTL, English LTR)
- User onboarding questionnaire
- Vision board creation
- Focus area selection and tracking
- Weekly check-ins
- 360° feedback requests
- Dashboard with progress tracking

## Recent Changes

- Configured Vite for Replit environment (port 5000, allowedHosts: true)
- Set up development workflow

## User Preferences

(None recorded yet)
