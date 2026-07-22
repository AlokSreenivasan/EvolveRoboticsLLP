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
import Markdown from 'react-native-markdown-display';

import BackButton from '../../../components/BackButton';
import { colors, spacing } from '../../../constants/theme';
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
      <View style={styles.header}>
        <BackButton withSpacingBelow />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.title}>{project.title}</Text>
          {project.subtitle ? (
            <Text style={styles.subtitle}>{project.subtitle}</Text>
          ) : null}

          {description ? (
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionHeading}>
                {markdownUrl ? 'Summary' : 'Project Requirements'}
              </Text>
              <Text style={styles.requirementsText}>{description}</Text>
            </View>
          ) : null}

          {markdownUrl ? (
            <View style={styles.markdownSection}>
              <Text style={styles.sectionHeading}>Project page</Text>
              {markdownLoading ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : null}
              {markdownError ? (
                <Text style={styles.emptyRequirements}>{markdownError}</Text>
              ) : null}
              {markdownBody ? (
                <Markdown style={markdownStyles}>{markdownBody}</Markdown>
              ) : null}
              {!markdownLoading && !markdownError && !markdownBody ? (
                <Text style={styles.emptyRequirements}>
                  This project page is empty.
                </Text>
              ) : null}
            </View>
          ) : null}

          {!description && !markdownUrl ? (
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionHeading}>Project Requirements</Text>
              <Text style={styles.emptyRequirements}>
                Requirements for this project will be shared soon.
              </Text>
            </View>
          ) : null}

          {imageUris.length > 0 ? (
            <View style={styles.imagesSection}>
              <Text style={styles.sectionHeading}>Images</Text>
              <View style={styles.imagesStack}>
                {imageUris.map((uri, index) => (
                  <Image
                    key={`${index}-${uri.slice(-24)}`}
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
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 8,
  },
  heading2: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  heading3: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: colors.primaryLight,
    color: colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  fence: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  link: {
    color: colors.primary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  body: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 22,
  },
  requirementsSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markdownSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagesSection: {
    marginTop: 16,
  },
  imagesStack: {
    gap: 12,
  },
  stackedImage: {
    width: '100%',
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.primaryLight,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  requirementsText: {
    fontSize: 15,
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
    marginVertical: 16,
  },
});

export default ProjectDetailScreen;
