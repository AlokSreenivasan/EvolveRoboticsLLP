import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  LogOut,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { appAlertButtons } from '../../constants/appAlertCopy';
import { colors } from '../../constants/theme';
import type { AppAlertButtonConfig } from '../../utils/alert/appAlertHost';
import {
  QuizModalAction,
  QuizModalActionStack,
  QuizModalHero,
  QuizModalSecondaryAction,
  QuizModalShell,
  styles,
  type QuizModalHeroVariant,
} from '../QuizCompetitions/quizModalShared';

type AppAlertTone = 'success' | 'error' | 'warning' | 'info' | 'confirm';

type AppAlertModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AppAlertButtonConfig[];
  onClose: () => void;
};

function inferTone(
  title: string,
  buttons?: AppAlertButtonConfig[],
): AppAlertTone {
  const normalized = title.toLowerCase();

  if (
    buttons?.some(button => button.style === 'destructive') ||
    normalized.endsWith('?')
  ) {
    return 'confirm';
  }

  if (
    normalized.includes('could not') ||
    normalized.includes('cannot') ||
    normalized.includes('not saved') ||
    normalized.includes('invalid') ||
    normalized.includes('did not work') ||
    normalized.includes('not available')
  ) {
    return 'error';
  }

  if (
    normalized.includes('all set') ||
    normalized.includes('updated') ||
    normalized.includes('submitted') ||
    normalized.includes('sent') ||
    normalized.includes('deleted') ||
    normalized.includes('check your inbox') ||
    normalized.includes('progress reset') ||
    (normalized.includes('reset') && !normalized.includes('default'))
  ) {
    return 'success';
  }

  if (
    normalized.includes("time's up") ||
    normalized.includes('almost there')
  ) {
    return 'warning';
  }

  return 'info';
}

function resolveHeroConfig(
  tone: AppAlertTone,
  title: string,
): {
  variant: QuizModalHeroVariant;
  Icon: LucideIcon;
  iconColor: string;
} {
  if (tone === 'success') {
    return {
      variant: 'completed',
      Icon: CheckCircle2,
      iconColor: '#fff',
    };
  }

  if (tone === 'error') {
    return {
      variant: 'error',
      Icon: AlertTriangle,
      iconColor: colors.danger,
    };
  }

  if (tone === 'warning') {
    return {
      variant: 'timeout',
      Icon: Clock,
      iconColor: colors.accentOrange,
    };
  }

  if (tone === 'confirm') {
    const normalized = title.toLowerCase();
    if (normalized.includes('log out')) {
      return {
        variant: 'partial',
        Icon: LogOut,
        iconColor: colors.primary,
      };
    }
    if (normalized.includes('delete') || normalized.includes('remove')) {
      return {
        variant: 'partial',
        Icon: Trash2,
        iconColor: colors.primary,
      };
    }
    if (normalized.includes('send')) {
      return {
        variant: 'partial',
        Icon: Send,
        iconColor: colors.primary,
      };
    }
    if (normalized.includes('reset')) {
      return {
        variant: 'partial',
        Icon: RotateCcw,
        iconColor: colors.primary,
      };
    }
    return {
      variant: 'partial',
      Icon: HelpCircle,
      iconColor: colors.primary,
    };
  }

  return {
    variant: 'partial',
    Icon: Sparkles,
    iconColor: colors.primary,
  };
}

function resolvePrimaryLabel(
  tone: AppAlertTone,
  primaryButton?: AppAlertButtonConfig,
): string {
  if (primaryButton?.text) {
    return primaryButton.text;
  }

  if (tone === 'error') {
    return appAlertButtons.tryAgain;
  }

  if (tone === 'confirm' || tone === 'success') {
    return appAlertButtons.continue;
  }

  return appAlertButtons.gotIt;
}

function resolvePrimaryTone(
  tone: AppAlertTone,
  primaryButton: AppAlertButtonConfig | undefined,
  label: string,
): 'primary' | 'danger' {
  if (primaryButton?.style === 'destructive') {
    return 'danger';
  }

  if (label === appAlertButtons.logOut) {
    return 'primary';
  }

  if (tone === 'error' || label === appAlertButtons.tryAgain) {
    return 'danger';
  }

  return 'primary';
}

function AppAlertModal({
  visible,
  title,
  message,
  buttons,
  onClose,
}: AppAlertModalProps) {
  const tone = useMemo(() => inferTone(title, buttons), [buttons, title]);
  const hero = useMemo(() => resolveHeroConfig(tone, title), [tone, title]);

  const cancelButton = buttons?.find(button => button.style === 'cancel');
  const actionButtons =
    buttons?.filter(button => button.style !== 'cancel') ?? [];
  const primaryButton = actionButtons[0];

  const handlePrimaryPress = () => {
    onClose();
    primaryButton?.onPress?.();
  };

  const handleCancelPress = () => {
    onClose();
    cancelButton?.onPress?.();
  };

  const primaryLabel = resolvePrimaryLabel(tone, primaryButton);
  const primaryTone = resolvePrimaryTone(tone, primaryButton, primaryLabel);

  const heroSubtitle = useMemo(() => {
    if (!message) {
      return tone === 'success'
        ? 'You are all set to keep learning.'
        : '';
    }
    if (message.length <= 96) {
      return message;
    }
    return tone === 'error'
      ? 'Review the details below.'
      : 'See details below.';
  }, [message, tone]);

  return (
    <QuizModalShell visible={visible} onClose={onClose}>
      <QuizModalHero
        variant={hero.variant}
        title={title}
        subtitle={heroSubtitle}
        Icon={hero.Icon}
        iconColor={hero.iconColor}
      />

      <View style={styles.body}>
        {message && message.length > 96 ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}

        <QuizModalActionStack>
          {cancelButton ? (
            <QuizModalSecondaryAction
              label={cancelButton.text ?? appAlertButtons.cancel}
              onPress={handleCancelPress}
            />
          ) : null}

          <QuizModalAction
            label={primaryLabel}
            onPress={handlePrimaryPress}
            tone={primaryTone}
          />
        </QuizModalActionStack>
      </View>
    </QuizModalShell>
  );
}

export default AppAlertModal;
