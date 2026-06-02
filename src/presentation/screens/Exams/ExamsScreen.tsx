import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClipboardCheck, FileText } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { Exam } from '../../../store/content/types/exams.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useExams } from '../../hooks/useExams';

function formatMinutes(timerSeconds: number): number {
  if (typeof timerSeconds !== 'number' || !Number.isFinite(timerSeconds)) {
    return 0;
  }
  return Math.max(0, Math.trunc(timerSeconds / 60));
}

function ExamsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { exams, loading, error } = useExams();

  const renderExam = useCallback(
    ({ item }: { item: Exam }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ExamAttempt', { examId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`Exam ${item.title}`}>
        <View style={styles.cardIcon}>
          <FileText size={20} color={colors.primary} strokeWidth={2.5} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description.trim() ? (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.description.trim()}
            </Text>
          ) : null}
          <Text style={styles.cardMeta}>
            {item.questions.length} questions • {formatMinutes(item.timerSeconds)} min
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Exam) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load exams</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No exams yet</Text>
        <Text style={styles.messageText}>
          Exams will appear here once your instructors publish them.
        </Text>
      </View>
    );
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Exams</Text>
            <Text style={styles.subtitle}>
              Attempt published exams within the given time.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.resultsButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ExamAttempts')}
            accessibilityRole="button"
            accessibilityLabel="View my exam results">
            <ClipboardCheck size={16} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.resultsButtonText}>Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={loading || error ? [] : exams}
        keyExtractor={keyExtractor}
        renderItem={renderExam}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleText: {
    flex: 1,
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
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  resultsButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
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
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default ExamsScreen;

