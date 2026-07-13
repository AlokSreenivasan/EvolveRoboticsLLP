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

import BackButton from '../../../components/BackButton';
import ProjectCard from '../../../components/Projects/ProjectCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { Project } from '../../../store/content/types/projects.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useProjects } from '../../hooks/useProjects';

function ProjectsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, projects, loading, error } = useProjects();

  const renderProject = useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        onPress={() => navigation.navigate('ProjectDetail', { project: item })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load projects</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No projects yet</Text>
        <Text style={styles.messageText}>
          New projects will appear here once they are published.
        </Text>
      </View>
    );
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>{section.sectionTitle}</Text>
        {section.sectionSubtitle?.trim() ? (
          <Text style={styles.subtitle}>{section.sectionSubtitle.trim()}</Text>
        ) : null}
      </View>

      <FlatList
        data={loading || error ? [] : projects}
        keyExtractor={keyExtractor}
        renderItem={renderProject}
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

export default ProjectsScreen;
