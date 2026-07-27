import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AlertCircle, BookOpen, FolderKanban } from 'lucide-react-native';

import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import ProjectCard from '../../../components/Projects/ProjectCard';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { ContinueLearningPlaylist } from '../../../store/content/types/continueLearningPlaylists.types';
import type { Project } from '../../../store/content/types/projects.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import { useHomeFeedFocus } from '../../context/HomeFeedContext';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useContinueLearningProgress } from '../../hooks/useContinueLearningProgress';
import { useProjects } from '../../hooks/useProjects';

type ToDoTab = 'learn' | 'project';

const TAB_OPTIONS = [
  { key: 'learn' as const, label: 'Learn' },
  { key: 'project' as const, label: 'Project' },
];

function ToDoScreen() {
  useHomeFeedFocus();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ToDo'>>();
  const [activeTab, setActiveTab] = useState<ToDoTab>(
    route.params?.tab ?? 'learn',
  );

  const { playlists, loading: playlistsLoading, error: playlistsError } =
    useContinueLearningPlaylists();
  const { getVideosWatched } = useContinueLearningProgress();
  const { projects, loading: projectsLoading, error: projectsError } =
    useProjects();

  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const isLearnTab = activeTab === 'learn';
  const loading = isLearnTab ? playlistsLoading : projectsLoading;
  const error = isLearnTab ? playlistsError : projectsError;

  const renderLearnItem = useCallback(
    ({ item }: { item: ContinueLearningPlaylist }) => (
      <ContinueLearningCard
        variant="list"
        playlist={item}
        videosWatched={getVideosWatched(item.id)}
        onPress={() => navigation.navigate('CoursePlaylist', { playlist: item })}
      />
    ),
    [getVideosWatched, navigation],
  );

  const renderProjectItem = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        onPress={() => navigation.navigate('ProjectDetail', { project: item })}
      />
    ),
    [navigation],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title={isLearnTab ? 'Could not load lessons' : 'Could not load projects'}
          message="Pull to refresh or try again in a moment."
          Icon={AlertCircle}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title={isLearnTab ? 'No lessons yet' : 'No projects yet'}
        message={
          isLearnTab
            ? 'New lesson playlists will appear here once they are published.'
            : 'New projects will appear here once they are published.'
        }
        Icon={isLearnTab ? BookOpen : FolderKanban}
      />
    );
  }, [error, isLearnTab, loading]);

  const listProps = {
    ListEmptyComponent: listEmpty,
    contentContainerStyle: styles.scrollContent,
    showsVerticalScrollIndicator: false as const,
    ...VERTICAL_LIST_PERF,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="To Do"
        subtitle="Lessons and projects in one place."
      />

      <View style={styles.tabWrap}>
        <SegmentedControl
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {isLearnTab ? (
        <FlatList
          data={playlistsLoading || playlistsError ? [] : playlists}
          keyExtractor={item => item.id}
          renderItem={renderLearnItem}
          {...listProps}
        />
      ) : (
        <FlatList
          data={projectsLoading || projectsError ? [] : projects}
          keyExtractor={item => item.id}
          renderItem={renderProjectItem}
          {...listProps}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabWrap: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 4,
    paddingBottom: 24,
    flexGrow: 1,
  },
});

export default ToDoScreen;
