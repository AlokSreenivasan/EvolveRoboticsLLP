import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import { orderBy, query, where } from './firestoreClient';

type CollectionLike = Parameters<typeof query>[0];

/**
 * List query aligned with firestore.rules published-content reads.
 *
 * Learners: equality filter only (automatic single-field index; no composite wait).
 * Sorting is done client-side in each service.
 * Admins (includeUnpublished): orderBy sortOrder across all docs.
 */
export function buildSortedContentListQuery(
  collectionRef: CollectionLike,
  options?: ContentSubscribeOptions,
) {
  if (options?.includeUnpublished === true) {
    return query(collectionRef, orderBy('sortOrder', 'asc'));
  }

  return query(collectionRef, where('isPublished', '==', true));
}
