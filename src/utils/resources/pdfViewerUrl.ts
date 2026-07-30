export type PdfViewerMode = 'google' | 'direct';

/** Embeds a remote PDF in WebView via Google Docs viewer (works on iOS and Android). */
export function buildEmbeddedPdfViewerUrl(pdfUrl: string): string {
  const trimmed = pdfUrl.trim();
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(trimmed)}`;
}

/** Resolves the WebView source URL for the current viewer strategy. */
export function resolvePdfViewerUrl(
  pdfUrl: string,
  mode: PdfViewerMode = 'google',
): string {
  const trimmed = pdfUrl.trim();
  if (!trimmed) {
    return '';
  }
  return mode === 'direct' ? trimmed : buildEmbeddedPdfViewerUrl(trimmed);
}

/** After Google Docs fails, fall back to the raw PDF URL once. */
export function nextPdfViewerMode(
  current: PdfViewerMode,
): PdfViewerMode | null {
  return current === 'google' ? 'direct' : null;
}
