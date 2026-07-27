import {
  documentDirectoryUrl,
  inferGitHubRawBase,
  resolveMarkdownImageUrl,
  rewriteRelativeMarkdownImages,
} from '../resolveMarkdownImageUrl';

describe('resolveMarkdownImageUrl', () => {
  test('infers GitHub raw base from shields badges', () => {
    const md = `
# TortoiseBot
<img src="https://img.shields.io/github/stars/rigbetellabs/tortoisebot?style=for-the-badge"/>
<img src="media/navigation.gif" alt="demo"/>
`;
    expect(inferGitHubRawBase(md)).toBe(
      'https://raw.githubusercontent.com/rigbetellabs/tortoisebot/master/',
    );
  });

  test('rewrites relative GIF paths to raw GitHub URLs', () => {
    const md = `
<p align="center">
<img src="https://img.shields.io/github/stars/rigbetellabs/tortoisebot?style=for-the-badge"/>
</p>
<p align="center">
<img src="media/navigation.gif" alt="SLAM Mapping Demo" width="800"/>
</p>
![goal](media/goaltravel.gif)
`;

    const rewritten = rewriteRelativeMarkdownImages(md);
    expect(rewritten).toContain(
      'src="https://raw.githubusercontent.com/rigbetellabs/tortoisebot/master/media/navigation.gif"',
    );
    expect(rewritten).toContain(
      '![goal](https://raw.githubusercontent.com/rigbetellabs/tortoisebot/master/media/goaltravel.gif)',
    );
  });

  test('resolves against document directory URL when provided', () => {
    expect(
      resolveMarkdownImageUrl(
        'media/navigation.gif',
        'https://raw.githubusercontent.com/rigbetellabs/tortoisebot/master/',
      ),
    ).toBe(
      'https://raw.githubusercontent.com/rigbetellabs/tortoisebot/master/media/navigation.gif',
    );
  });

  test('leaves absolute URLs unchanged', () => {
    const absolute =
      'https://github.com/rigbetellabs/tortoisebot_docs/raw/master/imgs/packaging/pack_front.png';
    expect(resolveMarkdownImageUrl(absolute, 'https://example.com/')).toBe(
      absolute,
    );
  });

  test('does not treat Firebase download URLs as document directories', () => {
    expect(
      documentDirectoryUrl(
        'https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/projectMarkdown%2Fu%2Fp.md?alt=media&token=abc',
      ),
    ).toBeNull();
  });
});
