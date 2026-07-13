import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { BookOpen, FolderKanban } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import ContinueLearningCard from '../../../components/Home/ContinueLearningCard';
import ProjectCard from '../../../components/Projects/ProjectCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { cardShadowLight, colors, spacing } from '../../../constants/theme';
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

type TabConfig = {
  key: ToDoTab;
  label: string;
  icon: typeof BookOpen;
};

const TABS: TabConfig[] = [
  { key: 'learn', label: 'Learn', icon: BookOpen },
  { key: 'project', label: 'Project', icon: FolderKanban },
];

type ToDoTabBarProps = {
  activeTab: ToDoTab;
  onTabChange: (tab: ToDoTab) => void;
};

function ToDoTabBar({ activeTab, onTabChange }: ToDoTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.85}
            onPress={() => onTabChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}>
            <Icon
              size={18}
              color={isActive ? colors.primary : colors.textMuted}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            {isLearnTab ? 'Could not load lessons' : 'Could not load projects'}
          </Text>
          <Text style={styles.messageText}>
            Pull to refresh or try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>
          {isLearnTab ? 'No lessons yet' : 'No projects yet'}
        </Text>
        <Text style={styles.messageText}>
          {isLearnTab
            ? 'New lesson playlists will appear here once they are published.'
            : 'New projects will appear here once they are published.'}
        </Text>
      </View>
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
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>To Do</Text>
        <Text style={styles.headerSubtitle}>
          Lessons and projects in one place.
        </Text>
        <ToDoTabBar activeTab={activeTab} onTabChange={setActiveTab} />
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
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ECEEF2',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...cardShadowLight,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
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
    marginTop: 8,
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

export default ToDoScreen;
