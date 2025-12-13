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

## Deploying Backend to Vercel (Free)

The app includes a serverless API in the `/api` folder that can be deployed to Vercel for free.

### Step-by-Step Vercel Backend Deployment

#### Step 1: Create a Free PostgreSQL Database
1. Go to [neon.tech](https://neon.tech) (free PostgreSQL)
2. Sign up and create a new project
3. Copy the connection string (DATABASE_URL)

#### Step 2: Push Code to GitHub
```bash
git add .
git commit -m "Add Vercel backend"
git push
```

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your "vibeflow-ai" repository
4. Vercel will auto-detect the configuration

#### Step 4: Add Environment Variables
In Vercel project settings → Environment Variables, add:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `SESSION_SECRET` - A random string (e.g., generate with `openssl rand -base64 32`)

#### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Vercel URL (e.g., `https://vibeflow-ai.vercel.app`)

#### Step 6: Update Mobile App Backend URL
Before building your APK, update the backend URL in the code:
1. Open `services/api.ts` and `contexts/AuthContext.tsx`
2. Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL
3. Commit and push changes
4. Rebuild APK on Codemagic

### Initialize Database Tables
After deployment, run the schema push to create tables:
```bash
npm run db:push
```

---

## Vercel Frontend + Backend (Full Deployment)
The app is configured for full Vercel deployment (both frontend and API):
1. Push code to GitHub
2. Connect the repo to Vercel
3. Vercel auto-detects the Vite configuration and API routes
4. Add environment variables: `DATABASE_URL`, `SESSION_SECRET`

## GitHub Actions (Alternative to Codemagic)
When you push code to GitHub, the APK can also be built via GitHub Actions:
1. Go to your repo's Actions tab
2. Find the "Build Android APK" workflow
3. Download the APK from the workflow artifacts

To trigger manually: Actions > Build Android APK > Run workflow
