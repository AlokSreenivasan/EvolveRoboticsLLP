import React, { useCallback, useMemo } from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { BookOpen } from 'lucide-react-native';

import CourseCatalogCard from '../../../components/Courses/CourseCatalogCard';
import ListScreen from '../../../components/ui/ListScreen';
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

  return (
    <ListScreen
      title={headerTitle}
      subtitle={headerSubtitle}
      data={filteredCourses}
      loading={loading}
      error={Boolean(error)}
      errorTitle="Could not load courses"
      emptyTitle="No courses yet"
      emptyMessage={
        trackFilter
          ? `No ${courseTrackLabel(trackFilter).toLowerCase()} courses are published yet.`
          : 'New courses will appear here once they are published.'
      }
      EmptyIcon={BookOpen}
      keyExtractor={keyExtractor}
      renderItem={renderCourse}
    />
  );
}

export default CoursesScreen;
