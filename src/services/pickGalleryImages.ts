import {
  InteractionManager,
  NativeModules,
  Platform,
} from 'react-native';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

export type PickGalleryImagesResult =
  | { success: true; uris: string[] }
  | { success: false; cancelled: boolean; message?: string };

function isImagePickerAvailable(): boolean {
  // @ts-expect-error __turboModuleProxy is not in RN types
  if (global.__turboModuleProxy != null) {
    return true;
  }
  return NativeModules.ImagePicker != null;
}

function mapPickerError(response: ImagePickerResponse): string {
  if (response.errorMessage) {
    return response.errorMessage;
  }

  switch (response.errorCode) {
    case 'permission':
      return 'Photo library permission was denied. Enable it in Settings to choose images.';
    case 'camera_unavailable':
      return 'Camera is not available on this device.';
    default:
      return 'Could not open the photo library. Please try again.';
  }
}

function waitForInteractions(): Promise<void> {
  return new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
}

/**
 * Picks up to `selectionLimit` photos from the device gallery.
 * Used for project galleries (max 5 total across existing + new picks).
 */
export async function pickImagesFromGallery(
  selectionLimit: number,
): Promise<PickGalleryImagesResult> {
  const limit = Math.max(1, Math.min(5, Math.trunc(selectionLimit)));

  if (!isImagePickerAvailable()) {
    return {
      success: false,
      cancelled: false,
      message:
        'Photo picker is not available. Rebuild the app after installing react-native-image-picker.',
    };
  }

  if (Platform.OS === 'ios') {
    await waitForInteractions();
  }

  try {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: limit,
      quality: 0.8,
      includeBase64: false,
      ...(Platform.OS === 'ios'
        ? { presentationStyle: 'fullScreen' as const }
        : {}),
    });

    if (response.didCancel) {
      return { success: false, cancelled: true };
    }

    if (response.errorCode) {
      return {
        success: false,
        cancelled: false,
        message: mapPickerError(response),
      };
    }

    const uris = (response.assets ?? [])
      .map(asset => asset.uri?.trim())
      .filter((uri): uri is string => Boolean(uri))
      .slice(0, limit);

    if (uris.length === 0) {
      return {
        success: false,
        cancelled: false,
        message: 'No images were selected. Please try again.',
      };
    }

    return { success: true, uris };
  } catch {
    return {
      success: false,
      cancelled: false,
      message: 'Could not open the photo library. Please try again.',
    };
  }
}
