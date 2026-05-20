import {
  Alert,
  InteractionManager,
  NativeModules,
  Platform,
} from 'react-native';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

export type PickProfilePhotoResult =
  | { success: true; uri: string }
  | { success: false; cancelled: boolean; message?: string };

function isImagePickerAvailable(): boolean {
  // New Architecture uses TurboModules; legacy bridge exposes NativeModules.ImagePicker.
  // @ts-expect-error __turboModuleProxy is not in RN types
  if (global.__turboModuleProxy != null) {
    return true;
  }
  return NativeModules.ImagePicker != null;
}

function getUriFromResponse(response: ImagePickerResponse): string | null {
  const uri = response.assets?.[0]?.uri;
  return uri ?? null;
}

function mapPickerError(response: ImagePickerResponse): string {
  if (response.errorMessage) {
    return response.errorMessage;
  }

  switch (response.errorCode) {
    case 'permission':
      return 'Photo library permission was denied. Enable it in Settings to choose a profile photo.';
    case 'camera_unavailable':
      return 'Camera is not available on this device.';
    default:
      return 'Could not open the photo library. Please try again.';
  }
}

function parsePickerResponse(
  response: ImagePickerResponse,
): PickProfilePhotoResult {
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

  const uri = getUriFromResponse(response);
  if (!uri) {
    return {
      success: false,
      cancelled: false,
      message: 'No image was selected. Please try again.',
    };
  }

  return { success: true, uri };
}

function waitForInteractions(): Promise<void> {
  return new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
}

export async function pickProfilePhotoFromGallery(): Promise<PickProfilePhotoResult> {
  if (!isImagePickerAvailable()) {
    return {
      success: false,
      cancelled: false,
      message:
        'Photo picker is not available. Rebuild the app after installing react-native-image-picker.',
    };
  }

  // Let navigation transitions finish so iOS can present the picker on top.
  if (Platform.OS === 'ios') {
    await waitForInteractions();
  }

  try {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.85,
      includeBase64: false,
      ...(Platform.OS === 'ios'
        ? { presentationStyle: 'fullScreen' as const }
        : {}),
    });
    return parsePickerResponse(response);
  } catch {
    return {
      success: false,
      cancelled: false,
      message: 'Could not open the photo library. Please try again.',
    };
  }
}

export function showPhotoPickerError(message: string): void {
  Alert.alert('Profile Photo', message);
}
