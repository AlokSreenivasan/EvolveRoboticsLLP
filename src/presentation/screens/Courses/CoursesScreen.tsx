import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import HomeSectionHeader from '../../../components/Home/HomeSectionHeader';
import { colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';

function CoursesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { playlists, loading } = useContinueLearningPlaylists();
  const { getVideosWatched } = useContinueLearningProgress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          ← Back
        </Text>
        <Text style={styles.title}>Courses</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <HomeSectionHeader title="All courses" />
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : playlists.length === 0 ? (
          <Text style={styles.empty}>
            Course playlists will appear here once they are published.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {playlists.map((playlist, index) => (
              <ContinueLearningCard
                key={playlist.id}
                playlist={playlist}
                videosWatched={getVideosWatched(playlist.id)}
                accentIndex={index}
                onPress={() =>
                  navigation.navigate('CoursePlaylist', { playlist })
                }
              />
            ))}
          </ScrollView>
        )}
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
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    fontSize: 16,
    color: colors.link,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 32,
  },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  horizontalList: {
    paddingRight: 4,
  },
});

export default CoursesScreen;
