import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { FileWarning } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import { appAlertButtons, appAlertCopy } from '../../../constants/appAlertCopy';
import {
  colors,
  secondaryButtonStyle,
  spacing,
  typography,
} from '../../../constants/theme';
import type { RootStackParamList } from '../../../types/navigation';
import { appAlert } from '../../../utils/alert/appAlert';
import {
  nextPdfViewerMode,
  resolvePdfViewerUrl,
  type PdfViewerMode,
} from '../../../utils/resources/pdfViewerUrl';

type ResourcePdfRoute = RouteProp<RootStackParamList, 'ResourcePdfViewer'>;

function ResourcePdfViewerScreen() {
  const route = useRoute<ResourcePdfRoute>();
  const { title, pdfUrl, showOpenInBrowser = true } = route.params;
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewerMode, setViewerMode] = useState<PdfViewerMode>('google');
  const [reloadToken, setReloadToken] = useState(0);
  const viewerModeRef = useRef<PdfViewerMode>('google');

  const trimmedPdfUrl = pdfUrl.trim();
  const viewerUrl = useMemo(
    () => resolvePdfViewerUrl(trimmedPdfUrl, viewerMode),
    [trimmedPdfUrl, viewerMode],
  );

  useEffect(() => {
    if (!trimmedPdfUrl) {
      setLoading(false);
      setHasError(true);
    }
  }, [trimmedPdfUrl]);

  const openExternally = useCallback(async () => {
    if (!trimmedPdfUrl) {
      appAlert(
        appAlertCopy.learner.pdfOpenFailedTitle,
        appAlertCopy.learner.pdfOpenFailedMessage,
      );
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(trimmedPdfUrl);
      if (!canOpen) {
        throw new Error('unsupported');
      }
      await Linking.openURL(trimmedPdfUrl);
    } catch {
      appAlert(
        appAlertCopy.learner.pdfOpenFailedTitle,
        appAlertCopy.learner.pdfOpenFailedMessage,
      );
    }
  }, [trimmedPdfUrl]);

  const handleViewerFailure = useCallback(() => {
    const fallback = nextPdfViewerMode(viewerModeRef.current);
    if (fallback) {
      viewerModeRef.current = fallback;
      setViewerMode(fallback);
      setLoading(true);
      setHasError(false);
      return;
    }

    setLoading(false);
    setHasError(true);
  }, []);

  const retryViewer = useCallback(() => {
    viewerModeRef.current = 'google';
    setViewerMode('google');
    setHasError(false);
    setLoading(true);
    setReloadToken(token => token + 1);
  }, []);

  const openExternalLink = showOpenInBrowser ? (
    <TouchableOpacity
      onPress={openExternally}
      activeOpacity={0.85}
      accessibilityRole="link"
      accessibilityLabel="Open in browser">
      <Text style={styles.openExternal}>Open in browser</Text>
    </TouchableOpacity>
  ) : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={title}
        rightSlot={openExternalLink}
        compact
      />

      <View style={styles.viewerWrap}>
        {hasError ? (
          <ScreenStateCard
            variant="error"
            title="Could not load PDF"
            message={
              showOpenInBrowser
                ? 'The in-app preview failed. Try again, or open the file in your browser.'
                : 'The in-app preview failed. Try again in a moment.'
            }
            Icon={FileWarning}
            style={styles.errorCard}>
            <TouchableOpacity
              onPress={retryViewer}
              style={styles.retryButton}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Try again">
              <Text style={styles.retryText}>{appAlertButtons.tryAgain}</Text>
            </TouchableOpacity>
            {showOpenInBrowser ? (
              <TouchableOpacity
                onPress={openExternally}
                style={styles.secondaryAction}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open in browser">
                <Text style={styles.secondaryActionText}>Open in browser</Text>
              </TouchableOpacity>
            ) : null}
          </ScreenStateCard>
        ) : (
          <>
            {loading ? (
              <ActivityIndicator
                color={colors.primary}
                style={styles.loader}
                size="large"
              />
            ) : null}
            {viewerUrl ? (
              <WebView
                key={`${viewerMode}-${reloadToken}`}
                source={{ uri: viewerUrl }}
                onLoadStart={() => {
                  setLoading(true);
                  setHasError(false);
                }}
                onLoadEnd={() => setLoading(false)}
                onError={handleViewerFailure}
                onHttpError={handleViewerFailure}
                style={styles.webview}
                allowsInlineMediaPlayback
              />
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  openExternal: {
    ...typography.label,
    color: colors.link,
  },
  viewerWrap: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loader: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 2,
  },
  errorCard: {
    marginHorizontal: spacing.screenHorizontal,
    marginTop: 24,
  },
  retryButton: {
    ...secondaryButtonStyle,
    marginTop: 12,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
  },
  secondaryAction: {
    marginTop: 10,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryActionText: {
    ...typography.label,
    color: colors.link,
    fontSize: 14,
  },
});

export default ResourcePdfViewerScreen;
