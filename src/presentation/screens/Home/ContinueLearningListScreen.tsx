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
import { colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';

function ContinueLearningListScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { playlists, loading, error } = useContinueLearningPlaylists();
  const { getVideosWatched } = useContinueLearningProgress();

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Could not load videos</Text>
            <Text style={styles.messageText}>
              Go back and try again in a moment.
            </Text>
          </View>
        ) : playlists.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No course videos yet</Text>
            <Text style={styles.messageText}>
              New playlists will appear here once they are published.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {playlists.map((playlist, index) => (
              <ContinueLearningCard
                key={playlist.id}
                variant="list"
                playlist={playlist}
                videosWatched={getVideosWatched(playlist.id)}
                accentIndex={index}
                onPress={() =>
                  navigation.navigate('CoursePlaylist', { playlist })
                }
              />
            ))}
          </View>
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
  },
  loader: {
    marginVertical: 40,
  },
  list: {
    width: '100%',
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
