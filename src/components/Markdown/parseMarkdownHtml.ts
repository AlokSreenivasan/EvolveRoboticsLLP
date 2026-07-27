export type MarkdownHtmlImage = {
  src: string;
  alt: string;
};

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ATTR_RE =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

function parseTagAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ATTR_RE.exec(tag)) !== null) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return attrs;
}

/** Extracts `<img>` src/alt pairs from a raw HTML snippet. */
export function extractHtmlImages(html: string): MarkdownHtmlImage[] {
  const images: MarkdownHtmlImage[] = [];
  IMG_TAG_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = IMG_TAG_RE.exec(html)) !== null) {
    const attrs = parseTagAttributes(match[0]);
    const src = attrs.src?.trim();
    if (!src) {
      continue;
    }
    images.push({
      src,
      alt: attrs.alt?.trim() ?? '',
    });
  }

  return images;
}

export function isHtmlCentered(html: string): boolean {
  return (
    /align\s*=\s*["']?center/i.test(html) ||
    /text-align\s*:\s*center/i.test(html)
  );
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

export function isLikelyBadgeImage(src: string): boolean {
  const lower = src.toLowerCase();
  return lower.includes('img.shields.io') || lower.includes('/badge');
}
