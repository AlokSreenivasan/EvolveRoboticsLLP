import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';

function ensurePdfFileName(name: string | null | undefined): string {
  const trimmed = name?.trim() || 'document.pdf';
  return /\.pdf$/i.test(trimmed) ? trimmed : `${trimmed}.pdf`;
}

/**
 * Picks a PDF and returns a local file:// URI suitable for Storage putFile.
 * Copies into the cache so Android content:// URIs and virtual files work, and
 * the cached path ends in .pdf so iOS MIME detection matches Storage rules.
 */
export async function pickPdfFile(): Promise<string | null> {
  try {
    const [file] = await pick({
      type: [types.pdf],
      mode: 'import',
      allowVirtualFiles: true,
    });
    const uri = file.uri?.trim();
    if (!uri) {
      return null;
    }

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri,
          fileName: ensurePdfFileName(file.name),
          convertVirtualFileToType: 'application/pdf',
        },
      ],
      destination: 'cachesDirectory',
    });

    if (localCopy.status !== 'success') {
      throw new Error(localCopy.copyError || 'Failed to prepare the PDF file.');
    }

    return localCopy.localUri.trim() || null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
