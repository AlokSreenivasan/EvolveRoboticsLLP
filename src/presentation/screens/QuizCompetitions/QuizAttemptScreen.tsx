import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle2, Circle } from 'lucide-react-native';

import AppButton from '../../../components/AppButton';
import BackButton from '../../../components/BackButton';
import QuizAlertModal from '../../../components/QuizCompetitions/QuizAlertModal';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  cardShadow,
  cardShadowElevated,
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../../constants/theme';
import { createQuizAttempt } from '../../../services/firebase/quizAttemptsService';
import { canAttemptQuiz, canRetryQuizAttempt } from '../../../utils/quizAccess';
import { useQuizAttempts } from '../../hooks/useQuizAttempts';
import { useQuizCompetition } from '../../hooks/useQuizCompetition';
import { useQuizCompetitions } from '../../hooks/useQuizCompetitions';
import type { ExamQuestion } from '../../../store/content/types/exams.types';
import type { RootStackParamList } from '../../../types/navigation';

type QuizAttemptRoute = RouteProp<RootStackParamList, 'QuizAttempt'>;

function formatMinutes(timerSeconds: number): number {
  if (typeof timerSeconds !== 'number' || !Number.isFinite(timerSeconds)) {
    return 0;
  }
  return Math.max(0, Math.trunc(timerSeconds / 60));
}

function formatTimeMMSS(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.trunc(totalSeconds))
    : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

