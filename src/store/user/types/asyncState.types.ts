export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const initialAsyncState = <T>(): AsyncState<T> => ({
  data: null,
  loading: false,
  error: null,
});
