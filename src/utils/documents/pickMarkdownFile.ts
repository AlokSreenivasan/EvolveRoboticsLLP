import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { Platform } from 'react-native';

function ensureMarkdownFileName(name: string | null | undefined): string {
  const trimmed = name?.trim() || 'project.md';
  return /\.md$/i.test(trimmed) ? trimmed : `${trimmed}.md`;
}

function assertMarkdownSelection(
  name: string | null | undefined,
  type: string | null | undefined,
): void {
  const fileName = name?.trim() ?? '';
  const mime = type?.trim().toLowerCase() ?? '';
  const looksLikeMarkdown =
    /\.md$/i.test(fileName) ||
    mime === 'text/markdown' ||
    mime === 'text/x-markdown' ||
    mime === 'text/plain';

  if (!looksLikeMarkdown) {
    throw new Error('Please choose a Markdown (.md) file.');
  }
}

/**
 * Picks a .md file and returns a local file:// URI suitable for Storage putFile.
 */
export async function pickMarkdownFile(): Promise<string | null> {
  try {
    const [file] = await pick({
      type:
        Platform.OS === 'ios'
          ? [types.plainText, types.allFiles]
          : ['text/markdown', 'text/x-markdown', types.plainText, types.allFiles],
      mode: 'import',
      allowVirtualFiles: true,
    });
    const uri = file.uri?.trim();
    if (!uri) {
      return null;
    }

    assertMarkdownSelection(file.name, file.type);

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri,
          fileName: ensureMarkdownFileName(file.name),
          convertVirtualFileToType: 'text/plain',
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
