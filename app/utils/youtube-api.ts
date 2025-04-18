/**
 * YouTubeの動画情報を取得する関数
 *
 * YouTube Data API v3を使用して動画情報を取得します。
 */
export async function fetchYouTubeVideoInfo(videoId: string): Promise<{
  title: string;
  thumbnail: string;
}> {
  try {
    // YouTube Data API v3を使用して動画情報を取得
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // APIレスポンスから情報を抽出
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        thumbnail: snippet.thumbnails.default.url
      };
    }

    // 動画が見つからない場合はデフォルト値を返す
    throw new Error('動画情報が見つかりませんでした');
  } catch (error) {
    console.error('YouTubeの動画情報の取得に失敗しました:', error);
    // エラー時はデフォルト値を返す
    return {
      title: `動画 ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
  }
}
