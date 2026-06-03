import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** Singleton config at appContent/upcomingEvents */
export interface UpcomingEventsSectionDocument {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface UpcomingEventsSection {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface UpcomingEventDocument {
  month: string;
  day: string;
  year?: number;
  title: string;
  dateRange: string;
  timeRange: string;
  daysLeftLabel: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
}

export interface UpcomingEvent {
  id: string;
  month: string;
  day: string;
  year: number | null;
  title: string;
  dateRange: string;
  timeRange: string;
  daysLeftLabel: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export type CreateUpcomingEventInput = {
  month: string;
  day: string;
  year: number;
  title: string;
  dateRange: string;
  timeRange: string;
  daysLeftLabel: string;
  isPublished?: boolean;
};

export type UpdateUpcomingEventInput = Partial<
  CreateUpcomingEventInput & { sortOrder: number }
>;

export type UpdateUpcomingEventsSectionInput = {
  sectionTitle: string;
  sectionSubtitle: string;
  actionLabel: string;
};
