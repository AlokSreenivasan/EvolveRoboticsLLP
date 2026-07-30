import {
  buildEmbeddedPdfViewerUrl,
  nextPdfViewerMode,
  resolvePdfViewerUrl,
} from '../pdfViewerUrl';

describe('pdfViewerUrl', () => {
  const pdfUrl = 'https://example.com/notes/chapter-1.pdf';

  it('builds an embedded Google Docs viewer URL', () => {
    expect(buildEmbeddedPdfViewerUrl(pdfUrl)).toBe(
      `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`,
    );
  });

  it('trims whitespace before embedding', () => {
    expect(buildEmbeddedPdfViewerUrl(`  ${pdfUrl}  `)).toBe(
      `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`,
    );
  });

  it('resolves google mode to the embedded viewer URL', () => {
    expect(resolvePdfViewerUrl(pdfUrl, 'google')).toBe(
      buildEmbeddedPdfViewerUrl(pdfUrl),
    );
  });

  it('resolves direct mode to the raw PDF URL', () => {
    expect(resolvePdfViewerUrl(` ${pdfUrl} `, 'direct')).toBe(pdfUrl);
  });

  it('returns an empty string for blank PDF URLs', () => {
    expect(resolvePdfViewerUrl('   ', 'google')).toBe('');
    expect(resolvePdfViewerUrl('', 'direct')).toBe('');
  });

  it('falls back from google to direct, then stops', () => {
    expect(nextPdfViewerMode('google')).toBe('direct');
    expect(nextPdfViewerMode('direct')).toBeNull();
  });
});
