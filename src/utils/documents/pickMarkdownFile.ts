import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';

const MARKDOWN_EXTENSION = /\.(md|markdown)$/i;

/**
 * Local cache name uses .txt so iOS Firebase putFile MIME detection yields
 * text/plain (always allowed by Storage rules). The Storage object path is
 * still projectMarkdown/{uid}/{projectId}.md.
 */
const CACHE_FILE_NAME = 'project.txt';

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
  nativeType?: string | null,
): void {
  const fileName = name?.trim() ?? '';
  const mime = type?.trim().toLowerCase() ?? '';
  const native = nativeType?.trim().toLowerCase() ?? '';

  const hasMarkdownExtension =
    MARKDOWN_EXTENSION.test(fileName) || looksLikeMarkdownUri(uri);
  const hasMarkdownType =
    mime === 'text/markdown' ||
    mime === 'text/x-markdown' ||
    mime === 'text/x-web-markdown' ||
    mime.startsWith('text/markdown') ||
    mime === 'text/plain' ||
    native === 'net.daringfireball.markdown' ||
    native === 'public.markdown';

  if (!hasMarkdownExtension && !hasMarkdownType) {
    throw new Error('Please choose a Markdown (.md) file.');
  }
}

/**
 * Picks a Markdown (.md) file and returns a local file:// URI for Storage putFile.
 *
 * Mirrors {@link pickPdfFile}: import mode + keepLocalCopy into caches.
 * Does NOT pass convertVirtualFileToType for normal files — on Android that
 * forces openTypedAssetFileDescriptor and fails for typical .md MIME types.
 */
export async function pickMarkdownFile(): Promise<string | null> {
  try {
    const [file] = await pick({
      // Single catch-all type. Multiple MIME filters break Android GET_CONTENT.
      type: [types.allFiles],
      mode: 'import',
      allowVirtualFiles: true,
    });

    const uri = file.uri?.trim();
    if (!uri) {
      return null;
    }

    const isVirtual = Boolean(file.isVirtual);
    if (!isVirtual) {
      assertMarkdownSelection(file.name, file.type, uri, file.nativeType);
    }

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri,
          fileName: CACHE_FILE_NAME,
          // Only virtual providers (e.g. Google Docs) need an export MIME.
          ...(isVirtual ? { convertVirtualFileToType: 'text/plain' } : {}),
        },
      ],
      destination: 'cachesDirectory',
    });

    if (localCopy.status !== 'success') {
      const copyError = localCopy.copyError || '';
      if (/no data was copied/i.test(copyError)) {
        throw new Error(
          'The selected Markdown file is empty. Add some content and try again.',
        );
      }
      throw new Error(copyError || 'Failed to prepare the Markdown file.');
    }

    return localCopy.localUri.trim() || null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
