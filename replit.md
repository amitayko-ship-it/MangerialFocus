# Focus Tracker

A React-based focus and productivity tracking application with support for Hebrew (RTL) and English languages.

## Overview

This is a focus tracking web application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theming
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Animations**: Framer Motion
- **Backend**: Supabase (optional - app has demo mode)
- **AI Coach**: OpenAI via Replit AI Integrations (gpt-5-mini)
- **Coach API**: Express server (port 3001)
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI primitives (button, card, input, etc.)
│   ├── auth/          # Authentication-related components
│   ├── clarity/       # Big rocks and focus components
│   ├── dashboard/     # Dashboard components
│   ├── management-compass/  # Management Compass assessment components
│   │   └── layout/    # Header/Footer for compass section
│   └── vision/        # Vision board components
├── contexts/          # React contexts (Auth, Language)
├── hooks/             # Custom React hooks
│   └── useCoachAgent.ts  # AI coach agent hook
├── integrations/      # External service integrations (Supabase)
├── lib/               # Utility functions
├── pages/             # Page components
│   ├── ManagementCompass.tsx # Management assessment (first step)
│   ├── IntroVideo.tsx # YouTube intro before FutureVision
│   └── setup/         # Onboarding flow pages
└── types/             # TypeScript type definitions

server/
└── index.ts           # Express API for AI coach endpoints
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
- **AI Coach Integration**:
  - Intro video page (YouTube embed) before Future Vision
  - **Interactive AI Vision Interview**: GPT-powered conversational agent that guides users through building their 2030 Vision Board
    - Narrative Harvest - sensory, specific questions about future vision
    - Auto-Clustering - extracts life domains ("Tiles")
    - Operational Hardening - converts dreams to measurable actions
    - Outputs: Narrative essay + structured Vision Board tiles
  - GPT-powered reflection on user's success vision
  - GPT-powered clarifier for Big Rocks wording check
- Vision board creation
- Focus area selection and tracking
- Weekly check-ins
- 360° feedback requests
- Dashboard with progress tracking

## Onboarding Flow

1. Login/Signup → 2. **Management Compass** (10-step assessment) → 3. **Intro Video** → 4. Future Vision (with AI interview) → 5. **Intro Rocks Video** → 6. Focus Area (Big Rocks with AI check) → 7. Tasks Energy → 8. Stakeholders → 9. Summary → Dashboard

### Management Compass Steps (מצפן הניהול)
The Management Compass is a 10-step assessment that runs without email/password:
1. Welcome Screen
2. Card Game (sort ALL 5 cards into "describes me" vs "doesn't describe me" - 5 categories)
3. Card Game Summary
4. Focus Control (anchor score + time drain)
5. Time & Energy (4 quadrants + breathing space)
6. Decisions Price (immediate/long-term)
7. Interfaces Map (9-step journey)
8. Coaching (7 layers)
9. Team Health (Lencioni 5 dysfunctions)
10. Module Selection + Dashboard

Data persists in localStorage with 7-day expiry.

## Recent Changes

- **Integrated Management Compass** (מצפן הניהול):
  - 10-step management assessment imported from leadtheway project
  - Runs as first step in onboarding (no email/password required)
  - Card games, focus control, time/energy analysis, decision pricing
  - Interface mapping, coaching evaluation, team health assessment
  - Module selection with full/light depth calculation
  - localStorage persistence with 7-day expiry
  - Hebrew RTL interface with Milestone branding
- Added AI coach features using Replit AI Integrations (OpenAI):
  - IntroVideo page with YouTube embed between Questionnaire and FutureVision
  - AI reflection feature after completing Future Vision
  - AI rock clarifier for Big Rocks wording validation
- Created Express backend server for coach API endpoints:
  - `/api/coach/reflect` - Vision reflection
  - `/api/coach/clarify-rock` - Big Rocks validation
  - `/api/vision/chat` - Interactive vision interview with multi-phase system prompt
- Added useCoachAgent hook for frontend AI calls
- Configured Vite proxy for API requests
- Configured Vite for Replit environment (port 5000, allowedHosts: true)
- Set up dual workflow: Frontend (port 5000) + Coach API (port 3001)

## Workflows

- **Frontend**: `npm run dev` - Vite dev server on port 5000
- **Coach API**: `npx tsx server/index.ts` - Express API on port 3001

## User Preferences

(None recorded yet)
