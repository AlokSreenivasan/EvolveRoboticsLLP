export type SaveAdminPdfEntityParams = {
  editingId: string | null;
  pendingPdfUri: string | null;
  existingPdfUrl: string;
  uploadPdf: (entityId: string, localUri: string) => Promise<string>;
  deleteOldPdf?: (url: string) => Promise<void>;
  createEntity: () => Promise<{ id: string }>;
  updateEntity: (id: string, pdfUrl: string) => Promise<void>;
};

/**
 * Two-step PDF admin save: create stub → upload → set URL, or update with optional replace.
 * Upload helpers call syncFirestoreAuthSession before Storage writes.
 */
export async function saveAdminPdfEntity(
  params: SaveAdminPdfEntityParams,
): Promise<void> {
  const {
    editingId,
    pendingPdfUri,
    existingPdfUrl,
    uploadPdf,
    deleteOldPdf,
    createEntity,
    updateEntity,
  } = params;

  if (editingId) {
    let pdfUrl = existingPdfUrl.trim();
    if (pendingPdfUri) {
      pdfUrl = await uploadPdf(editingId, pendingPdfUri);
      if (existingPdfUrl.trim() && deleteOldPdf) {
        await deleteOldPdf(existingPdfUrl);
      }
    }
    await updateEntity(editingId, pdfUrl);
    return;
  }

  if (!pendingPdfUri) {
    throw new Error('PDF required for new entity');
  }

  const created = await createEntity();
  const pdfUrl = await uploadPdf(created.id, pendingPdfUri);
  await updateEntity(created.id, pdfUrl);
}

export function getAdminPdfStatusLabel(
  pendingPdfUri: string | null,
  existingPdfUrl: string,
): string {
  if (pendingPdfUri) {
    return 'New PDF selected';
  }
  if (existingPdfUrl.trim()) {
    return 'Current PDF attached';
  }
  return 'No PDF selected';
}

export function hasAdminPdfAttachment(
  pendingPdfUri: string | null,
  existingPdfUrl: string,
): boolean {
  return Boolean(pendingPdfUri || existingPdfUrl.trim());
}
