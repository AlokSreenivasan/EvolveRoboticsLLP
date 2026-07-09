import React from 'react';

import AdminCourseTrackPicker from './AdminCourseTrackPicker';
import AdminSchoolAudiencePicker from './AdminSchoolAudiencePicker';
import type { CourseTrack } from '../../store/content/types/courses.types';
import type { School } from '../../store/content/types/schools.types';
import type {
  SchoolAudience,
  SchoolGradeIdsMap,
} from '../../store/content/types/schoolAudience.types';

type AdminContentVisibilityFieldsProps = {
  track: CourseTrack | null;
  onTrackChange: (track: CourseTrack) => void;
  onProfessionalsTrackSelected?: () => void;
  audience: SchoolAudience;
  selectedSchoolIds: string[];
  schoolGradeIds: SchoolGradeIdsMap;
  schools: School[];
  schoolsLoading: boolean;
  schoolsError: string | null;
  onAudienceChange: (audience: SchoolAudience) => void;
  onToggleSchool: (schoolId: string) => void;
  onSchoolGradeModeChange: (schoolId: string, mode: 'all' | 'grades') => void;
  onToggleSchoolGrade: (schoolId: string, gradeId: string) => void;
  getSchoolGradeMode: (schoolId: string) => 'all' | 'grades';
  trackHint?: string;
};

function AdminContentVisibilityFields({
  track,
  onTrackChange,
  onProfessionalsTrackSelected,
  audience,
  selectedSchoolIds,
  schoolGradeIds,
  schools,
  schoolsLoading,
  schoolsError,
  onAudienceChange,
  onToggleSchool,
  onSchoolGradeModeChange,
  onToggleSchoolGrade,
  getSchoolGradeMode,
  trackHint = 'Required. Choose whether this is shown to kids or professionals.',
}: AdminContentVisibilityFieldsProps) {
  return (
    <>
      <AdminCourseTrackPicker
        value={track}
        onChange={nextTrack => {
          onTrackChange(nextTrack);
          if (nextTrack === 'professionals') {
            onProfessionalsTrackSelected?.();
          }
        }}
        label="Visibility *"
        hint={trackHint}
      />
      {track === 'kids' ? (
        <AdminSchoolAudiencePicker
          label="School visibility"
          hint="Choose all schools or specific schools, then set grade visibility for each selected school."
          audience={audience}
          selectedSchoolIds={selectedSchoolIds}
          schoolGradeIds={schoolGradeIds}
          schools={schools}
          schoolsLoading={schoolsLoading}
          schoolsError={schoolsError}
          onAudienceChange={onAudienceChange}
          onToggleSchool={onToggleSchool}
          onSchoolGradeModeChange={onSchoolGradeModeChange}
          onToggleSchoolGrade={onToggleSchoolGrade}
          getSchoolGradeMode={getSchoolGradeMode}
        />
      ) : null}
    </>
  );
}

export default AdminContentVisibilityFields;
