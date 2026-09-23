import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GraduationCap,
  ListTodo,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import {
  cardShadowElevated,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';

export type StreakLevelUpDestination = 'todo' | 'quiz' | 'courses';

type StreakLevelUpOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (destination: StreakLevelUpDestination) => void;
};

const ACTIONS: {
  key: StreakLevelUpDestination;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    key: 'todo',
    label: 'Todo',
    hint: 'Finish lessons and tasks',
    icon: ListTodo,
  },
  {
    key: 'quiz',
    label: 'Quiz competition',
    hint: 'Answer quizzes to earn XP',
    icon: Trophy,
  },
  {
    key: 'courses',
    label: 'Courses',
    hint: 'Learn and reach the next level',
    icon: GraduationCap,
  },
];

function StreakLevelUpOverlay({
  visible,
  onClose,
  onSelect,
}: StreakLevelUpOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Return to home"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close and return to home"
          onPress={onClose}
          hitSlop={10}
          style={[
            styles.closeButton,
            { top: Math.max(insets.top, 12) + 8, right: spacing.screenHorizontal },
          ]}>
          <X size={16} color={colors.primaryDark} strokeWidth={2.5} />
        </Pressable>

        <View
          style={styles.cluster}
          accessibilityViewIsModal
          accessibilityRole="menu">
          <View style={styles.intro}>
            <Text style={styles.title}>Earn XP to level up</Text>
            <Text style={styles.subtitle}>
              Complete a to-do, join a quiz competition, or take a course to
              gain XP and reach the next level.
            </Text>
          </View>

          {ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={`${action.label}. ${action.hint}`}
                onPress={() => onSelect(action.key)}
                style={({ pressed }) => [
                  styles.action,
                  pressed && styles.actionPressed,
                ]}>
                <View style={styles.iconTile}>
                  <Icon size={22} color={colors.primary} strokeWidth={2.25} />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionHint}>{action.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  closeButton: {
    position: 'absolute',
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadowElevated,
  },
  cluster: {
    gap: 12,
  },
  intro: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
    ...glassBorder,
    ...cardShadowElevated,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: spacing.buttonRadius,
    paddingVertical: 14,
    paddingHorizontal: 14,
    ...glassBorder,
    ...cardShadowElevated,
  },
  actionPressed: {
    backgroundColor: colors.primaryLight,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: spacing.iconTileRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actionHint: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default StreakLevelUpOverlay;
