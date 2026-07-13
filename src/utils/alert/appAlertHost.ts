export type AppAlertButtonConfig = {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type AppAlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons?: AppAlertButtonConfig[];
};

type AppAlertListener = (request: AppAlertRequest | null) => void;

let listener: AppAlertListener | null = null;
let nextId = 0;

export function subscribeAppAlert(nextListener: AppAlertListener): () => void {
  listener = nextListener;
  return () => {
    if (listener === nextListener) {
      listener = null;
    }
  };
}

export function publishAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButtonConfig[],
): void {
  listener?.({
    id: ++nextId,
    title,
    message,
    buttons,
  });
}

export function dismissAppAlert(): void {
  listener?.(null);
}
