import { appAlertButtons } from '../../constants/appAlertCopy';
import {
  publishAppAlert,
  type AppAlertButtonConfig,
} from './appAlertHost';

type AppAlertButton = AppAlertButtonConfig;

function themeButtons(buttons?: AppAlertButton[]): AppAlertButton[] | undefined {
  if (!buttons) {
    return undefined;
  }

  return buttons.map(button => ({
    ...button,
    text:
      button.text === 'OK'
        ? appAlertButtons.gotIt
        : (button.text ?? appAlertButtons.gotIt),
  }));
}

/** Themed Evolve alert modal (purple hero, branded buttons). */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
): void {
  publishAppAlert(title, message, themeButtons(buttons));
}

export function appAlertConfirm(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: {
    confirmLabel?: string;
    destructive?: boolean;
    cancelLabel?: string;
  },
): void {
  appAlert(title, message, [
    {
      text: options?.cancelLabel ?? appAlertButtons.cancel,
      style: 'cancel',
    },
    {
      text: options?.confirmLabel ?? appAlertButtons.delete,
      style: options?.destructive ? 'destructive' : 'default',
      onPress: () => {
        Promise.resolve(onConfirm()).catch(() => undefined);
      },
    },
  ]);
}

export { appAlertButtons, appAlertCopy } from '../../constants/appAlertCopy';
