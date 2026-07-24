import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { Platform } from 'react-native';

const MARKDOWN_EXTENSION = /\.(md|markdown)$/i;

function ensureMarkdownFileName(name: string | null | undefined): string {
  const trimmed = name?.trim() || 'project.md';
  if (MARKDOWN_EXTENSION.test(trimmed)) {
    return trimmed.replace(/\.markdown$/i, '.md');
  }
  return `${trimmed}.md`;
}

function looksLikeMarkdownUri(uri: string): boolean {
  try {
    const path = decodeURIComponent(uri.split('?')[0] ?? '');
    return MARKDOWN_EXTENSION.test(path);
  } catch {
    return MARKDOWN_EXTENSION.test(uri);
  }
}

function assertMarkdownSelection(
  name: string | null | undefined,
  type: string | null | undefined,
  uri: string,
  options?: { isVirtual?: boolean | null; canExportText?: boolean },
): void {
  if (options?.isVirtual && options.canExportText) {
    return;
  }

  const fileName = name?.trim() ?? '';
  const mime = type?.trim().toLowerCase() ?? '';
  const hasMarkdownExtension =
    MARKDOWN_EXTENSION.test(fileName) || looksLikeMarkdownUri(uri);
  const hasMarkdownMime =
    mime === 'text/markdown' ||
    mime === 'text/x-markdown' ||
    mime === 'text/x-web-markdown' ||
    mime.startsWith('text/markdown') ||
    // Some editors export .md as plain text.
    mime === 'text/plain';

  // Android frequently labels .md as application/octet-stream — only accept
  // that when the file name or URI still indicates Markdown.
  if (!hasMarkdownExtension && !hasMarkdownMime) {
    throw new Error('Please choose a Markdown (.md) file.');
  }
}

function resolveVirtualExportMime(
  convertibleToMimeTypes:
    | Array<{ mimeType?: string | null } | null>
    | null
    | undefined,
): string | undefined {
  const candidates =
    convertibleToMimeTypes
      ?.map(item => item?.mimeType?.trim().toLowerCase() ?? '')
      .filter(Boolean) ?? [];

  return (
    candidates.find(
      mime =>
        mime === 'text/plain' ||
        mime === 'text/markdown' ||
        mime === 'text/x-markdown' ||
        mime.startsWith('text/'),
    ) ?? candidates[0]
  );
}

/**
 * Picks a .md file and returns a local file:// URI suitable for Storage putFile.
 *
 * Important: do not pass convertVirtualFileToType for normal files. On Android,
 * keepLocalCopy then uses openTypedAssetFileDescriptor, which fails for typical
 * .md MIME types (text/markdown / application/octet-stream) when asked for
 * text/plain.
 */
export async function pickMarkdownFile(): Promise<string | null> {
  try {
    const [file] = await pick({
      // Prefer allFiles so OS MIME maps that omit text/markdown still show .md.
      type:
        Platform.OS === 'ios'
          ? [types.allFiles, types.plainText]
          : [types.allFiles, types.plainText, 'text/markdown', 'text/x-markdown'],
      mode: 'import',
      allowVirtualFiles: true,
    });
    const uri = file.uri?.trim();
    if (!uri) {
      return null;
    }

    const virtualExportMime = file.isVirtual
      ? resolveVirtualExportMime(file.convertibleToMimeTypes)
      : undefined;

    assertMarkdownSelection(file.name, file.type, uri, {
      isVirtual: file.isVirtual,
      canExportText: Boolean(virtualExportMime),
    });

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri,
          fileName: ensureMarkdownFileName(file.name),
          ...(virtualExportMime
            ? { convertVirtualFileToType: virtualExportMime }
            : {}),
        },
      ],
      destination: 'cachesDirectory',
    });

    if (localCopy.status !== 'success') {
      throw new Error(
        localCopy.copyError || 'Failed to prepare the Markdown file.',
      );
    }

    return localCopy.localUri.trim() || null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
