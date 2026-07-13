import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronRight, FolderKanban } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';
import type { Project } from '../../store/content/types/projects.types';

type ProjectCardProps = {
  project: Project;
  onPress?: () => void;
};

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const imageUri = project.imageUri?.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open project ${project.title}`}>
      <View style={styles.iconWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        ) : (
          <FolderKanban size={28} color={colors.primary} strokeWidth={2} />
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {project.title}
        </Text>
        {project.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {project.subtitle}
          </Text>
        ) : null}
      </View>

      {onPress ? (
        <ChevronRight
          size={20}
          color={colors.textMuted}
          strokeWidth={2}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    lineHeight: 18,
  },
});

export default React.memo(ProjectCard);
