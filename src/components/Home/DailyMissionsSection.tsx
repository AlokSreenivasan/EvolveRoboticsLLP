import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen } from 'lucide-react-native';

import DailyMissionCard from './DailyMissionCard';
import HomeSectionHeader from './HomeSectionHeader';
import QuizCompetitionIcon from './icons/QuizCompetitionIcon';
import { colors } from '../../constants/theme';
import type { LoginScreenNavigationProp } from '../../types/navigation';
import { useContinueLearningProgress } from '../../presentation/hooks/useContinueLearningProgress';
import { useQuizAttempts } from '../../presentation/hooks/useQuizAttempts';
import {
  DAILY_MISSION_LESSONS_XP,
  DAILY_MISSION_QUIZ_XP,
  isLessonsMissionCompleteToday,
  isQuizMissionCompleteToday,
} from '../../utils/gamification/dailyMissions';

const LESSONS_THEME = {
  accentColor: colors.primary,
  accentBackground: colors.primaryLight,
  accentBorder: colors.primaryMuted,
};

const QUIZ_THEME = {
  accentColor: colors.primaryDark,
  accentBackground: colors.primaryLight,
  accentBorder: colors.primaryMuted,
};

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
    navigation.navigate('ContinueLearningList');
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
      <HomeSectionHeader title="Daily Missions" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <DailyMissionCard
          icon={<BookOpen size={20} color={LESSONS_THEME.accentColor} strokeWidth={2.25} />}
          title="Lessons"
          xpReward={DAILY_MISSION_LESSONS_XP}
          isDone={lessonsDone}
          accentColor={LESSONS_THEME.accentColor}
          accentBackground={LESSONS_THEME.accentBackground}
          accentBorder={LESSONS_THEME.accentBorder}
          onStartPress={handleLessonsStart}
          style={styles.cardSpacing}
        />
        <DailyMissionCard
          icon={
            <QuizCompetitionIcon
              size={20}
              color={QUIZ_THEME.accentColor}
              strokeWidth={2.25}
            />
          }
          title="Complete a Quiz"
          xpReward={DAILY_MISSION_QUIZ_XP}
          isDone={quizDone}
          accentColor={QUIZ_THEME.accentColor}
          accentBackground={QUIZ_THEME.accentBackground}
          accentBorder={QUIZ_THEME.accentBorder}
          onStartPress={handleQuizStart}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 18,
  },
  scrollContent: {
    paddingRight: 4,
  },
  cardSpacing: {
    marginRight: 12,
  },
  loaderWrap: {
    marginTop: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default React.memo(DailyMissionsSection);
