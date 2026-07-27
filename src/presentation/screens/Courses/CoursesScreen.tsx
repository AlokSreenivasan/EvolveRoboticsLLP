import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import BackButton from '../../../components/BackButton';
import CourseCatalogCard from '../../../components/Courses/CourseCatalogCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing } from '../../../constants/theme';
import type { Course } from '../../../store/content/types/courses.types';
import { courseTrackLabel } from '../../../store/content/types/courses.types';
import type {
  LoginScreenNavigationProp,
  RootStackParamList,
} from '../../../types/navigation';
import { useCourses } from '../../hooks/useCourses';

function CoursesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Courses'>>();
  const trackFilter = route.params?.track;
  const { courses, loading, error } = useCourses();

  const filteredCourses = useMemo(() => {
    if (!trackFilter) {
      return courses;
    }
    return courses.filter(course => course.track === trackFilter);
  }, [courses, trackFilter]);

  const headerTitle = trackFilter
    ? courseTrackLabel(trackFilter)
    : 'Courses';
  const headerSubtitle = trackFilter
    ? `Browse ${courseTrackLabel(trackFilter).toLowerCase()} courses, duration, and details.`
    : 'Browse all available courses, duration, and details.';

  const renderCourse = useCallback(
    ({ item, index }: { item: Course; index: number }) => (
      <CourseCatalogCard
        course={item}
        accentIndex={index}
        onPress={() => navigation.navigate('CourseDetail', { course: item })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load courses</Text>
          <Text style={styles.messageText}>
            Go back and try again in a moment.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.messageCard}>
        <Text style={styles.messageTitle}>No courses yet</Text>
        <Text style={styles.messageText}>
          {trackFilter
            ? `No ${courseTrackLabel(trackFilter).toLowerCase()} courses are published yet.`
            : 'New courses will appear here once they are published.'}
        </Text>
      </View>
    );
  }, [error, loading, trackFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>
      </View>

      <FlatList
        data={loading || error ? [] : filteredCourses}
        keyExtractor={keyExtractor}
        renderItem={renderCourse}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...VERTICAL_LIST_PERF}
      />
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  loader: {
    marginVertical: 40,
  },
  messageCard: {
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
  },
});

export default CoursesScreen;
