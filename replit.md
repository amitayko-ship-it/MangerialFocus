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
│   └── vision/        # Vision board components
├── contexts/          # React contexts (Auth, Language)
├── hooks/             # Custom React hooks
│   └── useCoachAgent.ts  # AI coach agent hook
├── integrations/      # External service integrations (Supabase)
├── lib/               # Utility functions
├── pages/             # Page components
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
    - Phase 1: Personalization (name + gender)
    - Phase 2: Narrative Harvest - sensory, specific questions about future vision
    - Phase 3: Auto-Clustering - extracts life domains ("Tiles")
    - Phase 4: Operational Hardening - converts dreams to measurable actions
    - Outputs: Narrative essay + structured Vision Board tiles
  - GPT-powered reflection on user's success vision
  - GPT-powered clarifier for Big Rocks wording check
- Vision board creation
- Focus area selection and tracking
- Weekly check-ins
- 360° feedback requests
- Dashboard with progress tracking

## Onboarding Flow

1. Login/Signup → 2. Questionnaire → 3. **Intro Video** → 4. Future Vision (with AI reflection) → 5. Focus Area (Big Rocks with AI check) → 6. Tasks Energy → 7. Stakeholders → 8. Summary → Dashboard

## Recent Changes

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
