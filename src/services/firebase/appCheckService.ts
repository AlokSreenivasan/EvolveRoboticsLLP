import Config from 'react-native-config';
import { getApp } from '@react-native-firebase/app';
import { initializeAppCheck } from '@react-native-firebase/app-check';

let activation: Promise<void> | null = null;

function readDebugToken(): string | undefined {
  const token = Config.APP_CHECK_DEBUG_TOKEN;
  if (typeof token === 'string' && token.trim().length > 0) {
    return token.trim();
  }
  return undefined;
}

/**
 * Activate Firebase App Check once at process start.
 * Debug builds use the debug provider (register token in Firebase Console).
 * Release builds use Play Integrity / App Attest (+ DeviceCheck fallback).
 */
export function activateAppCheck(): Promise<void> {
  if (activation) {
    return activation;
  }

  activation = (async () => {
    const debugToken = readDebugToken();

    await initializeAppCheck(getApp(), {
      // Object form avoids the broken class export types in RN Firebase 24.
      provider: {
        providerOptions: {
          android: {
            provider: __DEV__ ? 'debug' : 'playIntegrity',
            ...(debugToken ? { debugToken } : {}),
          },
          apple: {
            provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
            ...(debugToken ? { debugToken } : {}),
          },
        },
      },
      isTokenAutoRefreshEnabled: true,
    });
  })().catch(error => {
    activation = null;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[AppCheck] activation failed', error);
    }
    throw error;
  });

  return activation;
}
