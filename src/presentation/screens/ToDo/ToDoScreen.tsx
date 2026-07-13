import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, FolderKanban } from 'lucide-react-native';

import BackButton from '../../../components/BackButton';
import { cardShadow, colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';

type ToDoBlockProps = {
  label: string;
  icon: typeof FolderKanban;
  accentColor: string;
  accentBackground: string;
  onPress?: () => void;
};

function ToDoBlock({
  label,
  icon: Icon,
  accentColor,
  accentBackground,
  onPress,
}: ToDoBlockProps) {
  return (
    <TouchableOpacity
      style={styles.block}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.iconCircle, { backgroundColor: accentBackground }]}>
        <Icon size={36} color={accentColor} strokeWidth={2} />
      </View>
      <Text style={styles.blockLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToDoScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>To Do</Text>
      </View>

      <View style={styles.content}>
        <ToDoBlock
          label="Projects"
          icon={FolderKanban}
          accentColor={colors.accentBlue}
          accentBackground="#EEF4FC"
          onPress={() => navigation.navigate('Projects')}
        />
        <ToDoBlock
          label="Lessons"
          icon={BookOpen}
          accentColor={colors.primary}
          accentBackground={colors.primaryLight}
          onPress={() => navigation.navigate('ContinueLearningList')}
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.sectionGap,
    gap: spacing.sectionGap,
  },
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  blockLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default ToDoScreen;
