export type SaveAdminImageEntityParams = {
  entityId: string;
  pendingLocalUri: string | null;
  existingRemoteUri: string;
  uploadImage: (entityId: string, localUri: string) => Promise<string>;
};

/**
 * Resolves the final image URL for admin create/update.
 * Upload runs only when a new local file was picked; otherwise keeps remote URI.
 */
export async function resolveAdminImageUrl(
  params: SaveAdminImageEntityParams,
): Promise<string> {
  const { entityId, pendingLocalUri, existingRemoteUri, uploadImage } = params;
  const trimmedLocal = pendingLocalUri?.trim();
  if (trimmedLocal) {
    return uploadImage(entityId, trimmedLocal);
  }
  return existingRemoteUri.trim();
}