function QuizAttemptScreen() {
  const navigation = useNavigation();
  const route = useRoute<QuizAttemptRoute>();
  const quizId = route.params?.quizId ?? '';
  const startRetry = route.params?.startRetry === true;

  const { quiz, loading, error } = useQuizCompetition(quizId);
  const { quizzes, loading: quizzesLoading } = useQuizCompetitions();
  const {
    completedQuizIds,
    attemptByQuizId,
    loading: attemptsLoading,
  } = useQuizAttempts();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(startRetry);
  const [resultModal, setResultModal] = useState<{
    reason: 'manual' | 'timeout';
    correctCount: number;
    totalQuestions: number;
    percentage: number;
    xpEarned: number;
    isPerfect: boolean;
  } | null>(null);
  const [submitErrorModal, setSubmitErrorModal] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questionCount = quiz?.questions?.length ?? 0;
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const accessLoading = quizzesLoading || attemptsLoading;
  const existingAttempt = attemptByQuizId.get(quizId);
  const isAlreadyCompleted = completedQuizIds.has(quizId);
  const canRetry = isAlreadyCompleted && canRetryQuizAttempt(existingAttempt);

  const canStartAttempt =
    !quizzesLoading &&
    !attemptsLoading &&
    quiz != null &&
    (!isAlreadyCompleted || (canRetry && isRetrying)) &&
    canAttemptQuiz(quizId, quizzes, completedQuizIds, attemptByQuizId);

  useEffect(() => {
    if (!quiz || !canStartAttempt) {
      return;
    }

    setAnswers({});
    setSubmitting(false);
    submittedRef.current = false;
    setRemainingSeconds(quiz.timerSeconds);

    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    tickRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev == null) {
          return prev;
        }
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [canStartAttempt, quiz]);

  const handleSelect = useCallback(
    (questionId: string, choiceIndex: number) => {
      if (submittedRef.current) {
        return;
      }
      setAnswers(prev => ({ ...prev, [questionId]: choiceIndex }));
    },
    [],
  );

  const renderChoice = useCallback(
    (questionId: string, choiceIndex: number, label: string) => {
      const selected = answers[questionId] === choiceIndex;
      const Icon = selected ? CheckCircle2 : Circle;

      return (
        <TouchableOpacity
          key={`${questionId}_${choiceIndex}`}
          style={[styles.choiceRow, selected && styles.choiceRowSelected]}
          activeOpacity={0.85}
          onPress={() => handleSelect(questionId, choiceIndex)}
          accessibilityRole="button"
          accessibilityLabel={`Select option ${String.fromCharCode(
            65 + choiceIndex,
          )}`}>
          <Icon
            size={18}
            color={selected ? colors.primary : colors.textMuted}
            strokeWidth={2.5}
          />
          <Text style={styles.choiceText}>
            {String.fromCharCode(65 + choiceIndex)}. {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [answers, handleSelect],
  );

  const renderQuestion = useCallback(
    ({ item, index }: { item: ExamQuestion; index: number }) => (
      <View style={styles.questionCard}>
        <Text style={styles.questionIndex}>Question {index + 1}</Text>
        <Text style={styles.questionPrompt}>{item.prompt}</Text>
        <View style={styles.choices}>
          {item.choices.map((choice, idx) =>
            renderChoice(item.id, idx, choice.text),
          )}
        </View>
      </View>
    ),
    [renderChoice],
  );

  const keyExtractor = useCallback((item: ExamQuestion) => item.id, []);

  const canSubmit = questionCount > 0 && answeredCount === questionCount;

  const finishSubmission = useCallback(
    async (reason: 'manual' | 'timeout') => {
      if (!quiz) {
        return;
      }
      if (submittedRef.current || submitting) {
        return;
      }

      submittedRef.current = true;
      setSubmitting(true);

      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }

      const total = questionCount;

      try {
        const result = await createQuizAttempt({
          quizId: quiz.id,
          answers,
        });

        const correct = result.correctCount;
        const percentage = result.percentage;
        const xpEarned = result.xpEarned;
        const isPerfect = total > 0 && correct === total;

        setResultModal({
          reason,
          correctCount: correct,
          totalQuestions: total,
          percentage,
          xpEarned,
          isPerfect,
        });
      } catch (submitError) {
        submittedRef.current = false;
        setSubmitErrorModal(
          String((submitError as Error)?.message ?? submitError),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [answers, questionCount, quiz, submitting],
  );

  const handleResultClose = useCallback(() => {
    setResultModal(null);
    navigation.goBack();
  }, [navigation]);

  const handleResultRetry = useCallback(() => {
    setResultModal(null);
    submittedRef.current = false;
    setIsRetrying(true);
  }, []);

  const handleSubmitErrorClose = useCallback(() => {
    setSubmitErrorModal(null);
    submittedRef.current = false;
  }, []);

  const handleSubmit = useCallback(async () => {
    await finishSubmission('manual');
  }, [finishSubmission]);

  useEffect(() => {
    if (!quiz) {
      return;
    }
    if (remainingSeconds == null) {
      return;
    }
    if (remainingSeconds > 0) {
      return;
    }
    finishSubmission('timeout');
  }, [finishSubmission, quiz, remainingSeconds]);

  const timeLabel =
    remainingSeconds == null ? '' : formatTimeMMSS(remainingSeconds);

  if (loading || accessLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>Quiz</Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load quiz</Text>
          <Text style={styles.messageText}>
            {error ?? 'This quiz was not found.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const showCompletionGate =
    !resultModal && !submitting && !submitErrorModal;

  if (isAlreadyCompleted && !canRetry && showCompletionGate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>{quiz.title}</Text>
        </View>

        <QuizAlertModal
          visible
          variant="completed"
          message={
            existingAttempt
              ? `You scored ${existingAttempt.correctCount}/${existingAttempt.totalQuestions} (${existingAttempt.percentage}%). Earned ${existingAttempt.xpEarned} XP. You achieved a perfect score.`
              : 'You have already completed this quiz.'
          }
          correctCount={existingAttempt?.correctCount}
          totalQuestions={existingAttempt?.totalQuestions}
          percentage={existingAttempt?.percentage}
          xpEarned={existingAttempt?.xpEarned}
          onClose={handleResultClose}
        />
      </SafeAreaView>
    );
  }

  if (isAlreadyCompleted && canRetry && !isRetrying && showCompletionGate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>{quiz.title}</Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Quiz completed</Text>
          <Text style={styles.messageText}>
            {existingAttempt
              ? `Last score: ${existingAttempt.correctCount}/${existingAttempt.totalQuestions} (${existingAttempt.percentage}%). Score 100% to earn ${quiz.xpValue} XP.`
              : 'You can retry this quiz to reach a perfect score and earn XP.'}
          </Text>
          <AppButton
            title="Retry quiz"
            onPress={() => setIsRetrying(true)}
            variant="primary"
            buttonStyle={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (resultModal) {
    const quizIndex = quizzes.findIndex(item => item.id === quizId);
    const nextQuiz =
      quizIndex >= 0 && quizIndex < quizzes.length - 1
        ? quizzes[quizIndex + 1]
        : null;

    const resultMessage = resultModal.isPerfect
      ? `You scored ${resultModal.correctCount}/${resultModal.totalQuestions} (${resultModal.percentage}%). Earned ${resultModal.xpEarned} XP.${
          nextQuiz
            ? ` "${nextQuiz.title}" is now unlocked.`
            : ' You unlocked the next quiz in the series.'
        }`
      : resultModal.reason === 'timeout'
        ? `You scored ${resultModal.correctCount}/${resultModal.totalQuestions} (${resultModal.percentage}%). Retry and score 100% to earn ${
            quiz.xpValue
          } XP and unlock${
            nextQuiz ? ` "${nextQuiz.title}"` : ' the next quiz'
          }.`
        : `You got ${resultModal.correctCount} of ${resultModal.totalQuestions} correct (${resultModal.percentage}%). Retry and score 100% to earn ${
            quiz.xpValue
          } XP and unlock${
            nextQuiz ? ` "${nextQuiz.title}"` : ' the next quiz'
          }.`;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow onPress={handleResultClose} />
          <Text style={styles.title}>{quiz.title}</Text>
        </View>

        <QuizAlertModal
          visible
          variant={resultModal.isPerfect ? 'passed' : 'failed'}
          reason={resultModal.reason}
          quizTitle={quiz.title}
          nextQuizTitle={nextQuiz?.title ?? null}
          xpValue={quiz.xpValue}
          message={resultMessage}
          correctCount={resultModal.correctCount}
          totalQuestions={resultModal.totalQuestions}
          percentage={resultModal.percentage}
          xpEarned={resultModal.xpEarned}
          actionLabel={resultModal.isPerfect ? 'Continue' : undefined}
          onClose={
            resultModal.isPerfect ? handleResultClose : handleResultRetry
          }
        />
      </SafeAreaView>
    );
  }

  if (!canStartAttempt) {
    const quizIndex = quizzes.findIndex(item => item.id === quizId);
    const previousQuiz = quizIndex > 0 ? quizzes[quizIndex - 1] : null;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>{quiz.title}</Text>
        </View>
        <QuizAlertModal
          visible
          variant="locked"
          previousQuizTitle={previousQuiz?.title ?? null}
          message={
            previousQuiz
              ? `Score 100% on "${previousQuiz.title}" to unlock this quiz.`
              : 'Score 100% on the previous quiz to unlock this one.'
          }
          onClose={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>{quiz.title}</Text>
        {quiz.description.trim() ? (
          <Text style={styles.description}>{quiz.description.trim()}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          {questionCount} questions • {formatMinutes(quiz.timerSeconds)} min • {quiz.xpValue} XP on 100%
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.progress}>
            Answered {Math.min(answeredCount, questionCount)}/{questionCount}
          </Text>
          <Text
            style={[
              styles.timer,
              remainingSeconds != null && remainingSeconds <= 15
                ? styles.timerDanger
                : null,
            ]}>
            Time left {timeLabel}
          </Text>
        </View>
      </View>

      <FlatList
        data={quiz.questions}
        keyExtractor={keyExtractor}
        renderItem={renderQuestion}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...VERTICAL_LIST_PERF}
      />

      <View style={styles.footer}>
        <AppButton
          title={
            submitting
              ? 'Submitting…'
              : canSubmit
                ? 'Submit'
                : 'Answer all questions'
          }
          onPress={handleSubmit}
          disabled={!canSubmit || submitting || submittedRef.current}
          variant="primary"
          buttonStyle={[
            styles.submitButton,
            (!canSubmit || submitting || submittedRef.current) &&
              styles.submitButtonDisabled,
          ]}
        />
      </View>

      {submitErrorModal ? (
        <QuizAlertModal
          visible
          variant="error"
          message={submitErrorModal}
          onClose={handleSubmitErrorClose}
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
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.cardRadiusLg,
    borderBottomRightRadius: spacing.cardRadiusLg,
    ...glassBorder,
    ...cardShadowLight,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 20,
  },
  description: {
    marginTop: 6,
    ...typography.bodySecondary,
  },
  subtitle: {
    marginTop: 4,
    ...typography.bodySecondary,
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.chipRadius,
  },
  timer: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timerDanger: {
    color: colors.danger,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 120,
  },
  loader: {
    marginVertical: 40,
  },
  messageCard: {
    margin: spacing.screenHorizontal,
    padding: 20,
    borderRadius: spacing.cardRadiusLg,
    backgroundColor: colors.surface,
    ...glassBorder,
    ...cardShadow,
  },
  messageTitle: {
    ...typography.cardTitle,
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 4,
  },
  questionCard: {
    padding: 16,
    borderRadius: spacing.cardRadiusLg,
    backgroundColor: colors.surface,
    marginBottom: 14,
    ...glassBorder,
    ...cardShadow,
  },
  questionIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentBlue,
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  questionPrompt: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 12,
  },
  choices: {
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: spacing.inputRadius,
    backgroundColor: colors.background,
    ...glassBorder,
    ...cardShadowLight,
  },
  choiceRowSelected: {
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 18,
    paddingTop: 14,
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.cardRadiusLg,
    borderTopRightRadius: spacing.cardRadiusLg,
    ...glassBorder,
    ...cardShadowElevated,
  },
  submitButton: {},
  submitButtonDisabled: {
    opacity: 0.55,
  },
});

export default QuizAttemptScreen;
