import { collectYouTubeInnertubePlaylist } from '../youtubePlaylistService';

describe('collectYouTubeInnertubePlaylist', () => {
  it('reads lockupViewModel playlist rows and continuation tokens', () => {
    const payload = {
      contents: {
        twoColumnBrowseResultsRenderer: {
          tabs: [
            {
              tabRenderer: {
                content: {
                  sectionListRenderer: {
                    contents: [
                      {
                        itemSectionRenderer: {
                          contents: [
                            {
                              lockupViewModel: {
                                contentId: 'abcdefghijk',
                                metadata: {
                                  lockupMetadataViewModel: {
                                    title: { content: 'Lesson one' },
                                  },
                                },
                              },
                            },
                            {
                              lockupViewModel: {
                                contentId: 'lmnopqrstuv',
                                metadata: {
                                  lockupMetadataViewModel: {
                                    title: { content: 'Lesson two' },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        continuationItemRenderer: {
                          continuationEndpoint: {
                            continuationCommand: {
                              token: 'next-page-token',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    };

    expect(collectYouTubeInnertubePlaylist(payload)).toEqual({
      videos: [
        {
          videoId: 'abcdefghijk',
          title: 'Lesson one',
          thumbnailUrl: 'https://img.youtube.com/vi/abcdefghijk/mqdefault.jpg',
          position: 0,
        },
        {
          videoId: 'lmnopqrstuv',
          title: 'Lesson two',
          thumbnailUrl: 'https://img.youtube.com/vi/lmnopqrstuv/mqdefault.jpg',
          position: 1,
        },
      ],
      continuationTokens: ['next-page-token'],
    });
  });

  it('reads classic playlistVideoRenderer rows', () => {
    const payload = {
      contents: [
        {
          playlistVideoRenderer: {
            videoId: 'Abcdefghijk',
            title: { runs: [{ text: 'Classic title' }] },
            index: 3,
          },
        },
      ],
    };

    expect(collectYouTubeInnertubePlaylist(payload).videos).toEqual([
      {
        videoId: 'Abcdefghijk',
        title: 'Classic title',
        thumbnailUrl: 'https://img.youtube.com/vi/Abcdefghijk/mqdefault.jpg',
        position: 3,
      },
    ]);
  });
});
