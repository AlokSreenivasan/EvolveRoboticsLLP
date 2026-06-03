import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { pickProfilePhotoFromGallery } from '../../../services/profilePhotoPicker';
import { getErrorMessage } from '../../../utils/firebase/errors';

/**
 * Local thumbnail pick state for course / playlist admin screens.
 * Uses a ref so save handlers can read the latest URI after keyboard dismiss.
 */
export function useAdminImagePicker(existingRemoteUri = '') {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [remoteUri, setRemoteUri] = useState(existingRemoteUri);
  const localUriRef = useRef<string | null>(null);

  useEffect(() => {
    localUriRef.current = localUri;
  }, [localUri]);

  const resetImageState = useCallback(() => {
    setLocalUri(null);
    setRemoteUri('');
  }, []);

  const loadExistingImage = useCallback((uri: string) => {
    setLocalUri(null);
    setRemoteUri(uri);
  }, []);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await pickProfilePhotoFromGallery();
      if (result.success) {
        setLocalUri(result.uri);
        setRemoteUri('');
        return;
      }
      if (!result.cancelled && result.message) {
        Alert.alert('Image', result.message);
      }
    } catch (error) {
      Alert.alert('Could not open gallery', getErrorMessage(error));
    }
  }, []);

  const previewUri = localUri?.trim() || remoteUri.trim() || null;
  const pendingLocalUri = () => localUriRef.current?.trim() || null;

  const updateRemoteUri = useCallback((uri: string) => {
    setLocalUri(null);
    setRemoteUri(uri);
  }, []);

  return {
    localUri,
    remoteUri,
    previewUri,
    pendingLocalUri,
    resetImageState,
    loadExistingImage,
    handlePickImage,
    setRemoteUri: updateRemoteUri,
  };
}
