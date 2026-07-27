import React, { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Lock } from 'lucide-react-native';

import QuizAlertModal from '../../../components/QuizCompetitions/QuizAlertModal';
import QuizCompetitionIcon from '../../../components/Home/icons/QuizCompetitionIcon';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
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
  const [alertModal, setAlertModal] = useState<{
    variant: 'locked' | 'completed';
    message: string;
    previousQuizTitle?: string | null;
    correctCount?: number;
    totalQuestions?: number;
    percentage?: number;
    xpEarned?: number;
  } | null>(null);

  const handleAlertClose = useCallback(() => {
    setAlertModal(null);
  }, []);

  const handleQuizPress = useCallback(
    (quiz: QuizCompetition, index: number) => {
      const status = getQuizAccessStatus(
        quiz,
        index,
        quizzes,
        completedQuizIds,
        attemptByQuizId,
      );

      if (status === 'locked') {
        const previousQuiz = index > 0 ? quizzes[index - 1] : null;
        setAlertModal({
          variant: 'locked',
          previousQuizTitle: previousQuiz?.title ?? null,
          message: previousQuiz
            ? `Score 100% on "${previousQuiz.title}" to unlock this quiz.`
            : 'Score 100% on the previous quiz to unlock this one.',
        });
        return;
      }

      if (status === 'completed') {
        const attempt = attemptByQuizId.get(quiz.id);
        setAlertModal({
          variant: 'completed',
          message: attempt
            ? `You scored ${attempt.correctCount}/${attempt.totalQuestions} (${attempt.percentage}%). Earned ${attempt.xpEarned} XP. You achieved a perfect score.`
            : 'You have already completed this quiz.',
          correctCount: attempt?.correctCount,
          totalQuestions: attempt?.totalQuestions,
          percentage: attempt?.percentage,
          xpEarned: attempt?.xpEarned,
        });
        return;
      }

      navigation.navigate('QuizAttempt', {
        quizId: quiz.id,
        ...(status === 'retryable' ? { startRetry: true } : {}),
      });
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
        attemptByQuizId,
      );
      const attempt = attemptByQuizId.get(item.id);
      const isLocked = status === 'locked';
      const isCompleted = status === 'completed';
      const isRetryable = status === 'retryable';

      return (
        <TouchableOpacity
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
          <SurfaceCard
            elevation="light"
            tinted={isCompleted || isRetryable}
            style={[
              styles.card,
              isLocked && styles.cardLocked,
              (isCompleted || isRetryable) && styles.cardCompleted,
            ]}>
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
                {item.questions.length} questions • {formatMinutes(item.timerSeconds)} min • {item.xpValue} XP on 100%
                {(isCompleted || isRetryable) && attempt
                  ? ` • Score ${attempt.correctCount}/${attempt.totalQuestions}${
                      isCompleted ? ` • ${attempt.xpEarned} XP` : ''
                    }`
                  : ''}
              </Text>
              {isLocked ? (
                <Text style={styles.lockedHint}>
                  Score 100% on quiz {index} to unlock
                </Text>
              ) : null}
            </View>
          </SurfaceCard>
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
      return <ScreenStateCard variant="loading" />;
    }
    if (loadError) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load quizzes"
          message="Go back and try again in a moment."
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="No quizzes yet"
        message="Quiz competitions will appear here once your instructors publish them."
      />
    );
  }, [isLoading, loadError]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Quiz competition"
        subtitle="Complete quizzes in order. Each quiz unlocks only after you score 100% on the previous one. Retry any quiz where you did not score 100%."
      />

      <FlatList
        data={isLoading || loadError ? [] : quizzes}
        keyExtractor={keyExtractor}
        renderItem={renderQuiz}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...VERTICAL_LIST_PERF}
      />

      {alertModal ? (
        <QuizAlertModal
          visible
          variant={alertModal.variant}
          message={alertModal.message}
          previousQuizTitle={alertModal.previousQuizTitle}
          correctCount={alertModal.correctCount}
          totalQuestions={alertModal.totalQuestions}
          percentage={alertModal.percentage}
          xpEarned={alertModal.xpEarned}
          onClose={handleAlertClose}
        />
      ) : null}
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
  cardLocked: {
    backgroundColor: colors.background,
    opacity: 0.92,
  },
  cardCompleted: {
    borderColor: colors.successLight,
    backgroundColor: colors.successLight,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconLocked: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  cardIconCompleted: {
    backgroundColor: colors.successLight,
    borderColor: colors.successLight,
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
    ...typography.cardTitle,
    fontSize: 15,
  },
  cardTitleLocked: {
    color: colors.textMuted,
  },
  cardSubtitle: {
    marginTop: 4,
    ...typography.bodySecondary,
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
    color: colors.textMuted,
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
    backgroundColor: colors.border,
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
    backgroundColor: colors.successLight,
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
    backgroundColor: colors.primaryLight,
  },
  statusBadgeTextAvailable: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadgeRetry: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.warningLight,
  },
  statusBadgeTextRetry: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentOrange,
  },
});

export default QuizCompetitionsScreen;
