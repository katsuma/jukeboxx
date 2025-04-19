# YouTube Jukebox

A jukebox application that manages and plays YouTube videos in a queue.

## Features

- 🎵 Add YouTube videos to a queue for continuous playback
- 🔄 Real-time synchronization using Firebase Realtime Database
- 📱 Share queue and playback status across multiple devices
- 📋 Playback history management
- 🎨 Modern UI with dark mode support


## How to Use

1. Enter a YouTube URL to add it to the queue
2. Videos will play automatically in sequence
3. Access from multiple devices to share the same queue and playback status

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

## Build

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

A YouTube jukebox application powered by Firebase Realtime Database
