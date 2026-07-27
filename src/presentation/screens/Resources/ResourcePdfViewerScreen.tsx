import React, { useMemo, useState } from 'react';
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
import { WebView } from 'react-native-webview';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import { colors, spacing, typography } from '../../../constants/theme';
import type { RootStackParamList } from '../../../types/navigation';
import { buildEmbeddedPdfViewerUrl } from '../../../utils/resources/pdfViewerUrl';

type ResourcePdfRoute = RouteProp<RootStackParamList, 'ResourcePdfViewer'>;

function ResourcePdfViewerScreen() {
  const route = useRoute<ResourcePdfRoute>();
  const { title, pdfUrl } = route.params;
  const [loading, setLoading] = useState(true);

  const viewerUrl = useMemo(() => buildEmbeddedPdfViewerUrl(pdfUrl), [pdfUrl]);

  const openExternally = () => {
    Linking.openURL(pdfUrl).catch(() => undefined);
  };

  const openExternalLink = (
    <TouchableOpacity
      onPress={openExternally}
      activeOpacity={0.85}
      accessibilityRole="link"
      accessibilityLabel="Open in browser">
      <Text style={styles.openExternal}>Open in browser</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={title}
        rightSlot={openExternalLink}
        compact
      />

      <View style={styles.viewerWrap}>
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.loader}
            size="large"
          />
        ) : null}
        <WebView
          source={{ uri: viewerUrl }}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          startInLoadingState
          style={styles.webview}
          allowsInlineMediaPlayback
        />
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
});

export default ResourcePdfViewerScreen;
