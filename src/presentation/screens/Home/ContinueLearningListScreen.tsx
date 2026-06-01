import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { ContinueLearningPlaylist } from '../../../store/content/types/continueLearningPlaylists.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useHomeFeedFocus } from '../../context/HomeFeedContext';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';

function ContinueLearningListScreen() {
  useHomeFeedFocus();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { playlists, loading, error } = useContinueLearningPlaylists();
  const { getVideosWatched } = useContinueLearningProgress();

  const renderPlaylist = useCallback(
    ({ item, index }: { item: ContinueLearningPlaylist; index: number }) => (
      <ContinueLearningCard
        variant="list"
        playlist={item}
        videosWatched={getVideosWatched(item.id)}
        accentIndex={index}
        onPress={() => navigation.navigate('CoursePlaylist', { playlist: item })}
      />
    ),
    [getVideosWatched, navigation],
  );

  const keyExtractor = useCallback(
    (item: ContinueLearningPlaylist) => item.id,
    [],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load videos</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No course videos yet</Text>
        <Text style={styles.messageText}>
          New playlists will appear here once they are published.
        </Text>
      </View>
    );
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          ← Back
        </Text>
        <Text style={styles.title}>Continue learning</Text>
        <Text style={styles.subtitle}>
          Pick up where you left off with your course videos.
        </Text>
      </View>

      <FlatList
        data={loading || error ? [] : playlists}
        keyExtractor={keyExtractor}
        renderItem={renderPlaylist}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...VERTICAL_LIST_PERF}
      />
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  loader: {
    marginVertical: 40,
  },
  messageCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ContinueLearningListScreen;
