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
import { FolderKanban } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import { colors, spacing } from '../../../constants/theme';
import type { RootStackParamList } from '../../../types/navigation';

type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailRouteProp>();
  const { project } = route.params;
  const imageUri = project.imageUri?.trim();
  const description = project.description?.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.media}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <FolderKanban size={40} color={colors.primary} strokeWidth={2} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{project.title}</Text>
          {project.subtitle ? (
            <Text style={styles.subtitle}>{project.subtitle}</Text>
          ) : null}

          <View style={styles.requirementsSection}>
            <Text style={styles.sectionHeading}>Project Requirements</Text>
            {description ? (
              <Text style={styles.requirementsText}>{description}</Text>
            ) : (
              <Text style={styles.emptyRequirements}>
                Requirements for this project will be shared soon.
              </Text>
            )}
          </View>
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
  media: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.primaryLight,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
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
});

export default ProjectDetailScreen;
