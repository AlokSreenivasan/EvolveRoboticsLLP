import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import MarkdownDocument from '../../../components/Markdown/MarkdownDocument';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import type { RootStackParamList } from '../../../types/navigation';

type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailRouteProp>();
  const { project } = route.params;
  const imageUris = useMemo(() => {
    if (project.imageUris?.length) {
      return project.imageUris.map(uri => uri.trim()).filter(Boolean);
    }
    const legacy = project.imageUri?.trim();
    return legacy ? [legacy] : [];
  }, [project.imageUri, project.imageUris]);
  const description = project.description?.trim();
  const markdownUrl = project.markdownUrl?.trim();

  const [markdownBody, setMarkdownBody] = useState<string | null>(null);
  const [markdownLoading, setMarkdownLoading] = useState(Boolean(markdownUrl));
  const [markdownError, setMarkdownError] = useState<string | null>(null);
  /** Natural width/height so any aspect ratio shows fully (no 16:9 crop). */
  const [imageAspectRatios, setImageAspectRatios] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!markdownUrl) {
      setMarkdownBody(null);
      setMarkdownLoading(false);
      setMarkdownError(null);
      return;
    }

    let cancelled = false;
    setMarkdownLoading(true);
    setMarkdownError(null);

    fetch(markdownUrl)
      .then(async response => {
        if (!response.ok) {
          throw new Error('Could not load the project page.');
        }
        return response.text();
      })
      .then(text => {
        if (!cancelled) {
          setMarkdownBody(text);
          setMarkdownLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkdownError('Could not load the project Markdown page.');
          setMarkdownLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [markdownUrl]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={project.title}
        subtitle={project.subtitle ?? undefined}
        compact
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {description ? (
            <SurfaceCard elevation="default" style={styles.requirementsSection}>
              <Text style={styles.sectionHeading}>
                {markdownUrl ? 'Summary' : 'Project Requirements'}
              </Text>
              <Text style={styles.requirementsText}>{description}</Text>
            </SurfaceCard>
          ) : null}

          {markdownUrl ? (
            <SurfaceCard elevation="flat" style={styles.markdownDocument}>
              {markdownLoading ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : null}
              {markdownError ? (
                <Text style={styles.emptyRequirements}>{markdownError}</Text>
              ) : null}
              {markdownBody ? (
                <MarkdownDocument
                  content={markdownBody}
                  documentUrl={markdownUrl}
                />
              ) : null}
              {!markdownLoading && !markdownError && !markdownBody ? (
                <Text style={styles.emptyRequirements}>
                  This project page is empty.
                </Text>
              ) : null}
            </SurfaceCard>
          ) : null}

          {!description && !markdownUrl ? (
            <SurfaceCard elevation="default" style={styles.requirementsSection}>
              <Text style={styles.sectionHeading}>Project Requirements</Text>
              <Text style={styles.emptyRequirements}>
                Requirements for this project will be shared soon.
              </Text>
            </SurfaceCard>
          ) : null}

          {imageUris.length > 0 ? (
            <View style={styles.imagesSection}>
              <Text style={styles.sectionHeading}>Images</Text>
              <View style={styles.imagesStack}>
                {imageUris.map((uri, index) => (
                  <SurfaceCard
                    key={`${index}-${uri.slice(-24)}`}
                    elevation="light"
                    clipped
                    style={styles.imageCard}>
                    <Image
                      source={{ uri }}
                      style={[
                        styles.stackedImage,
                        {
                          aspectRatio: imageAspectRatios[uri] ?? 16 / 9,
                        },
                      ]}
                      resizeMode="contain"
                      onLoad={event => {
                        const { width, height } = event.nativeEvent.source;
                        if (width > 0 && height > 0) {
                          setImageAspectRatios(prev =>
                            prev[uri] === width / height
                              ? prev
                              : { ...prev, [uri]: width / height },
                          );
                        }
                      }}
                      accessibilityLabel={`Project image ${index + 1}`}
                    />
                  </SurfaceCard>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    gap: 12,
  },
  requirementsSection: {
    padding: 16,
  },
  markdownDocument: {
    paddingHorizontal: spacing.screenHorizontal + 8,
    paddingVertical: 24,
    borderRadius: spacing.cardRadiusLg,
  },
  imagesSection: {
    marginTop: 4,
  },
  imagesStack: {
    gap: 12,
  },
  imageCard: {
    borderRadius: spacing.cardRadiusLg,
  },
  stackedImage: {
    width: '100%',
    backgroundColor: colors.primaryLight,
  },
  sectionHeading: {
    ...typography.sectionTitle,
    marginBottom: 12,
  },
  requirementsText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  emptyRequirements: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: 24,
  },
});

export default ProjectDetailScreen;
