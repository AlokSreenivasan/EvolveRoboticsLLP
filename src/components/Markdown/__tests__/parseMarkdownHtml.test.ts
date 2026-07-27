import {
  extractHtmlImages,
  isHtmlCentered,
  isLikelyBadgeImage,
  stripHtmlTags,
} from '../parseMarkdownHtml';

describe('parseMarkdownHtml', () => {
  test('extracts centered banner and badge images', () => {
    const html = `
<p align="center">
<img src="https://example.com/banner.png" alt="TortoiseBot Banner" width="800"/>
</p>
<p align="center">
<img src="https://img.shields.io/github/stars/rigbetellabs/tortoisebot?style=for-the-badge"/>
<img src='https://img.shields.io/github/forks/rigbetellabs/tortoisebot?style=for-the-badge' alt="forks" />
</p>
`;

    expect(extractHtmlImages(html)).toEqual([
      {
        src: 'https://example.com/banner.png',
        alt: 'TortoiseBot Banner',
      },
      {
        src: 'https://img.shields.io/github/stars/rigbetellabs/tortoisebot?style=for-the-badge',
        alt: '',
      },
      {
        src: 'https://img.shields.io/github/forks/rigbetellabs/tortoisebot?style=for-the-badge',
        alt: 'forks',
      },
    ]);
    expect(isHtmlCentered(html)).toBe(true);
  });

  test('reads attributes in any order', () => {
    expect(
      extractHtmlImages(
        '<img alt="Logo" width="100" src="https://cdn.example/logo.png" />',
      ),
    ).toEqual([{ src: 'https://cdn.example/logo.png', alt: 'Logo' }]);
  });

  test('detects badge-like image hosts', () => {
    expect(
      isLikelyBadgeImage(
        'https://img.shields.io/github/stars/rigbetellabs/tortoisebot',
      ),
    ).toBe(true);
    expect(isLikelyBadgeImage('https://example.com/pack_front.png')).toBe(
      false,
    );
  });

  test('strips tags for leftover text', () => {
    expect(stripHtmlTags('<sub>ROS 2</sub>')).toBe('ROS 2');
    expect(stripHtmlTags('<br/>')).toBe('');
  });
});
