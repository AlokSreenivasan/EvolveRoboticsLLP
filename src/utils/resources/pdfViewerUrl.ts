/** Embeds a remote PDF in WebView via Google Docs viewer (works on iOS and Android). */
export function buildEmbeddedPdfViewerUrl(pdfUrl: string): string {
  const trimmed = pdfUrl.trim();
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(trimmed)}`;
}
