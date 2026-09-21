import { YOUTUBE_API_KEY } from '../../config/youtube';
import { extractYouTubePlaylistId } from '../firebase/continueLearningPlaylistsService';
import type { YouTubePlaylistVideo } from '../../store/content/types/youtubePlaylist.types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const PLAYLIST_RSS_BASE =
  'https://www.youtube.com/feeds/videos.xml?playlist_id=';
const INNERTUBE_BROWSE_URL =
  'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false';
const INNERTUBE_CLIENT = {
  clientName: 'WEB',
  clientVersion: '2.20250918.01.00',
  hl: 'en',
  gl: 'US',
};
const MAX_INNERTUBE_PAGES = 20;
const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/;

const YOUTUBE_FETCH_HEADERS = {
  Accept: 'application/json, application/atom+xml, application/xml, text/xml',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
};

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

type InnertubeCollectResult = {
  videos: YouTubePlaylistVideo[];
  continuationTokens: string[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function titleFromInnertubeNode(node: unknown): string | null {
  if (!isRecord(node)) {
    return null;
  }

  const simple = readString(node.simpleText);
  if (simple) {
    return simple;
  }

  const content = readString(node.content);
  if (content) {
    return content;
  }

  if (Array.isArray(node.runs)) {
    const joined = node.runs
      .map(run => (isRecord(run) ? readString(run.text) : null))
      .filter((text): text is string => text != null)
      .join('');
    if (joined.trim()) {
      return joined.trim();
    }
  }

  return null;
}

function videoFromLockup(lockup: Record<string, unknown>): YouTubePlaylistVideo | null {
  const videoId = readString(lockup.contentId);
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  const metadata = isRecord(lockup.metadata)
    ? lockup.metadata.lockupMetadataViewModel
    : undefined;
  const titleNode = isRecord(metadata) ? metadata.title : undefined;
  const title = titleFromInnertubeNode(titleNode) || 'Untitled video';

  return {
    videoId,
    title,
    thumbnailUrl: thumbnailForVideo(videoId),
    position: 0,
  };
}

function videoFromPlaylistRenderer(
  renderer: Record<string, unknown>,
): YouTubePlaylistVideo | null {
  const videoId = readString(renderer.videoId);
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  const title = titleFromInnertubeNode(renderer.title) || 'Untitled video';
  const index =
    typeof renderer.index === 'number'
      ? renderer.index
      : typeof renderer.index === 'string' && /^\d+$/.test(renderer.index)
        ? Number(renderer.index)
        : 0;

  return {
    videoId,
    title,
    thumbnailUrl: thumbnailForVideo(videoId),
    position: index,
  };
}

function continuationTokenFromRenderer(renderer: unknown): string | null {
  if (!isRecord(renderer)) {
    return null;
  }

  const endpoint = isRecord(renderer.continuationEndpoint)
    ? renderer.continuationEndpoint
    : renderer;
  const command = isRecord(endpoint) ? endpoint.continuationCommand : undefined;
  return isRecord(command) ? readString(command.token) : null;
}

/** Pulls videos + continuation tokens from a YouTube innertube browse payload. */
export function collectYouTubeInnertubePlaylist(
  payload: unknown,
): InnertubeCollectResult {
  const videos: YouTubePlaylistVideo[] = [];
  const seenVideoIds = new Set<string>();
  const continuationTokens: string[] = [];
  const seenTokens = new Set<string>();

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isRecord(node)) {
      return;
    }

    if (isRecord(node.lockupViewModel)) {
      const video = videoFromLockup(node.lockupViewModel);
      if (video && !seenVideoIds.has(video.videoId)) {
        seenVideoIds.add(video.videoId);
        videos.push({ ...video, position: videos.length });
      }
      return;
    }

    if (isRecord(node.playlistVideoRenderer)) {
      const video = videoFromPlaylistRenderer(node.playlistVideoRenderer);
      if (video && !seenVideoIds.has(video.videoId)) {
        seenVideoIds.add(video.videoId);
        videos.push({
          ...video,
          position:
            typeof node.playlistVideoRenderer.index === 'number'
              ? video.position
              : videos.length,
        });
      }
      return;
    }

    if (isRecord(node.continuationItemRenderer)) {
      const token = continuationTokenFromRenderer(node.continuationItemRenderer);
      if (token && !seenTokens.has(token)) {
        seenTokens.add(token);
        continuationTokens.push(token);
      }
      return;
    }

    Object.values(node).forEach(visit);
  };

  visit(payload);
  return { videos, continuationTokens };
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
      { headers: YOUTUBE_FETCH_HEADERS },
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

async function fetchInnertubeBrowsePage(body: {
  browseId?: string;
  continuation?: string;
}): Promise<unknown> {
  const response = await fetch(INNERTUBE_BROWSE_URL, {
    method: 'POST',
    headers: {
      ...YOUTUBE_FETCH_HEADERS,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://www.youtube.com',
      Referer: 'https://www.youtube.com/',
    },
    body: JSON.stringify({
      context: { client: INNERTUBE_CLIENT },
      ...body,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not load course lessons.');
  }

  return response.json();
}

async function fetchPlaylistVideosFromInnertube(
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> {
  const videos: YouTubePlaylistVideo[] = [];
  const seenVideoIds = new Set<string>();
  const queuedTokens: string[] = [];
  const seenTokens = new Set<string>();
  let page = await fetchInnertubeBrowsePage({ browseId: `VL${playlistId}` });

  for (let pageIndex = 0; pageIndex < MAX_INNERTUBE_PAGES; pageIndex += 1) {
    const collected = collectYouTubeInnertubePlaylist(page);
    collected.videos.forEach(video => {
      if (seenVideoIds.has(video.videoId)) {
        return;
      }
      seenVideoIds.add(video.videoId);
      videos.push({ ...video, position: videos.length });
    });
    collected.continuationTokens.forEach(token => {
      if (!seenTokens.has(token)) {
        seenTokens.add(token);
        queuedTokens.push(token);
      }
    });

    const nextToken = queuedTokens.shift();
    if (!nextToken) {
      break;
    }
    page = await fetchInnertubeBrowsePage({ continuation: nextToken });
  }

  return videos;
}

async function fetchPlaylistVideosFromRss(
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> {
  const response = await fetch(
    `${PLAYLIST_RSS_BASE}${encodeURIComponent(playlistId)}`,
    { headers: YOUTUBE_FETCH_HEADERS },
  );
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

async function fetchPlaylistVideosWithoutApiKey(
  playlistId: string,
): Promise<YouTubePlaylistVideo[]> {
  try {
    return await fetchPlaylistVideosFromInnertube(playlistId);
  } catch {
    // RSS used to work as a public fallback; YouTube now 404s it in many regions.
    return fetchPlaylistVideosFromRss(playlistId);
  }
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
      return fetchPlaylistVideosWithoutApiKey(playlistId);
    }
  }

  return fetchPlaylistVideosWithoutApiKey(playlistId);
}
