import { YOUTUBE_API_KEY } from '../../config/youtube';
import { extractYouTubePlaylistId } from '../firebase/continueLearningPlaylistsService';
import type { YouTubePlaylistVideo } from '../../store/content/types/youtubePlaylist.types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const PLAYLIST_RSS_BASE =
  'https://www.youtube.com/feeds/videos.xml?playlist_id=';

type YouTubeApiPlaylistItem = {
  snippet?: {
    title?: string;
    position?: number;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  contentDetails?: {
    videoId?: string;
  };
};

type YouTubeApiPlaylistItemsResponse = {
  items?: YouTubeApiPlaylistItem[];
  nextPageToken?: string;
  error?: { message?: string };
};

function thumbnailForVideo(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function mapApiItem(
  item: YouTubeApiPlaylistItem,
  index: number,
): YouTubePlaylistVideo | null {
  const videoId = item.contentDetails?.videoId?.trim();
  if (!videoId) {
    return null;
  }

  const title = item.snippet?.title?.trim() || 'Untitled video';
  const position =
    typeof item.snippet?.position === 'number'
      ? item.snippet.position
      : index;
  const thumbnailUrl =
    item.snippet?.thumbnails?.medium?.url ??
    item.snippet?.thumbnails?.default?.url ??
    thumbnailForVideo(videoId);

  return { videoId, title, thumbnailUrl, position };
}

async function fetchPlaylistVideosFromApi(
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> {
  const videos: YouTubePlaylistVideo[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: '50',
      key: YOUTUBE_API_KEY,
    });
    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`,
    );
    const data = (await response.json()) as YouTubeApiPlaylistItemsResponse;

    if (!response.ok) {
      throw new Error(
        data.error?.message ?? 'Could not load course lessons.',
      );
    }

    const batch =
      data.items
        ?.map((item, index) => mapApiItem(item, videos.length + index))
        .filter((item): item is YouTubePlaylistVideo => item != null) ?? [];

    videos.push(...batch);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos.sort((a, b) => a.position - b.position);
}

async function fetchPlaylistVideosFromRss(
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> {
  const response = await fetch(`${PLAYLIST_RSS_BASE}${playlistId}`);
  if (!response.ok) {
    throw new Error('Could not load course lessons.');
  }

  const xml = await response.text();
  const entryBlocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: YouTubePlaylistVideo[] = [];

  entryBlocks.forEach((entry, index) => {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const videoId = videoIdMatch?.[1]?.trim();
    if (!videoId) {
      return;
    }

    videos.push({
      videoId,
      title: titleMatch?.[1]?.trim() || 'Untitled video',
      thumbnailUrl: thumbnailForVideo(videoId),
      position: index,
    });
  });

  return videos;
}

export async function fetchYouTubePlaylistVideos(
  playlistUrl: string,
): Promise<YouTubePlaylistVideo[]> {
  const playlistId = extractYouTubePlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error('Invalid course link.');
  }

  // Prefer the official API when configured, but fall back gracefully:
  // quota limits, key restrictions, and regional blocks can break API calls.
  if (YOUTUBE_API_KEY.trim()) {
    try {
      return await fetchPlaylistVideosFromApi(playlistId);
    } catch {
      // Fallback RSS is public and often still works even when API fails.
      return fetchPlaylistVideosFromRss(playlistId);
    }
  }

  return fetchPlaylistVideosFromRss(playlistId);
}
