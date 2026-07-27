import React, { useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import type { ExamAttempt } from '../../../services/firebase/examAttemptsService';
import { useExamAttempts } from '../../hooks/useExamAttempts';

function formatSubmittedAt(attempt: ExamAttempt): string {
  const dt = attempt.submittedAt?.toDate?.();
  if (!dt) {
    return '';
  }
  return dt.toLocaleString();
}

function ExamAttemptsScreen() {
  const { attempts, loading, error } = useExamAttempts();

  const renderAttempt = useCallback(
    ({ item }: { item: ExamAttempt }) => (
      <SurfaceCard elevation="light" style={styles.card}>
        <View style={styles.iconBox}>
          <ClipboardCheck size={20} color={colors.primary} strokeWidth={2.5} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Exam attempt</Text>
          <Text style={styles.cardMeta}>
            Score: {item.correctCount}/{item.totalQuestions} ({item.percentage}%)
          </Text>
          {formatSubmittedAt(item) ? (
            <Text style={styles.cardSubtle}>{formatSubmittedAt(item)}</Text>
          ) : null}
        </View>
      </SurfaceCard>
    ),
    [],
  );

  const keyExtractor = useCallback((item: ExamAttempt) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load results"
          message="Go back and try again in a moment."
          Icon={ClipboardCheck}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="No attempts yet"
        message="Submit an exam and your results will appear here."
        Icon={ClipboardCheck}
      />
    );
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="My exam results"
        subtitle="Your latest submitted attempts."
      />
      <FlatList
        data={loading || error ? [] : attempts}
        keyExtractor={keyExtractor}
        renderItem={renderAttempt}
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
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
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
    ...typography.cardTitle,
    fontSize: 15,
  },
  cardMeta: {
    marginTop: 6,
    ...typography.bodySecondary,
  },
  cardSubtle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default ExamAttemptsScreen;
