/** True when the URL points at a Firebase Storage object (safe to delete via refFromURL). */
export function isFirebaseStorageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) {
    return false;
  }
  const value = url.trim().toLowerCase();
  return (
    value.includes('firebasestorage.googleapis.com') ||
    value.includes('appspot.com')
  );
}
