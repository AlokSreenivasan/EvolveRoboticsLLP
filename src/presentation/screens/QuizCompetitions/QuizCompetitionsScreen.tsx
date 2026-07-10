import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Lock } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import QuizCompetitionIcon from '../../../components/Home/icons/QuizCompetitionIcon';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { QuizCompetition } from '../../../store/content/types/quizCompetitions.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { getQuizAccessStatus } from '../../../utils/quizAccess';
import { useQuizAttempts } from '../../hooks/useQuizAttempts';
import { useQuizCompetitions } from '../../hooks/useQuizCompetitions';

function formatMinutes(timerSeconds: number): number {
  if (typeof timerSeconds !== 'number' || !Number.isFinite(timerSeconds)) {
    return 0;
  }
  return Math.max(0, Math.trunc(timerSeconds / 60));
}

function QuizCompetitionsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { quizzes, loading, error } = useQuizCompetitions();
  const {
    completedQuizIds,
    attemptByQuizId,
    loading: attemptsLoading,
    error: attemptsError,
  } = useQuizAttempts();

  const handleQuizPress = useCallback(
    (quiz: QuizCompetition, index: number) => {
      const status = getQuizAccessStatus(
        quiz,
        index,
        quizzes,
        completedQuizIds,
      );

      if (status === 'locked') {
        const previousQuiz = index > 0 ? quizzes[index - 1] : null;
        Alert.alert(
          'Quiz locked',
          previousQuiz
            ? `Complete "${previousQuiz.title}" first to unlock this quiz.`
            : 'Complete the previous quiz first to unlock this one.',
        );
        return;
      }

      if (status === 'completed') {
        const attempt = attemptByQuizId.get(quiz.id);
        Alert.alert(
          'Already completed',
          attempt
            ? `You scored ${attempt.correctCount}/${attempt.totalQuestions} (${attempt.percentage}%). Earned ${attempt.xpEarned} XP. This quiz does not allow retries.`
            : 'You have already completed this quiz.',
        );
        return;
      }

      navigation.navigate('QuizAttempt', { quizId: quiz.id });
    },
    [attemptByQuizId, completedQuizIds, navigation, quizzes],
  );

  const renderQuiz = useCallback(
    ({ item, index }: { item: QuizCompetition; index: number }) => {
      const status = getQuizAccessStatus(
        item,
        index,
        quizzes,
        completedQuizIds,
      );
      const attempt = attemptByQuizId.get(item.id);
      const isLocked = status === 'locked';
      const isCompleted = status === 'completed';
      const isRetryable = status === 'retryable';

      return (
        <TouchableOpacity
          style={[
            styles.card,
            isLocked && styles.cardLocked,
            (isCompleted || isRetryable) && styles.cardCompleted,
          ]}
          activeOpacity={isLocked ? 1 : 0.85}
          onPress={() => handleQuizPress(item, index)}
          accessibilityRole="button"
          accessibilityLabel={`Quiz ${item.title}${
            isLocked
              ? ', locked'
              : isCompleted
                ? ', completed'
                : isRetryable
                  ? ', retry available'
                  : ', available'
          }`}
          accessibilityState={{ disabled: isLocked }}>
          <View
            style={[
              styles.cardIcon,
              isLocked && styles.cardIconLocked,
              (isCompleted || isRetryable) && styles.cardIconCompleted,
            ]}>
            {isLocked ? (
              <Lock size={20} color={colors.textMuted} strokeWidth={2.5} />
            ) : isCompleted || isRetryable ? (
              <CheckCircle2
                size={22}
                color={colors.accentGreen}
                strokeWidth={2.5}
              />
            ) : (
              <QuizCompetitionIcon
                size={22}
                color={colors.accentBlue}
                strokeWidth={2.5}
              />
            )}
          </View>
          <View style={styles.cardText}>
            <View style={styles.cardTitleRow}>
              <Text
                style={[
                  styles.cardTitle,
                  isLocked && styles.cardTitleLocked,
                ]}>
                {index + 1}. {item.title}
              </Text>
              {isLocked ? (
                <View style={styles.statusBadgeLocked}>
                  <Text style={styles.statusBadgeTextLocked}>Locked</Text>
                </View>
              ) : isCompleted ? (
                <View style={styles.statusBadgeCompleted}>
                  <Text style={styles.statusBadgeTextCompleted}>Done</Text>
                </View>
              ) : isRetryable ? (
                <View style={styles.statusBadgeRetry}>
                  <Text style={styles.statusBadgeTextRetry}>Retry</Text>
                </View>
              ) : (
                <View style={styles.statusBadgeAvailable}>
                  <Text style={styles.statusBadgeTextAvailable}>Start</Text>
                </View>
              )}
            </View>
            {item.description.trim() ? (
              <Text
                style={[
                  styles.cardSubtitle,
                  isLocked && styles.cardSubtitleLocked,
                ]}
                numberOfLines={2}>
                {item.description.trim()}
              </Text>
            ) : null}
            <Text
              style={[
                styles.cardMeta,
                isLocked && styles.cardMetaLocked,
              ]}>
              {item.questions.length} questions • {formatMinutes(item.timerSeconds)} min • {item.xpValue} XP
              {(isCompleted || isRetryable) && attempt
                ? ` • Score ${attempt.correctCount}/${attempt.totalQuestions} • ${attempt.xpEarned} XP`
                : ''}
            </Text>
            {isLocked ? (
              <Text style={styles.lockedHint}>
                Complete quiz {index} to unlock
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [attemptByQuizId, completedQuizIds, handleQuizPress, quizzes],
  );

  const keyExtractor = useCallback((item: QuizCompetition) => item.id, []);

  const isLoading = loading || attemptsLoading;
  const loadError = error ?? attemptsError;

  const listEmpty = useCallback(() => {
    if (isLoading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (loadError) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load quizzes</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No quizzes yet</Text>
        <Text style={styles.messageText}>
          Quiz competitions will appear here once your instructors publish them.
        </Text>
      </View>
    );
  }, [isLoading, loadError]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>Quiz competition</Text>
        <Text style={styles.subtitle}>
          Complete quizzes in order. Each quiz unlocks after the previous one is
          finished.
        </Text>
      </View>

      <FlatList
        data={isLoading || loadError ? [] : quizzes}
        keyExtractor={keyExtractor}
        renderItem={renderQuiz}
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
  cardLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.92,
  },
  cardCompleted: {
    borderColor: '#C8E6C9',
    backgroundColor: '#F9FFF9',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconLocked: {
    backgroundColor: '#ECEFF1',
    borderColor: colors.border,
  },
  cardIconCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  cardText: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardTitleLocked: {
    color: colors.textMuted,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardSubtitleLocked: {
    color: colors.textMuted,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardMetaLocked: {
    color: '#B0B7C3',
  },
  lockedHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statusBadgeLocked: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#ECEFF1',
  },
  statusBadgeTextLocked: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusBadgeCompleted: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#E8F5E9',
  },
  statusBadgeTextCompleted: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  statusBadgeAvailable: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#E8F4FD',
  },
  statusBadgeTextAvailable: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  statusBadgeRetry: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFF8E1',
  },
  statusBadgeTextRetry: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57F17',
  },
});

export default QuizCompetitionsScreen;
