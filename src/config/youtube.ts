import Config from 'react-native-config';

/**
 * YouTube Data API v3 key for loading full playlist video lists.
 * When empty, the app falls back to the public playlist RSS feed (smaller/fallible).
 *
 * Note: changing `.env` requires rebuilding native binaries (not just Metro reload).
 */
export const YOUTUBE_API_KEY = (Config.YOUTUBE_API_KEY ?? '').trim();
