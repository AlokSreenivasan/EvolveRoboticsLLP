import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import QuizAlertModal from '../QuizCompetitions/QuizAlertModal';
import HomeFeaturePanel from './HomeFeaturePanel';
import HomeSectionHeader from './HomeSectionHeader';
import QuizCompetitionIcon from './icons/QuizCompetitionIcon';
import QuizRobotIllustration from './icons/QuizRobotIllustration';
import { colors } from '../../constants/theme';
import type { QuizCompetition } from '../../store/content/types/quizCompetitions.types';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import { getQuizAccessStatus } from '../../utils/quizAccess';
import { useQuizAttempts } from '../../presentation/hooks/useQuizAttempts';
import { useQuizCompetitions } from '../../presentation/hooks/useQuizCompetitions';

function formatMinutes(timerSeconds: number): number {
  if (typeof timerSeconds !== 'number' || !Number.isFinite(timerSeconds)) {
    return 0;
  }
  return Math.max(0, Math.trunc(timerSeconds / 60));
}

function getFeaturedQuizIndex(
  quizzes: QuizCompetition[],
  completedQuizIds: Set<string>,
  attemptByQuizId: ReturnType<typeof useQuizAttempts>['attemptByQuizId'],
): number {
  const actionableIndex = quizzes.findIndex((quiz, index) => {
    const status = getQuizAccessStatus(
      quiz,
      index,
      quizzes,
      completedQuizIds,
      attemptByQuizId,
    );
    return status === 'available' || status === 'retryable';
  });

  if (actionableIndex >= 0) {
    return actionableIndex;
  }

  return quizzes.length > 0 ? 0 : -1;
}

type QuizCompetitionHomePanelProps = {
  /** Renders inside Lessons with tighter top spacing. */
  embedded?: boolean;
};

function QuizCompetitionHomePanel({
  embedded = false,
}: QuizCompetitionHomePanelProps) {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { quizzes, loading, error } = useQuizCompetitions();
  const {
    completedQuizIds,
    attemptByQuizId,
    loading: attemptsLoading,
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

  const featuredIndex = useMemo(
    () => getFeaturedQuizIndex(quizzes, completedQuizIds, attemptByQuizId),
    [attemptByQuizId, completedQuizIds, quizzes],
  );

  const featuredQuiz = featuredIndex >= 0 ? quizzes[featuredIndex] : null;

  const status = featuredQuiz
    ? getQuizAccessStatus(
        featuredQuiz,
        featuredIndex,
        quizzes,
        completedQuizIds,
        attemptByQuizId,
      )
    : null;

  const attempt = featuredQuiz
    ? attemptByQuizId.get(featuredQuiz.id)
    : undefined;

  const ctaLabel = useMemo(() => {
    switch (status) {
      case 'locked':
        return 'Locked';
      case 'completed':
        return 'Done';
      case 'retryable':
        return 'Retry';
      case 'available':
        return attempt ? 'Resume' : 'Join Now';
      default:
        return 'Join Now';
    }
  }, [attempt, status]);

  const handlePanelPress = useCallback(() => {
    navigation.navigate('QuizCompetitions');
  }, [navigation]);

  const handleCtaPress = useCallback(() => {
    if (!featuredQuiz || featuredIndex < 0 || status == null) {
      return;
    }

    if (status === 'locked') {
      const previousQuiz = featuredIndex > 0 ? quizzes[featuredIndex - 1] : null;
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
      quizId: featuredQuiz.id,
      ...(status === 'retryable' ? { startRetry: true } : {}),
    });
  }, [attempt, featuredIndex, featuredQuiz, navigation, quizzes, status]);

  if (loading || attemptsLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={[styles.loader, embedded && styles.loaderEmbedded]}
      />
    );
  }

  if (error || !featuredQuiz || status == null) {
    return null;
  }

  return (
    <View style={embedded ? styles.embeddedWrap : undefined}>
      {embedded ? (
        <HomeSectionHeader title="Quiz competition" />
      ) : null}
      <HomeFeaturePanel
        badgeLabel={`Quiz ${featuredIndex + 1}`}
        categoryLabel={embedded ? '' : 'Quiz competition'}
        categoryIcon={
          embedded ? null : (
            <QuizCompetitionIcon
              size={13}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          )
        }
        title={featuredQuiz.title}
        subtitle={featuredQuiz.description.trim() || null}
        metaLabel={`${featuredQuiz.questions.length} questions • ${formatMinutes(featuredQuiz.timerSeconds)} min • ${featuredQuiz.xpValue} XP`}
        ctaLabel={ctaLabel}
        imageFallback={
          <View style={styles.iconWrap}>
            <QuizCompetitionIcon
              size={26}
              color={colors.primary}
              strokeWidth={2.25}
            />
          </View>
        }
        illustration={<QuizRobotIllustration size={92} />}
        onPress={handlePanelPress}
        onCtaPress={handleCtaPress}
        ctaDisabled={status === 'locked'}
        accessibilityLabel={`Quiz competition: ${featuredQuiz.title}`}
      />

      <QuizAlertModal
        visible={alertModal != null}
        variant={alertModal?.variant ?? 'locked'}
        message={alertModal?.message ?? ''}
        previousQuizTitle={alertModal?.previousQuizTitle}
        correctCount={alertModal?.correctCount}
        totalQuestions={alertModal?.totalQuestions}
        percentage={alertModal?.percentage}
        xpEarned={alertModal?.xpEarned}
        onClose={() => setAlertModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  embeddedWrap: {
    marginTop: 0,
  },
  loader: {
    marginVertical: 12,
  },
  loaderEmbedded: {
    marginTop: 16,
    marginBottom: 0,
  },
  iconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
});

export default React.memo(QuizCompetitionHomePanel);
