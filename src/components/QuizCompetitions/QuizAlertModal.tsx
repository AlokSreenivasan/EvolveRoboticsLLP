import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Unlock,
} from 'lucide-react-native';

import { colors } from '../../constants/theme';
import {
  QuizModalAction,
  QuizModalBadge,
  QuizModalHero,
  QuizModalInsightChip,
  QuizModalScorePanel,
  QuizModalShell,
  styles,
  type QuizScoreTone,
} from './quizModalShared';

export type QuizAlertVariant =
  | 'locked'
  | 'completed'
  | 'error'
  | 'passed'
  | 'failed';

export type QuizAlertModalProps = {
  visible: boolean;
  variant: QuizAlertVariant;
  message: string;
  onClose: () => void;
  previousQuizTitle?: string | null;
  nextQuizTitle?: string | null;
  quizTitle?: string;
  reason?: 'manual' | 'timeout';
  xpValue?: number;
  correctCount?: number;
  totalQuestions?: number;
  percentage?: number;
  xpEarned?: number;
  actionLabel?: string;
};

function QuizAlertModal({
  visible,
  variant,
  message,
  onClose,
  previousQuizTitle,
  nextQuizTitle,
  quizTitle,
  reason = 'manual',
  xpValue,
  correctCount,
  totalQuestions,
  percentage,
  xpEarned,
  actionLabel,
}: QuizAlertModalProps) {
  const config = useMemo(() => {
    if (variant === 'locked') {
      return {
        title: 'Quiz locked',
        subtitle: previousQuizTitle
          ? `Complete "${previousQuizTitle}" first`
          : 'Complete the previous quiz first',
        Icon: Lock,
        iconColor: colors.textMuted,
        heroVariant: 'locked' as const,
        buttonLabel: actionLabel ?? 'Got it',
        buttonTone: 'primary' as const,
        scoreTone: 'primary' as QuizScoreTone,
      };
    }

    if (variant === 'completed') {
      return {
        title: 'Already completed',
        subtitle: 'You achieved a perfect score on this quiz.',
        Icon: CheckCircle2,
        iconColor: '#fff',
        heroVariant: 'completed' as const,
        buttonLabel: actionLabel ?? 'Got it',
        buttonTone: 'primary' as const,
        scoreTone: 'success' as QuizScoreTone,
      };
    }

    if (variant === 'passed') {
      if (nextQuizTitle) {
        return {
          title: 'Next Quiz Unlocked',
          subtitle: quizTitle
            ? `You scored 100% on "${quizTitle}". "${nextQuizTitle}" is now available.`
            : `"${nextQuizTitle}" is now available.`,
          Icon: Unlock,
          iconColor: '#fff',
          heroVariant: 'perfect' as const,
          buttonLabel: actionLabel ?? 'Continue',
          buttonTone: 'primary' as const,
          scoreTone: 'success' as QuizScoreTone,
        };
      }

      return {
        title: 'Quiz completed',
        subtitle: quizTitle
          ? `Perfect score on "${quizTitle}".`
          : 'You achieved a perfect score on this quiz.',
        Icon: CheckCircle2,
        iconColor: '#fff',
        heroVariant: 'perfect' as const,
        buttonLabel: actionLabel ?? 'Continue',
        buttonTone: 'primary' as const,
        scoreTone: 'success' as QuizScoreTone,
      };
    }

    if (variant === 'failed') {
      if (reason === 'timeout') {
        return {
          title: "Time's up!",
          subtitle: quizTitle
            ? `"${quizTitle}" was submitted automatically.`
            : 'Your answers have been submitted.',
          Icon: Clock,
          iconColor: colors.accentOrange,
          heroVariant: 'timeout' as const,
          buttonLabel: actionLabel ?? 'Retry quiz',
          buttonTone: 'primary' as const,
          scoreTone: 'warning' as QuizScoreTone,
        };
      }

      return {
        title: 'Quiz not passed',
        subtitle: quizTitle
          ? `Results for "${quizTitle}".`
          : 'Score 100% to unlock the next quiz.',
        Icon: Target,
        iconColor: colors.primary,
        heroVariant: 'partial' as const,
        buttonLabel: actionLabel ?? 'Retry quiz',
        buttonTone: 'primary' as const,
        scoreTone: 'warning' as QuizScoreTone,
      };
    }

    return {
      title: 'Submit failed',
      subtitle: 'Your answers could not be saved.',
      Icon: AlertTriangle,
      iconColor: colors.danger,
      heroVariant: 'error' as const,
      buttonLabel: actionLabel ?? 'Try again',
      buttonTone: 'danger' as const,
      scoreTone: 'warning' as QuizScoreTone,
    };
  }, [actionLabel, nextQuizTitle, previousQuizTitle, quizTitle, reason, variant]);

  const showScoreStats =
    (variant === 'completed' ||
      variant === 'passed' ||
      variant === 'failed') &&
    typeof correctCount === 'number' &&
    typeof totalQuestions === 'number';

  const incorrectCount =
    typeof correctCount === 'number' && typeof totalQuestions === 'number'
      ? Math.max(0, totalQuestions - correctCount)
      : 0;

  return (
    <QuizModalShell visible={visible} onClose={onClose}>
      <QuizModalHero
        variant={config.heroVariant}
        title={config.title}
        subtitle={config.subtitle}
        Icon={config.Icon}
        iconColor={config.iconColor}
      />

      <View style={styles.body}>
        {showScoreStats ? (
          <>
            <QuizModalScorePanel
              correctCount={correctCount}
              totalQuestions={totalQuestions}
              percentage={typeof percentage === 'number' ? percentage : 0}
              tone={config.scoreTone}
            />

            {variant === 'failed' ? (
              <View style={styles.insightRow}>
                <QuizModalInsightChip
                  tone="success"
                  label={`${correctCount} correct`}
                />
                <QuizModalInsightChip
                  tone={incorrectCount > 0 ? 'warning' : 'muted'}
                  label={`${incorrectCount} missed`}
                />
              </View>
            ) : null}

            <View style={styles.badgeRow}>
              {variant === 'passed' || variant === 'completed' ? (
                <>
                  <QuizModalBadge
                    tone="success"
                    icon={
                      <Trophy
                        size={14}
                        color={colors.accentGreen}
                        strokeWidth={2.25}
                      />
                    }
                    label="Perfect score"
                  />
                  {typeof xpEarned === 'number' && xpEarned > 0 ? (
                    <QuizModalBadge
                      tone="success"
                      icon={
                        <Sparkles
                          size={14}
                          color={colors.accentGreen}
                          strokeWidth={2.25}
                        />
                      }
                      label={`+${xpEarned} XP earned`}
                    />
                  ) : null}
                  {variant === 'passed' ? (
                    <QuizModalBadge
                      tone="success"
                      icon={
                        <Unlock
                          size={14}
                          color={colors.accentGreen}
                          strokeWidth={2.25}
                        />
                      }
                      label={
                        nextQuizTitle
                          ? `"${nextQuizTitle}" unlocked`
                          : 'Next Quiz Unlocked'
                      }
                    />
                  ) : null}
                </>
              ) : variant === 'failed' ? (
                <>
                  <QuizModalBadge
                    icon={
                      <RotateCcw
                        size={14}
                        color={colors.primary}
                        strokeWidth={2.25}
                      />
                    }
                    label="Retry available"
                  />
                  <QuizModalBadge
                    tone="warning"
                    icon={
                      <Unlock
                        size={14}
                        color={colors.accentOrange}
                        strokeWidth={2.25}
                      />
                    }
                    label="100% unlocks next quiz"
                  />
                  {typeof xpValue === 'number' && xpValue > 0 ? (
                    <QuizModalBadge
                      tone="warning"
                      icon={
                        <Sparkles
                          size={14}
                          color={colors.accentOrange}
                          strokeWidth={2.25}
                        />
                      }
                      label={`${xpValue} XP at 100%`}
                    />
                  ) : null}
                </>
              ) : null}
            </View>
          </>
        ) : variant === 'locked' ? (
          <View style={styles.badgeRow}>
            <QuizModalBadge
              tone="muted"
              icon={
                <Lock size={14} color={colors.textMuted} strokeWidth={2.25} />
              }
              label="100% required to unlock"
            />
            <QuizModalBadge
              icon={
                <Unlock size={14} color={colors.primary} strokeWidth={2.25} />
              }
              label="Complete in order"
            />
          </View>
        ) : null}

        <Text style={styles.message}>{message}</Text>

        <QuizModalAction
          label={config.buttonLabel}
          onPress={onClose}
          tone={config.buttonTone}
        />
      </View>
    </QuizModalShell>
  );
}

export default QuizAlertModal;
