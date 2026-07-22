import { keepLocalCopy, pick } from '@react-native-documents/picker';

import { pickPdfFile } from '../pickPdfFile';

describe('pickPdfFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('copies the picked PDF into cache with a .pdf file name', async () => {
    (pick as jest.Mock).mockResolvedValueOnce([
      {
        uri: 'content://downloads/doc',
        name: 'Lab Report',
        type: 'application/pdf',
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValueOnce([
      {
        status: 'success',
        sourceUri: 'content://downloads/doc',
        localUri: 'file:///cache/Lab Report.pdf',
      },
    ]);

    await expect(pickPdfFile()).resolves.toBe('file:///cache/Lab Report.pdf');
    expect(keepLocalCopy).toHaveBeenCalledWith({
      files: [
        {
          uri: 'content://downloads/doc',
          fileName: 'Lab Report.pdf',
          convertVirtualFileToType: 'application/pdf',
        },
      ],
      destination: 'cachesDirectory',
    });
  });

  test('returns null when the picker is canceled', async () => {
    const { errorCodes } = jest.requireMock('@react-native-documents/picker');
    (pick as jest.Mock).mockRejectedValueOnce({
      code: errorCodes.OPERATION_CANCELED,
    });

    await expect(pickPdfFile()).resolves.toBeNull();
  });
});
