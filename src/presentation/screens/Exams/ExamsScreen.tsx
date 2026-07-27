import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClipboardCheck, FileText } from 'lucide-react-native';

import ListScreen from '../../../components/ui/ListScreen';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import type { Exam } from '../../../store/content/types/exams.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useExams } from '../../hooks/useExams';

function formatMinutes(timerSeconds: number): number {
  if (typeof timerSeconds !== 'number' || !Number.isFinite(timerSeconds)) {
    return 0;
  }
  return Math.max(0, Math.trunc(timerSeconds / 60));
}

function ExamsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { exams, loading, error } = useExams();

  const renderExam = useCallback(
    ({ item }: { item: Exam }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ExamAttempt', { examId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`Exam ${item.title}`}>
        <SurfaceCard elevation="light" style={styles.card}>
          <View style={styles.cardIcon}>
            <FileText size={20} color={colors.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description.trim() ? (
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {item.description.trim()}
              </Text>
            ) : null}
            <Text style={styles.cardMeta}>
              {item.questions.length} questions • {formatMinutes(item.timerSeconds)} min
            </Text>
          </View>
        </SurfaceCard>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Exam) => item.id, []);

  const resultsButton = (
    <TouchableOpacity
      style={styles.resultsButton}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ExamAttempts')}
      accessibilityRole="button"
      accessibilityLabel="View my exam results">
      <ClipboardCheck size={16} color={colors.primary} strokeWidth={2.5} />
      <Text style={styles.resultsButtonText}>Results</Text>
    </TouchableOpacity>
  );

  return (
    <ListScreen
      title="Exams"
      subtitle="Attempt published exams within the given time."
      data={exams}
      loading={loading}
      error={Boolean(error)}
      errorTitle="Could not load exams"
      emptyTitle="No exams yet"
      emptyMessage="Exams will appear here once your instructors publish them."
      EmptyIcon={FileText}
      keyExtractor={keyExtractor}
      renderItem={renderExam}
      rightSlot={resultsButton}
    />
  );
}

const styles = StyleSheet.create({
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  resultsButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.cardTitle,
    fontSize: 15,
  },
  cardSubtitle: {
    marginTop: 4,
    ...typography.bodySecondary,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default ExamsScreen;
