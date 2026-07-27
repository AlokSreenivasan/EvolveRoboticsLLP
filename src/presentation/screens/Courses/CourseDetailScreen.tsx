import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import { courseTrackLabel } from '../../../store/content/types/courses.types';
import type { RootStackParamList } from '../../../types/navigation';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;

function CourseDetailScreen() {
  const route = useRoute<CourseDetailRouteProp>();
  const { course } = route.params;

  const imageUri = course.imageUri?.trim();
  const subtitle = course.subtitle?.trim();
  const duration = course.durationLabel?.trim();
  const description = course.description?.trim();
  const trackLabel = course.track ? courseTrackLabel(course.track) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={course.title} compact />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.heroImage}
              accessibilityLabel={`${course.title} cover`}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}
          {duration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {trackLabel ? (
            <View style={styles.trackChip}>
              <Text style={styles.trackChipText}>{trackLabel}</Text>
            </View>
          ) : null}

          <SurfaceCard elevation="default" style={styles.descriptionSection}>
            <Text style={styles.sectionHeading}>About this course</Text>
            {description ? (
              <Text style={styles.descriptionText}>{description}</Text>
            ) : (
              <Text style={styles.emptyDescription}>
                More details about this course will be shared soon.
              </Text>
            )}
          </SurfaceCard>
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
    paddingBottom: 32,
  },
  heroWrap: {
    position: 'relative',
    height: 220,
    backgroundColor: colors.primaryMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    left: spacing.screenHorizontal,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.chipRadius,
    backgroundColor: colors.primaryLight,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  body: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 20,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 22,
  },
  trackChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.chipRadius,
    backgroundColor: colors.primaryLight,
  },
  trackChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  descriptionSection: {
    marginTop: 16,
    padding: 16,
  },
  sectionHeading: {
    ...typography.sectionTitle,
    marginBottom: 12,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default CourseDetailScreen;
