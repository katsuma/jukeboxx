/**
 * Function to fetch YouTube video information
 *
 * Uses YouTube Data API v3 to retrieve video information.
 */
export async function fetchYouTubeVideoInfo(videoId: string): Promise<{
  title: string;
  thumbnail: string;
}> {
  try {
    // Fetch video information using YouTube Data API v3
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Extract information from API response
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        thumbnail: snippet.thumbnails.default.url
      };
    }

    // Return default values if video is not found
    throw new Error('Video information not found');
  } catch (error) {
    console.error('Failed to fetch YouTube video information:', error);
    // Return default values on error
    return {
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
  }
}
