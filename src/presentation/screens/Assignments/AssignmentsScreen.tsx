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
import { ClipboardList } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import PdfContentCard from '../../../components/Content/PdfContentCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { Assignment } from '../../../store/content/types/assignments.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useAssignments } from '../../hooks/useAssignments';

function AssignmentsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, assignments, loading, error } = useAssignments();

  const renderAssignment = useCallback(
    ({ item, index }: { item: Assignment; index: number }) => (
      <PdfContentCard
        title={item.title}
        subtitle={item.subtitle}
        badgeLabel={
          item.dueDateLabel.trim() ? item.dueDateLabel.trim() : undefined
        }
        accentIndex={index}
        Icon={ClipboardList}
        onPress={() =>
          navigation.navigate('ResourcePdfViewer', {
            title: item.title,
            pdfUrl: item.pdfUrl,
          })
        }
        accessibilityLabel={`Assignment ${item.title}`}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load assignments</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No assignments yet</Text>
        <Text style={styles.messageText}>
          New assignments will appear here once your instructors publish them.
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
        data={loading || error ? [] : assignments}
        keyExtractor={keyExtractor}
        renderItem={renderAssignment}
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

export default AssignmentsScreen;
