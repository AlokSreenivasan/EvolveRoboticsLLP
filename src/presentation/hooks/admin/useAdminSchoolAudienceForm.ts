import { useCallback, useState } from 'react';

import type {
  SchoolAudience,
  SchoolAudienceFields,
  SchoolAudienceInput,
  SchoolGradeIdsMap,
} from '../../../store/content/types/schoolAudience.types';
import { validateSchoolAudienceInput } from '../../../utils/content/schoolAudience';

const DEFAULT_FIELDS: SchoolAudienceFields = {
  audience: 'all',
  schoolIds: [],
  schoolGradeIds: {},
};

function pruneSchoolGradeIds(
  schoolGradeIds: SchoolGradeIdsMap,
  schoolIds: string[],
): SchoolGradeIdsMap {
  const allowed = new Set(schoolIds);
  const next: SchoolGradeIdsMap = {};

  for (const [schoolId, gradeIds] of Object.entries(schoolGradeIds)) {
    if (!allowed.has(schoolId) || gradeIds.length === 0) {
      continue;
    }
    next[schoolId] = gradeIds;
  }

  return next;
}

export function useAdminSchoolAudienceForm(
  initial: SchoolAudienceFields = DEFAULT_FIELDS,
) {
  const [audience, setAudience] = useState<SchoolAudience>(initial.audience);
  const [schoolIds, setSchoolIds] = useState<string[]>(initial.schoolIds);
  const [schoolGradeIds, setSchoolGradeIds] = useState<SchoolGradeIdsMap>(
    initial.schoolGradeIds,
  );

  const resetAudience = useCallback((fields: SchoolAudienceFields = DEFAULT_FIELDS) => {
    setAudience(fields.audience);
    setSchoolIds(fields.schoolIds);
    setSchoolGradeIds(fields.schoolGradeIds);
  }, []);

  const setAudienceMode = useCallback((next: SchoolAudience) => {
    setAudience(next);
    if (next === 'all') {
      setSchoolIds([]);
      setSchoolGradeIds({});
    }
  }, []);

  const toggleSchoolId = useCallback((schoolId: string) => {
    setSchoolIds(prev => {
      if (prev.includes(schoolId)) {
        const nextIds = prev.filter(id => id !== schoolId);
        setSchoolGradeIds(current => pruneSchoolGradeIds(current, nextIds));
        return nextIds;
      }
      return [...prev, schoolId];
    });
  }, []);

  const setSchoolGradeMode = useCallback(
    (schoolId: string, mode: 'all' | 'grades') => {
      setSchoolGradeIds(prev => {
        const next = { ...prev };
        if (mode === 'all') {
          delete next[schoolId];
          return next;
        }
        if (!next[schoolId]) {
          next[schoolId] = [];
        }
        return next;
      });
    },
    [],
  );

  const toggleSchoolGrade = useCallback((schoolId: string, gradeId: string) => {
    setSchoolGradeIds(prev => {
      const current = prev[schoolId] ?? [];
      const nextGrades = current.includes(gradeId)
        ? current.filter(id => id !== gradeId)
        : [...current, gradeId];

      return {
        ...prev,
        [schoolId]: nextGrades,
      };
    });
  }, []);

  const getSchoolGradeMode = useCallback(
    (schoolId: string): 'all' | 'grades' => {
      return schoolId in schoolGradeIds ? 'grades' : 'all';
    },
    [schoolGradeIds],
  );

  const validate = useCallback((): string | null => {
    return validateSchoolAudienceInput({ audience, schoolIds, schoolGradeIds });
  }, [audience, schoolGradeIds, schoolIds]);

  const toPayload = useCallback((): SchoolAudienceInput => {
    return {
      audience,
      schoolIds,
      schoolGradeIds: pruneSchoolGradeIds(schoolGradeIds, schoolIds),
    };
  }, [audience, schoolGradeIds, schoolIds]);

  const fields: SchoolAudienceFields = { audience, schoolIds, schoolGradeIds };

  return {
    audience,
    schoolIds,
    schoolGradeIds,
    fields,
    setAudienceMode,
    toggleSchoolId,
    setSchoolGradeMode,
    toggleSchoolGrade,
    getSchoolGradeMode,
    resetAudience,
    validate,
    toPayload,
  };
}
