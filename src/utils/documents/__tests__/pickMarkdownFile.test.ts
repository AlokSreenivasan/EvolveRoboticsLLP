import { keepLocalCopy, pick } from '@react-native-documents/picker';
import { Platform } from 'react-native';

import { pickMarkdownFile } from '../pickMarkdownFile';

describe('pickMarkdownFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'android';
  });

  test('copies a normal .md file without convertVirtualFileToType', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://downloads/brief.md',
        name: 'brief.md',
        type: 'application/octet-stream',
        isVirtual: false,
        convertibleToMimeTypes: null,
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValueOnce([
      {
        status: 'success',
        sourceUri: 'content://downloads/brief.md',
        localUri: 'file:///cache/brief.md',
      },
    ]);

    await expect(pickMarkdownFile()).resolves.toBe('file:///cache/brief.md');
    expect(keepLocalCopy).toHaveBeenCalledWith({
      files: [
        {
          uri: 'content://downloads/brief.md',
          fileName: 'brief.md',
        },
      ],
      destination: 'cachesDirectory',
    });
  });

  test('exports virtual files with a convertible text MIME type', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://com.google.android.apps.docs/document',
        name: 'Notes',
        type: 'application/vnd.google-apps.document',
        isVirtual: true,
        convertibleToMimeTypes: [
          { mimeType: 'text/plain', extension: 'txt' },
          { mimeType: 'application/pdf', extension: 'pdf' },
        ],
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValueOnce([
      {
        status: 'success',
        sourceUri: 'content://com.google.android.apps.docs/document',
        localUri: 'file:///cache/Notes.md',
      },
    ]);

    await expect(pickMarkdownFile()).resolves.toBe('file:///cache/Notes.md');
    expect(keepLocalCopy).toHaveBeenCalledWith({
      files: [
        {
          uri: 'content://com.google.android.apps.docs/document',
          fileName: 'Notes.md',
          convertVirtualFileToType: 'text/plain',
        },
      ],
      destination: 'cachesDirectory',
    });
  });

  test('rejects non-markdown selections', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://downloads/photo.jpg',
        name: 'photo.jpg',
        type: 'image/jpeg',
        isVirtual: false,
        convertibleToMimeTypes: null,
      },
    ]);

    await expect(pickMarkdownFile()).rejects.toThrow(
      'Please choose a Markdown (.md) file.',
    );
    expect(keepLocalCopy).not.toHaveBeenCalled();
  });

  test('rejects octet-stream files without a markdown extension', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://downloads/archive.bin',
        name: 'archive.bin',
        type: 'application/octet-stream',
        isVirtual: false,
        convertibleToMimeTypes: null,
      },
    ]);

    await expect(pickMarkdownFile()).rejects.toThrow(
      'Please choose a Markdown (.md) file.',
    );
    expect(keepLocalCopy).not.toHaveBeenCalled();
  });

  test('accepts markdown identified only by URI extension', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://downloads/document%2Fproject-brief.md',
        name: 'project-brief',
        type: 'application/octet-stream',
        isVirtual: false,
        convertibleToMimeTypes: null,
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValueOnce([
      {
        status: 'success',
        sourceUri: 'content://downloads/document%2Fproject-brief.md',
        localUri: 'file:///cache/project-brief.md',
      },
    ]);

    await expect(pickMarkdownFile()).resolves.toBe(
      'file:///cache/project-brief.md',
    );
  });

  test('returns null when the picker is canceled', async () => {
    const { errorCodes } = jest.requireMock('@react-native-documents/picker');
    (pick as jest.Mock).mockRejectedValueOnce({
      code: errorCodes.OPERATION_CANCELED,
    });

    await expect(pickMarkdownFile()).resolves.toBeNull();
  });
});
