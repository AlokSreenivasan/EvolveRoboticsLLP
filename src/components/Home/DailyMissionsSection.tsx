import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Target } from 'lucide-react-native';

import DailyMissionCard from './DailyMissionCard';
import QuizCompetitionIcon from './icons/QuizCompetitionIcon';
import { colors, sectionTitleStyle, spacing } from '../../constants/theme';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import { useContinueLearningProgress } from '../../presentation/hooks/useContinueLearningProgress';
import { useQuizAttempts } from '../../presentation/hooks/useQuizAttempts';
import {
  DAILY_MISSION_LESSONS_XP,
  DAILY_MISSION_QUIZ_XP,
  isLessonsMissionCompleteToday,
  isQuizMissionCompleteToday,
} from '../../utils/gamification/dailyMissions';

const MISSION_THEME = {
  accentColor: colors.primary,
  accentBackground: colors.primaryLight,
  accentBorder: colors.primaryMuted,
};

const MISSION_GAP = 12;
const MISSION_CARD_WIDTH =
  (Dimensions.get('window').width -
    spacing.screenHorizontal * 2 -
    MISSION_GAP) /
  2;

function DailyMissionsHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={styles.headerIconWrap}>
          <Target size={14} color="#fff" strokeWidth={2.5} />
        </View>
        <Text style={styles.headerTitle}>Daily Missions</Text>
      </View>
    </View>
  );
}

function DailyMissionsSection() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { progressByPlaylistId, loading: progressLoading } =
    useContinueLearningProgress();
  const { attempts, loading: attemptsLoading } = useQuizAttempts();

  const progressRecords = useMemo(
    () => Object.values(progressByPlaylistId),
    [progressByPlaylistId],
  );

  const lessonsDone = useMemo(
    () => isLessonsMissionCompleteToday(progressRecords),
    [progressRecords],
  );

  const quizDone = useMemo(
    () => isQuizMissionCompleteToday(attempts),
    [attempts],
  );

  const handleLessonsStart = useCallback(() => {
    navigation.navigate('ToDo', { tab: 'learn' });
  }, [navigation]);

  const handleQuizStart = useCallback(() => {
    navigation.navigate('QuizCompetitions');
  }, [navigation]);

  if (progressLoading || attemptsLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <DailyMissionsHeader />

      <View style={styles.cardsRow}>
        <DailyMissionCard
          icon={
            <BookOpen
              size={20}
              color={MISSION_THEME.accentColor}
              strokeWidth={2.25}
            />
          }
          title="Lessons"
          xpReward={DAILY_MISSION_LESSONS_XP}
          isDone={lessonsDone}
          accentColor={MISSION_THEME.accentColor}
          accentBackground={MISSION_THEME.accentBackground}
          accentBorder={MISSION_THEME.accentBorder}
          onStartPress={handleLessonsStart}
          style={styles.card}
        />
        <DailyMissionCard
          icon={
            <QuizCompetitionIcon
              size={20}
              color={MISSION_THEME.accentColor}
              strokeWidth={2.25}
            />
          }
          title="Complete a Quiz"
          xpReward={DAILY_MISSION_QUIZ_XP}
          isDone={quizDone}
          accentColor={MISSION_THEME.accentColor}
          accentBackground={MISSION_THEME.accentBackground}
          accentBorder={MISSION_THEME.accentBorder}
          onStartPress={handleQuizStart}
          style={styles.card}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  header: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    ...sectionTitleStyle,
    fontWeight: '800',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: MISSION_GAP,
    paddingVertical: 8,
  },
  card: {
    width: MISSION_CARD_WIDTH,
  },
  loaderWrap: {
    marginTop: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default React.memo(DailyMissionsSection);
