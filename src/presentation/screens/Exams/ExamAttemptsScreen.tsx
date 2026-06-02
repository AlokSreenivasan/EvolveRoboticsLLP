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
import { ClipboardCheck } from 'lucide-react-native';

import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { ExamAttempt } from '../../../services/firebase/examAttemptsService';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useExamAttempts } from '../../hooks/useExamAttempts';

function formatSubmittedAt(attempt: ExamAttempt): string {
  const dt = attempt.submittedAt?.toDate?.();
  if (!dt) {
    return '';
  }
  return dt.toLocaleString();
}

function ExamAttemptsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { attempts, loading, error } = useExamAttempts();

  const renderAttempt = useCallback(
    ({ item }: { item: ExamAttempt }) => (
      <View style={styles.card}>
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
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: ExamAttempt) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load results</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No attempts yet</Text>
        <Text style={styles.messageText}>
          Submit an exam and your results will appear here.
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
        <Text style={styles.title}>My exam results</Text>
        <Text style={styles.subtitle}>Your latest submitted attempts.</Text>
      </View>

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
  iconBox: {
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
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardSubtle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default ExamAttemptsScreen;

