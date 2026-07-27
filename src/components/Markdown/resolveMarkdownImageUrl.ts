const ABSOLUTE_URI_RE = /^(https?:|data:|file:)/i;

/**
 * Infers a GitHub raw content base (…/owner/repo/branch/) from README cues
 * like Shields badges or existing raw.githubusercontent.com links.
 */
export function inferGitHubRawBase(markdown: string): string | null {
  const shields = markdown.match(
    /img\.shields\.io\/github\/(?:stars|forks|watchers|repo-size|contributors|last-commit|issues|license)\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i,
  );
  if (shields) {
    return `https://raw.githubusercontent.com/${shields[1]}/${shields[2]}/master/`;
  }

  const raw = markdown.match(
    /https:\/\/raw\.githubusercontent\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\//i,
  );
  if (raw) {
    return `https://raw.githubusercontent.com/${raw[1]}/${raw[2]}/${raw[3]}/`;
  }

  const githubRawPath = markdown.match(
    /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/(?:raw|blob)\/([A-Za-z0-9_.-]+)\//i,
  );
  if (githubRawPath) {
    return `https://raw.githubusercontent.com/${githubRawPath[1]}/${githubRawPath[2]}/${githubRawPath[3]}/`;
  }

  return null;
}

/** Directory form of a document URL for resolving relative image paths. */
export function documentDirectoryUrl(documentUrl: string): string | null {
  const trimmed = documentUrl.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  // Firebase download URLs encode the object path in /o/... — relative
  // siblings are not meaningfully resolvable from the download URL alone.
  if (trimmed.includes('firebasestorage.googleapis.com')) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const path = url.pathname.endsWith('/')
      ? url.pathname
      : url.pathname.replace(/[^/]+$/, '');
    return `${url.origin}${path}`;
  } catch {
    return null;
  }
}

export function resolveMarkdownImageUrl(
  src: string,
  baseUrl?: string | null,
): string {
  const trimmed = src.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (ABSOLUTE_URI_RE.test(trimmed)) {
    return trimmed;
  }
  if (!baseUrl) {
    return trimmed;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return trimmed;
  }
}

/**
 * Rewrites relative HTML and Markdown image URLs to absolute ones using
 * an explicit base and/or a GitHub raw base inferred from the document.
 */
export function rewriteRelativeMarkdownImages(
  markdown: string,
  documentUrl?: string | null,
): string {
  const base =
    documentDirectoryUrl(documentUrl ?? '') ?? inferGitHubRawBase(markdown);
  if (!base) {
    return markdown;
  }

  const rewriteSrc = (src: string) => resolveMarkdownImageUrl(src, base);

  let output = markdown.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']+)\2/gi,
    (full, prefix: string, quote: string, src: string) => {
      const resolved = rewriteSrc(src);
      if (resolved === src) {
        return full;
      }
      return `${prefix}${quote}${resolved}${quote}`;
    },
  );

  // Markdown images: ![alt](relative/path.gif)
  output = output.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (full, alt: string, src: string) => {
      const resolved = rewriteSrc(src);
      if (resolved === src) {
        return full;
      }
      return `![${alt}](${resolved})`;
    },
  );

  return output;
}
