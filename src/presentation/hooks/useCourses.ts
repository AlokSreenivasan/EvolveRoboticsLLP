import { useEffect, useState } from 'react';
import { onAuthStateChanged } from '../../services/firebase/authService';
import { subscribeCourses } from '../../services/firebase/coursesService';
import type { Course } from '../../store/content/types/courses.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseCoursesOptions = {
  /** When true, includes draft (unpublished) courses — for admin screens. */
  includeUnpublished?: boolean;
};

export function useCourses(options?: UseCoursesOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubCourses: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(user => {
      unsubCourses?.();
      unsubCourses = undefined;

      if (!user) {
        setCourses([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubCourses = subscribeCourses(
        nextCourses => {
          setCourses(nextCourses);
          setError(null);
          setLoading(false);
        },
        { includeUnpublished },
        err => {
          setError(getErrorMessage(err));
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth();
      unsubCourses?.();
    };
  }, [includeUnpublished]);

  return {
    courses,
    loading,
    error,
  };
}
