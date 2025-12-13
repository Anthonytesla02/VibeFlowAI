# VibeFlow AI

## Overview
VibeFlow AI is a React + TypeScript music application with user authentication, song library management, and YouTube audio extraction. Uses Google Gemini AI service and stores all user data in a PostgreSQL database.

## Project Structure
- `/components/` - React components (Layout, Player)
- `/contexts/` - React context providers (AudioContext, AuthContext)
- `/pages/` - Page components (Home, Library, Login, Signup)
- `/services/` - API and service files (api.ts, geminiService.ts)
- `/server/` - Backend Express server (index.ts, db.ts, storage.ts, youtube.ts)
- `/shared/` - Shared schema definitions (schema.ts)
- `/android/` - Capacitor Android project
- `/uploads/audio/` - Uploaded audio files
- `App.tsx` - Main application component
- `index.tsx` - Application entry point
- `types.ts` - TypeScript type definitions
- `capacitor.config.ts` - Capacitor configuration
- `codemagic.yaml` - Codemagic CI/CD configuration

## Tech Stack
- React 19 with TypeScript
- Vite for build/dev
- Express.js backend (port 3001)
- PostgreSQL database with Drizzle ORM
- bcryptjs for password hashing
- Session-based authentication
- Lucide React for icons
- Google Gemini AI integration
- Capacitor 6.1.2 for Android mobile app

## Database
The app uses PostgreSQL (Neon-backed) for storing:
- **Users**: id, email, password (hashed), displayName, createdAt
- **Songs**: id, userId, title, artist, album, coverUrl, audioPath, duration, isFavorite, genre, sourceType, sourceUrl
- **Sessions**: Managed by connect-pg-simple

### Database Commands
- Push schema: `npm run db:push`

## Development
- Run: `npm run dev` (frontend on port 5000, backend on port 3001)
- Build: `npm run build`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption key
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)

---

## Building Android APK with Codemagic.io

### Step-by-Step Instructions

#### Step 1: Push Code to GitHub
1. Create a new GitHub repository
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vibeflow-ai.git
   git push -u origin main
   ```

#### Step 2: Sign Up for Codemagic
1. Go to [codemagic.io](https://codemagic.io)
2. Click "Start building for free"
3. Sign up with GitHub (recommended for easy integration)

#### Step 3: Add Your Project
1. In Codemagic dashboard, click "Add application"
2. Select "GitHub" as your Git provider
3. Authorize Codemagic to access your repositories
4. Find and select your "vibeflow-ai" repository
5. Click "Add application"

#### Step 4: Configure the Project
1. Select "Capacitor" as the project type
2. Choose "Use codemagic.yaml" (the config file is already in your project)
3. Click "Save"

#### Step 5: Start Your First Build
1. Click "Start new build"
2. Select the "android-workflow" workflow
3. Select your branch (usually "main")
4. Click "Start new build"

#### Step 6: Download Your APK
1. Wait for the build to complete (usually 5-10 minutes)
2. Once successful, find the "Artifacts" section
3. Download the APK files:
   - `app-debug.apk` - For testing
   - `app-release-unsigned.apk` - For production (needs signing)

### For Signed Release APK (Play Store Ready)

To create a signed APK for the Google Play Store:

1. **Generate a Keystore** (do this once):
   ```bash
   keytool -genkey -v -keystore vibeflow-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vibeflow
   ```

2. **Add Signing Config in Codemagic**:
   - Go to your app settings in Codemagic
   - Navigate to "Code signing" > "Android"
   - Upload your keystore file
   - Enter keystore password, key alias, and key password

3. **Update codemagic.yaml** with signing:
   ```yaml
   scripts:
     - name: Build signed APK
       script: |
         cd android
         ./gradlew assembleRelease
   ```

### Automatic Builds
The `codemagic.yaml` file is configured to build APKs automatically. You can also:
- Enable automatic builds on every push in Codemagic settings
- Set up webhooks for specific branches
- Configure build triggers

### Troubleshooting
- **Build fails at npm install**: Check that package-lock.json is committed
- **Gradle errors**: Ensure Java 17 is specified in codemagic.yaml
- **Capacitor sync fails**: Run `npm run build` locally first to verify

---

## Vercel Deployment
The app is configured for Vercel deployment:
1. Push code to GitHub
2. Connect the repo to Vercel
3. Vercel auto-detects the Vite configuration
4. Environment variables: Add `DATABASE_URL` and `GEMINI_API_KEY` in Vercel dashboard

## GitHub Actions (Alternative to Codemagic)
When you push code to GitHub, the APK can also be built via GitHub Actions:
1. Go to your repo's Actions tab
2. Find the "Build Android APK" workflow
3. Download the APK from the workflow artifacts

To trigger manually: Actions > Build Android APK > Run workflow
