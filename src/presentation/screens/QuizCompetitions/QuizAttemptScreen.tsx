import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle2, Circle } from 'lucide-react-native';

import AppButton from '../../../components/AppButton';
import BackButton from '../../../components/BackButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import { createQuizAttempt } from '../../../services/firebase/quizAttemptsService';
import { computeQuizXpEarned } from '../../../utils/gamification/computeUserStreakStats';
import { canAttemptQuiz } from '../../../utils/quizAccess';
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
  const [isRetrying, setIsRetrying] = useState(false);
  const submittedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questionCount = quiz?.questions?.length ?? 0;
  const quizQuestions = quiz?.questions ?? [];
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const accessLoading = quizzesLoading || attemptsLoading;
  const existingAttempt = attemptByQuizId.get(quizId);
  const isAlreadyCompleted = completedQuizIds.has(quizId);
  const canRetry = isAlreadyCompleted && quiz?.allowRetry === true;

  const canStartAttempt =
    !quizzesLoading &&
    !attemptsLoading &&
    quiz != null &&
    (!isAlreadyCompleted || (canRetry && isRetrying)) &&
    canAttemptQuiz(quizId, quizzes, completedQuizIds);

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
      const correct = quizQuestions.reduce((count, question) => {
        const selected = answers[question.id];
        return selected === question.correctChoiceIndex ? count + 1 : count;
      }, 0);
      const xpEarned = computeQuizXpEarned(quiz.xpValue, correct, total);

      try {
        await createQuizAttempt({
          quizId: quiz.id,
          answers,
          correctCount: correct,
          totalQuestions: total,
          xpEarned,
        });

        Alert.alert(
          reason === 'timeout' ? 'Time up' : 'Submitted',
          `Score: ${correct}/${total} (${total > 0 ? Math.round((correct / total) * 100) : 0}%)\n+${xpEarned} XP earned`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } catch (submitError) {
        submittedRef.current = false;
        Alert.alert(
          'Submit failed',
          String((submitError as Error)?.message ?? submitError),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [answers, navigation, questionCount, quiz, quizQuestions, submitting],
  );

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

  if (isAlreadyCompleted && !canRetry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>{quiz.title}</Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Already completed</Text>
          <Text style={styles.messageText}>
            {existingAttempt
              ? `You scored ${existingAttempt.correctCount}/${existingAttempt.totalQuestions} (${existingAttempt.percentage}%). This quiz does not allow retries.`
              : 'You have already completed this quiz.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isAlreadyCompleted && canRetry && !isRetrying) {
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
              ? `Last score: ${existingAttempt.correctCount}/${existingAttempt.totalQuestions} (${existingAttempt.percentage}%). You earned ${existingAttempt.xpEarned} XP. You can retry this quiz to improve your score.`
              : 'You can retry this quiz.'}
          </Text>
          <AppButton
            title="Retry quiz"
            onPress={() => setIsRetrying(true)}
            buttonStyle={styles.retryButton}
            textStyle={styles.retryText}
          />
        </View>
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
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Quiz locked</Text>
          <Text style={styles.messageText}>
            {previousQuiz
              ? `Complete "${previousQuiz.title}" first to unlock this quiz.`
              : 'Complete the previous quiz first to unlock this one.'}
          </Text>
        </View>
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
          {questionCount} questions • {formatMinutes(quiz.timerSeconds)} min • {quiz.xpValue} XP
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
          buttonStyle={[
            styles.submitButton,
            (!canSubmit || submitting || submittedRef.current) &&
              styles.submitButtonDisabled,
          ]}
          textStyle={styles.submitText}
        />
      </View>
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  progress: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  questionCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  questionIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentBlue,
    marginBottom: 8,
  },
  questionPrompt: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
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
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
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
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default QuizAttemptScreen;
