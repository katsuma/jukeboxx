/**
 * Extract video ID from YouTube URL
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Create and parse URL object
  let videoId: string | null = null;
  const allowedViewerHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // youtube.com/watch?v=VIDEO_ID format
    if (allowedViewerHosts.includes(hostname) && pathname === '/watch') {
      videoId = searchParams.get('v');
    }
    // youtu.be/VIDEO_ID format
    else if (hostname === 'youtu.be') {
      videoId = pathname.substring(1);
    }
    // youtube.com/embed/VIDEO_ID format
    else if (allowedViewerHosts.includes(hostname) && pathname.startsWith('/embed/')) {
      videoId = pathname.split('/embed/')[1];
    }

    return videoId;
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return null;
  }
}

/**
 * Check if a YouTube URL is valid
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
