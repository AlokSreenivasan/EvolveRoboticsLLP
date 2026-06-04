import { useCallback, useState } from 'react';

import type {
  SchoolAudience,
  SchoolAudienceFields,
  SchoolAudienceInput,
} from '../../../store/content/types/schoolAudience.types';
import { validateSchoolAudienceInput } from '../../../utils/content/schoolAudience';

const DEFAULT_FIELDS: SchoolAudienceFields = {
  audience: 'all',
  schoolIds: [],
};

export function useAdminSchoolAudienceForm(
  initial: SchoolAudienceFields = DEFAULT_FIELDS,
) {
  const [audience, setAudience] = useState<SchoolAudience>(initial.audience);
  const [schoolIds, setSchoolIds] = useState<string[]>(initial.schoolIds);

  const resetAudience = useCallback((fields: SchoolAudienceFields = DEFAULT_FIELDS) => {
    setAudience(fields.audience);
    setSchoolIds(fields.schoolIds);
  }, []);

  const setAudienceMode = useCallback((next: SchoolAudience) => {
    setAudience(next);
    if (next === 'all') {
      setSchoolIds([]);
    }
  }, []);

  const toggleSchoolId = useCallback((schoolId: string) => {
    setSchoolIds(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      }
      return [...prev, schoolId];
    });
  }, []);

  const validate = useCallback((): string | null => {
    return validateSchoolAudienceInput({ audience, schoolIds });
  }, [audience, schoolIds]);

  const toPayload = useCallback((): SchoolAudienceInput => {
    return { audience, schoolIds };
  }, [audience, schoolIds]);

  const fields: SchoolAudienceFields = { audience, schoolIds };

  return {
    audience,
    schoolIds,
    fields,
    setAudienceMode,
    toggleSchoolId,
    resetAudience,
    validate,
    toPayload,
  };
}
