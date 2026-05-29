import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import CourseVideoPlayer from '../../../components/Courses/CourseVideoPlayer';
import { colors, spacing } from '../../../constants/theme';
import { recordPlaylistVideoProgress } from '../../../services/firebase/continueLearningProgressService';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';

type CourseVideoRouteProp = RouteProp<RootStackParamList, 'CourseVideo'>;

function CourseVideoScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<CourseVideoRouteProp>();
  const { playlist, videoId, videoTitle, videoIndex } = route.params;

  useEffect(() => {
    void recordPlaylistVideoProgress(
      playlist.id,
      videoIndex + 1,
      playlist.videoCount,
    ).catch(() => undefined);
  }, [playlist.id, playlist.videoCount, videoIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlist.title}
        </Text>
      </View>

      <View style={styles.playerSection}>
        <CourseVideoPlayer key={videoId} videoId={videoId} />
        <View style={styles.playingMeta}>
          <Text style={styles.lessonBadge}>
            Lesson {videoIndex + 1} of {playlist.videoCount}
          </Text>
          <Text style={styles.playingTitle}>{videoTitle}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.link,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  playerSection: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  playingMeta: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 14,
    paddingBottom: 16,
  },
  lessonBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  playingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
  },
});

export default CourseVideoScreen;
