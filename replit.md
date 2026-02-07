# Focus Tracker

A React-based focus and productivity tracking application with support for Hebrew (RTL) and English languages.

## Overview

This is a focus tracking web application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theming
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Animations**: Framer Motion
- **Backend**: Express + PostgreSQL (Replit DB)
- **Authentication**: Email/password with session management (no email verification)
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
├── index.ts           # Express API for AI coach + auth endpoints
├── db.ts              # PostgreSQL database connection
└── auth.ts            # Authentication routes (register, login, logout, forgot password)
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

### Database
The app uses Replit's built-in PostgreSQL database. Environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Session Management
- `SESSION_SECRET` - (Optional) Custom session secret for production. Defaults to a development secret.

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

1. Login/Register → 2. **Management Compass** (9-step assessment) → 3. **Intro Video** → 4. Future Vision (with AI interview) → 5. **Intro Rocks Video** → 6. **Big Rocks Agent** (AI extracts rocks from vision) → 7. Focus Area (Big Rocks editing) → 8. **Execution Stakeholders** → 9. **Keystone & Success** → 10. **30 Day Plan** → Dashboard

### Execution Plan Flow (from "Create New Plan" or after Focus Area)
Deterministic UI flow (no AI) for converting big rocks into actionable plans:
1. **Execution Stakeholders** (`/setup/execution-stakeholders`) - Add people with roles (Partner/Approver/FYI), ask text, message generator with copy, status tracking
2. **Keystone & Success** (`/setup/keystone-success`) - Keystone habit (trigger + action, 5 min fixed) + measurable success metric
3. **30 Day Plan** (`/setup/thirty-day-plan`) - Schedule practices: frequency (1-7/week), duration (15/30/45/60 min), time window (morning/afternoon/evening), energy meter, auto-schedule calendar view
Data stored in localStorage: `execution-stakeholders`, `execution-plan`, `keystone-success`

### Management Compass Steps (מצפן הניהול)
The Management Compass is a 10-step assessment that runs without email/password:
1. Welcome Screen
2. Introduction (name + gender preference)
3. Questionnaire Intro
4. Card Game (sort ALL 5 cards into "describes me" vs "doesn't describe me" - 5 categories)
5. Card Game Summary
6. Focus Control (anchor score + time drain)
7. Decisions Price (immediate/long-term)
8. Interfaces Map (9-step journey)
9. Coaching (7 layers)
10. Team Health (Lencioni 5 dysfunctions)
11. Module Selection + Dashboard

Data persists in localStorage with 7-day expiry.

## Recent Changes

- **Added Email/Password Authentication**:
  - PostgreSQL database for user storage
  - Registration with email, password, name, and gender preference
  - Login with email/password
  - Session-based authentication (30-day sessions)
  - Forgot password with reset token (no email verification - token shown directly)
  - Hebrew RTL auth page
  
- **Updated Management Compass Flow**:
  - Added Introduction step (name + gender collection)
  - Added Questionnaire Intro step explaining the assessment
  - Removed Time & Energy step (4 quadrants)
  - All steps now work with mobile-friendly tap buttons

- **Integrated Management Compass** (מצפן הניהול):
  - 11-step management assessment imported from leadtheway project
  - Runs as first step after authentication
  - Card games, focus control, decision pricing
  - Interface mapping, coaching evaluation, team health assessment
  - Module selection with full/light depth calculation
  - localStorage persistence with 7-day expiry
  - Hebrew RTL interface with Milestone branding

- Added AI coach features using Replit AI Integrations (OpenAI):
  - IntroVideo page with YouTube embed between Compass and FutureVision
  - AI reflection feature after completing Future Vision
  - AI rock clarifier for Big Rocks wording validation
  
- Created Express backend server for coach API endpoints:
  - `/api/auth/register` - User registration
  - `/api/auth/login` - User login
  - `/api/auth/logout` - User logout
  - `/api/auth/user` - Get current user
  - `/api/auth/forgot-password` - Request password reset
  - `/api/auth/reset-password` - Reset password with token
  - `/api/coach/reflect` - Vision reflection
  - `/api/coach/clarify-rock` - Big Rocks validation
  - `/api/coach/extract-rocks` - AI agent that extracts big rocks from vision text
  - `/api/vision/chat` - Interactive vision interview

- Configured Vite proxy for API requests
- Configured Vite for Replit environment (port 5000, allowedHosts: true)
- Set up dual workflow: Frontend (port 5000) + Coach API (port 3001)

## Workflows

- **Frontend**: `npm run dev` - Vite dev server on port 5000
- **Coach API**: `npx tsx server/index.ts` - Express API on port 3001

## User Preferences

(None recorded yet)
