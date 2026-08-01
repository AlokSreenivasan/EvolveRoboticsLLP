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
import { createExamAttempt } from '../../../services/firebase/examAttemptsService';
import { useExam } from '../../hooks/useExam';
import type { ExamQuestion } from '../../../store/content/types/exams.types';
import type { RootStackParamList } from '../../../types/navigation';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type ExamAttemptRoute = RouteProp<RootStackParamList, 'ExamAttempt'>;

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

function ExamAttemptScreen() {
  const navigation = useNavigation();
  const route = useRoute<ExamAttemptRoute>();
  const examId = route.params?.examId ?? '';

  const { exam, loading, error } = useExam(examId);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questionCount = exam?.questions?.length ?? 0;
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const loadedExamId = exam?.id ?? null;
  const examTimerSecondsRef = useRef<number | null>(null);
  examTimerSecondsRef.current = exam?.timerSeconds ?? null;

  // Reset attempt state only when a different exam loads.
  useEffect(() => {
    if (loadedExamId == null) {
      return;
    }

    setAnswers({});
    setSubmitting(false);
    setStarted(false);
    submittedRef.current = false;
    setRemainingSeconds(null);

    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [loadedExamId]);

  // Start the countdown only after the learner confirms on the pre-start screen.
  // Timer seconds are read through a ref so later exam-doc edits don't restart it.
  useEffect(() => {
    if (!started || examTimerSecondsRef.current == null) {
      return;
    }

    setRemainingSeconds(examTimerSecondsRef.current);

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
  }, [started]);

  const handleStartExam = useCallback(() => {
    setStarted(true);
  }, []);

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
      if (!exam) {
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
        const result = await createExamAttempt({
          examId: exam.id,
          answers,
        });

        const correct = result.correctCount;
        const percentage = result.percentage;

        appAlert(
          reason === 'timeout'
            ? appAlertCopy.learner.examTimeUpTitle
            : appAlertCopy.learner.examSubmittedTitle,
          appAlertCopy.learner.examScoreMessage(correct, total, percentage),
          [{ text: appAlertButtons.continue, onPress: () => navigation.goBack() }],
        );
      } catch (submitError) {
        submittedRef.current = false;
        appAlert(
          appAlertCopy.learner.examSubmitFailedTitle,
          String((submitError as Error)?.message ?? submitError),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [answers, exam, navigation, questionCount, submitting],
  );

  const handleSubmit = useCallback(async () => {
    await finishSubmission('manual');
  }, [finishSubmission]);

  useEffect(() => {
    if (!exam || !started) {
      return;
    }
    if (remainingSeconds == null) {
      return;
    }
    if (remainingSeconds > 0) {
      return;
    }
    finishSubmission('timeout');
  }, [exam, finishSubmission, remainingSeconds, started]);

  const timeLabel =
    remainingSeconds == null ? '' : formatTimeMMSS(remainingSeconds);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !exam) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>Exam</Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load exam</Text>
          <Text style={styles.messageText}>
            {error ?? 'The exam was not found.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!started) {
    const description = exam.description.trim();

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton withSpacingBelow />
          <Text style={styles.title}>{exam.title}</Text>
          <Text style={styles.subtitle}>
            {questionCount} questions • {formatMinutes(exam.timerSeconds)} min
          </Text>
        </View>

        <View style={styles.preStartBody}>
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Before you start</Text>
            {description ? (
              <Text style={styles.messageText}>{description}</Text>
            ) : (
              <Text style={styles.messageText}>
                Answer all questions before time runs out. The timer starts when
                you begin.
              </Text>
            )}
            <Text style={styles.preStartMeta}>
              {questionCount} questions • {formatMinutes(exam.timerSeconds)}{' '}
              minute{formatMinutes(exam.timerSeconds) === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Start exam"
            onPress={handleStartExam}
            variant="primary"
            buttonStyle={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>{exam.title}</Text>
        <Text style={styles.subtitle}>
          {questionCount} questions • {formatMinutes(exam.timerSeconds)} min
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
        data={exam.questions}
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
          buttonStyle={styles.submitButton}
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
  },
  preStartBody: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 120,
  },
  preStartMeta: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
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
    color: colors.primary,
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
});

export default ExamAttemptScreen;

