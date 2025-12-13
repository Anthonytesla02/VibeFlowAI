# VibeFlow AI

## Overview
VibeFlow AI is a React + TypeScript music application that uses the Google Gemini AI service.

## Project Structure
- `/components/` - React components (Layout, Player)
- `/contexts/` - React context providers (AudioContext)
- `/pages/` - Page components (Home, Library)
- `/services/` - API and service files (api.ts, db.ts, geminiService.ts)
- `/android/` - Capacitor Android project
- `App.tsx` - Main application component
- `index.tsx` - Application entry point
- `types.ts` - TypeScript type definitions
- `capacitor.config.ts` - Capacitor configuration

## Tech Stack
- React 19 with TypeScript
- Vite for build/dev
- Lucide React for icons
- Google Gemini AI integration
- Capacitor for Android mobile app

## Development
- Run: `npm run dev` (port 5000)
- Build: `npm run build`

## Vercel Deployment
The app is configured for Vercel deployment:
1. Push code to GitHub
2. Connect the repo to Vercel
3. Vercel auto-detects the Vite configuration
4. Environment variables: Add `GEMINI_API_KEY` in Vercel dashboard

## Android APK Build (via GitHub Actions)
When you push code to GitHub, the APK is built automatically:
1. Go to your repo's Actions tab
2. Find the "Build Android APK" workflow
3. Download the APK from the workflow artifacts

To trigger manually: Actions > Build Android APK > Run workflow

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
