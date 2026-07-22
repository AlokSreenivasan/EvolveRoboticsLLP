import { useCallback, useState } from 'react';

import { pickMarkdownFile } from '../../../utils/documents/pickMarkdownFile';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

export function getAdminMarkdownStatusLabel(
  pendingUri: string | null,
  existingUrl: string,
): string {
  if (pendingUri) {
    return 'New Markdown file selected';
  }
  if (existingUrl.trim()) {
    return 'Current Markdown page attached';
  }
  return 'No Markdown file selected (optional)';
}

export function useAdminMarkdownPicker() {
  const [pendingMarkdownUri, setPendingMarkdownUri] = useState<string | null>(
    null,
  );
  const [existingMarkdownUrl, setExistingMarkdownUrl] = useState('');
  const [pickingMarkdown, setPickingMarkdown] = useState(false);

  const resetMarkdownState = useCallback(() => {
    setPendingMarkdownUri(null);
    setExistingMarkdownUrl('');
  }, []);

  const loadExistingMarkdown = useCallback((markdownUrl: string) => {
    setPendingMarkdownUri(null);
    setExistingMarkdownUrl(markdownUrl);
  }, []);

  const clearMarkdown = useCallback(() => {
    setPendingMarkdownUri(null);
    setExistingMarkdownUrl('');
  }, []);

  const handlePickMarkdown = useCallback(async () => {
    setPickingMarkdown(true);
    try {
      const uri = await pickMarkdownFile();
      if (uri) {
        setPendingMarkdownUri(uri);
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : appAlertCopy.admin.fileOpenFailed;
      appAlert(appAlertCopy.admin.fileOpenFailedTitle, message);
    } finally {
      setPickingMarkdown(false);
    }
  }, []);

  const markdownStatusLabel = getAdminMarkdownStatusLabel(
    pendingMarkdownUri,
    existingMarkdownUrl,
  );
  const hasMarkdown = Boolean(
    pendingMarkdownUri || existingMarkdownUrl.trim(),
  );

  return {
    pendingMarkdownUri,
    existingMarkdownUrl,
    pickingMarkdown,
    markdownStatusLabel,
    hasMarkdown,
    resetMarkdownState,
    loadExistingMarkdown,
    clearMarkdown,
    handlePickMarkdown,
  };
}
