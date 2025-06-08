# CLAUDE.md - Jukeboxx Project Overview

## Project Overview
Jukeboxx is a jukebox application that allows sharing YouTube video playlists. Multiple users can access the same queue and collaborate to create and manage playlists.

## Architecture
- **Frontend**: React Router v7 + TypeScript + Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Build System**: Vite
- **External API**: YouTube Data API v3 (for video information)

## Key Features
- Add YouTube video URLs to queue
- Real-time queue synchronization (Firebase)
- Share playback status across multiple devices
- Playback history management
- Queue creation, deletion, and clearing
- Dark mode support
- Responsive design

## Project Structure
```
app/
├── components/         # UI Components
│   ├── AddToQueueForm.tsx    # Video addition form
│   ├── Footer.tsx            # Footer component
│   ├── Header.tsx            # Header component
│   ├── PlaylistQueue.tsx     # Playlist queue display
│   └── YouTubePlayer.tsx     # YouTube video player
├── contexts/
│   └── PlaylistContext.tsx   # Playlist state management
├── routes/
│   ├── index.tsx            # Homepage (queue creation)
│   └── queue.tsx            # Queue display/management page
├── utils/
│   ├── firebase.ts          # Firebase configuration/operations
│   ├── youtube-api.ts       # YouTube API operations
│   └── youtube.ts           # YouTube URL parsing
├── app.css                  # Global styles
├── root.tsx                 # Application root
└── routes.ts                # Routing configuration
```

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues

## Environment Variables
The following environment variables must be set in your `.env` file:
```
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Pre-Pull Request Checklist
**Important**: Before creating a PR, make sure to run the following commands and confirm there are no issues:

1. **Lint Check**: `npm run lint`
   - Ensure there are no ESLint errors
   - Use `npm run lint:fix` for automatic fixes if errors exist

2. **Build Check**: `npm run build`
   - Ensure there are no TypeScript type errors
   - Confirm the build completes successfully

3. **Documentation Update**: Consider whether this CLAUDE.md file needs updates
   - If your changes introduce new features, modify project structure, or change development workflows
   - Update relevant sections to keep documentation current and accurate

If any of these checks fail, fix the errors before creating the PR.

## Technical Specifications
- **React Router v7**: Full-stack React framework with SSR support
- **Firebase Realtime Database**: Real-time synchronization
- **YouTube Data API v3**: Video metadata retrieval
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **ESLint + Husky**: Code quality management

## Key Components
- **PlaylistContext**: Overall playlist state management (queue, currently playing, history)
- **firebaseDB**: Abstraction layer for Firebase operations
- **YouTubePlayer**: Video player using react-youtube
- **AddToQueueForm**: YouTube URL input and validation

## Data Flow
1. User inputs YouTube URL
2. Fetch video information via YouTube API
3. Add queue item to Firebase Realtime Database
4. Real-time listeners detect changes
5. Instantly sync to other connected devices

## Notes
- Falls back to local state management if Firebase environment variables are not configured
- Avoid excessive requests due to YouTube API limitations
- Git hooks (husky + lint-staged) automatically run lint before commits