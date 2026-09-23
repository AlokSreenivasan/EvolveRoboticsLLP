import type { ResourcesSection } from '../store/content/types/resources.types';

/** Matches the cap enforced in Firestore rules for note categories. */
export const MAX_RESOURCE_NOTE_CATEGORIES = 20;
export const MAX_RESOURCE_NOTE_CATEGORY_NAME_LENGTH = 40;

export const DEFAULT_RESOURCES_SECTION: ResourcesSection = {
  sectionTitle: 'Resources',
  sectionSubtitle: 'Study notes and reference materials from your instructors.',
  actionLabel: '',
  categories: [],
  updatedAt: null,
};
