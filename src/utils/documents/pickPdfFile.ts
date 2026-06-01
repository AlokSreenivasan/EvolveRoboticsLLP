import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';

export async function pickPdfFile(): Promise<string | null> {
  try {
    const [file] = await pick({
      type: [types.pdf],
    });
    return file.uri?.trim() || null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
