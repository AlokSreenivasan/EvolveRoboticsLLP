import type { FlatListProps } from 'react-native';

/** Defaults for vertically scrolling lists (catalog, admin, playlist). */
export const VERTICAL_LIST_PERF: Pick<
  FlatListProps<unknown>,
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'removeClippedSubviews'
  | 'updateCellsBatchingPeriod'
> = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  removeClippedSubviews: true,
  updateCellsBatchingPeriod: 50,
};

/** Defaults for horizontal carousels on the home screen. */
export const HORIZONTAL_LIST_PERF: Pick<
  FlatListProps<unknown>,
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'removeClippedSubviews'
> = {
  initialNumToRender: 4,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  removeClippedSubviews: true,
};

/** Nested vertical lists inside a parent ScrollView (no own scroll). */
export const NESTED_LIST_PERF: Pick<
  FlatListProps<unknown>,
  | 'scrollEnabled'
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'removeClippedSubviews'
> = {
  scrollEnabled: false,
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  removeClippedSubviews: true,
};
