import { useCallback, useState } from 'react';

import { PROJECT_MAX_IMAGES } from '../../../store/content/types/projects.types';
import { pickImagesFromGallery } from '../../../services/pickGalleryImages';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

export type ProjectGalleryItem =
  | { id: string; kind: 'remote'; url: string }
  | { id: string; kind: 'local'; uri: string };

let galleryItemSeq = 0;

function nextGalleryItemId(prefix: string): string {
  galleryItemSeq += 1;
  return `${prefix}-${galleryItemSeq}`;
}

/**
 * Multi-image gallery state for ManageProjects (up to {@link PROJECT_MAX_IMAGES}).
 */
export function useAdminProjectGalleryPicker() {
  const [items, setItems] = useState<ProjectGalleryItem[]>([]);
  const [removedRemoteUrls, setRemovedRemoteUrls] = useState<string[]>([]);

  const resetGallery = useCallback(() => {
    setItems([]);
    setRemovedRemoteUrls([]);
  }, []);

  const loadExistingImages = useCallback((urls: string[]) => {
    const remoteItems = urls
      .map(url => url.trim())
      .filter(Boolean)
      .slice(0, PROJECT_MAX_IMAGES)
      .map(url => ({
        id: nextGalleryItemId('remote'),
        kind: 'remote' as const,
        url,
      }));
    setItems(remoteItems);
    setRemovedRemoteUrls([]);
  }, []);

  const handlePickImages = useCallback(async () => {
    const remaining = PROJECT_MAX_IMAGES - items.length;
    if (remaining <= 0) {
      appAlert(
        appAlertCopy.admin.imageTitle,
        `You can attach up to ${PROJECT_MAX_IMAGES} images per project.`,
      );
      return;
    }

    try {
      const result = await pickImagesFromGallery(remaining);
      if (result.success) {
        setItems(prev => {
          const room = PROJECT_MAX_IMAGES - prev.length;
          const additions = result.uris.slice(0, room).map(uri => ({
            id: nextGalleryItemId('local'),
            kind: 'local' as const,
            uri,
          }));
          return [...prev, ...additions];
        });
        return;
      }
      if (!result.cancelled && result.message) {
        appAlert(appAlertCopy.admin.imageTitle, appAlertCopy.admin.image(result.message));
      }
    } catch {
      appAlert(
        appAlertCopy.admin.galleryOpenFailedTitle,
        appAlertCopy.admin.galleryOpenFailed,
      );
    }
  }, [items.length]);

  const removeImage = useCallback((id: string) => {
    setItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.kind === 'remote') {
        setRemovedRemoteUrls(urls => [...urls, target.url]);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const canAddMore = items.length < PROJECT_MAX_IMAGES;
  const statusLabel =
    items.length === 0
      ? `No images yet (up to ${PROJECT_MAX_IMAGES})`
      : `${items.length} of ${PROJECT_MAX_IMAGES} images`;

  return {
    items,
    removedRemoteUrls,
    canAddMore,
    statusLabel,
    resetGallery,
    loadExistingImages,
    handlePickImages,
    removeImage,
  };
}
