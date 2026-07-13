import { useCallback, useState } from 'react';

import {
  getAdminPdfStatusLabel,
  hasAdminPdfAttachment,
} from '../../../utils/admin/saveAdminPdfEntity';
import { pickPdfFile } from '../../../utils/documents/pickPdfFile';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

export function useAdminPdfPicker() {
  const [pendingPdfUri, setPendingPdfUri] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [pickingPdf, setPickingPdf] = useState(false);

  const resetPdfState = useCallback(() => {
    setPendingPdfUri(null);
    setExistingPdfUrl('');
  }, []);

  const loadExistingPdf = useCallback((pdfUrl: string) => {
    setPendingPdfUri(null);
    setExistingPdfUrl(pdfUrl);
  }, []);

  const handlePickPdf = useCallback(async () => {
    setPickingPdf(true);
    try {
      const uri = await pickPdfFile();
      if (uri) {
        setPendingPdfUri(uri);
      }
    } catch {
      appAlert(
        appAlertCopy.admin.fileOpenFailedTitle,
        appAlertCopy.admin.fileOpenFailed,
      );
    } finally {
      setPickingPdf(false);
    }
  }, []);

  const pdfStatusLabel = getAdminPdfStatusLabel(pendingPdfUri, existingPdfUrl);
  const hasPdf = hasAdminPdfAttachment(pendingPdfUri, existingPdfUrl);

  return {
    pendingPdfUri,
    existingPdfUrl,
    pickingPdf,
    pdfStatusLabel,
    hasPdf,
    resetPdfState,
    loadExistingPdf,
    handlePickPdf,
  };
}
