# Jukeboxx

[![Lint & Type Check](https://github.com/katsuma/jukeboxx/actions/workflows/lint.yml/badge.svg)](https://github.com/katsuma/jukeboxx/actions/workflows/lint.yml)

A jukebox application that manages and plays YouTube videos in a queue.

## Features

- 🎵 Add YouTube videos to a queue for continuous playback
- 🎬 Create multiple queues for different events or occasions
- 🔗 Share queue URLs with friends to collaborate on playlists
- 🔄 Real-time synchronization using Firebase Realtime Database
- 📱 Share queue and playback status across multiple devices
- 📋 Playback history management
- 🎨 Modern UI with dark mode support

## How to Use

1. Create a new queue with a custom name
2. Share the queue URL with friends
3. Enter a YouTube URL to add it to the queue
4. Videos will play automatically in sequence
5. Everyone with the link can add songs and enjoy the music together

## Development Setup

### Required Environment Variables

Set the following environment variables in your `.env` file:

```
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

The `VITE_YOUTUBE_API_KEY` is required for fetching video information from the YouTube Data API. You can obtain this key from the [Google Cloud Console](https://console.cloud.google.com/) by creating a project and enabling the YouTube Data API v3.

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run TypeScript type checking
npm run typecheck
```

### Git Hooks

This project uses [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to run linting and type checking before each commit.

- All staged `.js`, `.jsx`, `.ts`, and `.tsx` files will be automatically linted and type-checked when you commit
- If there are any linting errors or type errors, the commit will be aborted
- This ensures that only code that passes quality checks is committed

To set up the git hooks after cloning the repository:

```bash
npm install
```

The `prepare` script will automatically set up husky.

## Build

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

A YouTube jukebox application powered by Firebase Realtime Database
