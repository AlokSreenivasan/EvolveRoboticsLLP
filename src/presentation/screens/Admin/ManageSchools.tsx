import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminIconButton from '../../../components/Admin/AdminIconButton';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import BackButton from '../../../components/BackButton';
import { colors, spacing } from '../../../constants/theme';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useSchools } from '../../hooks/useSchools';
import {
  createSchool,
  deleteSchool,
  moveSchool,
  updateSchool,
} from '../../../services/firebase/schoolsService';
import type {
  School,
  SchoolGrade,
} from '../../../store/content/types/schools.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type SchoolFormState = {
  name: string;
  city: string;
  grades: SchoolGrade[];
};

const EMPTY_FORM: SchoolFormState = {
  name: '',
  city: '',
  grades: [],
};

function newGradeId() {
  return `grade_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function ManageSchools() {
  const { schools, loading, error } = useSchools();

  const [addName, setAddName] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addGrades, setAddGrades] = useState<SchoolGrade[]>([]);
  const [adding, setAdding] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingSchool, setSavingSchool] = useState(false);

  const [gradeEditorVisible, setGradeEditorVisible] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [gradeDraftName, setGradeDraftName] = useState('');
  const [gradeFormError, setGradeFormError] = useState<string | null>(null);
  /** When true, grade editor mutates the inline add form; otherwise the edit modal. */
  const [gradeEditorForAdd, setGradeEditorForAdd] = useState(false);

  const { reorderingId, handleMove } = useAdminReorder(schools, moveSchool);

  const handleAddSchool = async () => {
    const name = addName.trim();
    if (!name) {
      appAlert(appAlertCopy.admin.schoolNameNeeded, appAlertCopy.admin.schoolNameRequired);
      return;
    }

    setAdding(true);
    try {
      await createSchool({
        name,
        city: addCity,
        grades: addGrades,
      });
      setAddName('');
      setAddCity('');
      setAddGrades([]);
    } catch (error) {
      appAlert(appAlertCopy.admin.addFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  const openEditEditor = (school: School) => {
    setEditingSchoolId(school.id);
    setSchoolForm({
      name: school.name,
      city: school.city,
      grades: school.grades.map(grade => ({ ...grade })),
    });
    setFormError(null);
    setGradeEditorVisible(false);
    setEditingGradeId(null);
    setGradeDraftName('');
    setGradeFormError(null);
    setGradeEditorForAdd(false);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingSchoolId(null);
    setSchoolForm(EMPTY_FORM);
    setFormError(null);
    setGradeEditorVisible(false);
    setEditingGradeId(null);
    setGradeDraftName('');
    setGradeFormError(null);
    setGradeEditorForAdd(false);
  };

  const handleSaveSchool = async () => {
    if (!schoolForm.name.trim()) {
      setFormError(appAlertCopy.admin.schoolNameRequired);
      return;
    }

    if (!editingSchoolId) {
      return;
    }

    setSavingSchool(true);
    setFormError(null);
    try {
      await updateSchool(editingSchoolId, {
        name: schoolForm.name,
        city: schoolForm.city,
        grades: schoolForm.grades,
      });
      closeEditor();
    } catch (error) {
      setFormError(toAdminWriteErrorMessage(error));
    } finally {
      setSavingSchool(false);
    }
  };

  const openCreateGradeEditor = (forAdd: boolean) => {
    setGradeEditorForAdd(forAdd);
    setEditingGradeId(null);
    setGradeDraftName('');
    setGradeFormError(null);
    setGradeEditorVisible(true);
    if (!forAdd) {
      setEditorVisible(true);
    }
  };

  const openEditGradeEditor = (grade: SchoolGrade, forAdd: boolean) => {
    setGradeEditorForAdd(forAdd);
    setEditingGradeId(grade.id);
    setGradeDraftName(grade.name);
    setGradeFormError(null);
    setGradeEditorVisible(true);
    if (!forAdd) {
      setEditorVisible(true);
    }
  };

  const closeGradeEditor = () => {
    setGradeEditorVisible(false);
    setEditingGradeId(null);
    setGradeDraftName('');
    setGradeFormError(null);
  };

  const upsertGrade = () => {
    const name = gradeDraftName.trim();
    if (!name) {
      setGradeFormError(appAlertCopy.admin.gradeNameRequired);
      return;
    }

    const apply = (grades: SchoolGrade[]): SchoolGrade[] => {
      if (editingGradeId) {
        return grades.map(grade =>
          grade.id === editingGradeId ? { ...grade, name } : grade,
        );
      }

      return [
        ...grades,
        {
          id: newGradeId(),
          name,
          sortOrder: grades.length,
        },
      ];
    };

    if (gradeEditorForAdd) {
      setAddGrades(prev => apply(prev));
    } else {
      setSchoolForm(prev => ({ ...prev, grades: apply(prev.grades) }));
    }

    closeGradeEditor();
  };

  const confirmDeleteGrade = (grade: SchoolGrade, forAdd: boolean) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('grade'),
      appAlertCopy.admin.deleteConfirm('grade', grade.name),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: () => {
            const remove = (grades: SchoolGrade[]) =>
              grades
                .filter(item => item.id !== grade.id)
                .map((item, index) => ({ ...item, sortOrder: index }));

            if (forAdd) {
              setAddGrades(prev => remove(prev));
            } else {
              setSchoolForm(prev => ({ ...prev, grades: remove(prev.grades) }));
            }
          },
        },
      ],
    );
  };

  const confirmDeleteSchool = (school: School) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('school'),
      appAlertCopy.admin.deleteConfirm('school', school.name),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchool(school.id);
            } catch (error) {
              appAlert(
                appAlertCopy.admin.deleteFailedTitle,
                toAdminWriteErrorMessage(error),
              );
            }
          },
        },
      ],
    );
  };

  const renderGradesSection = (
    grades: SchoolGrade[],
    forAdd: boolean,
  ) => (
    <View style={forAdd ? styles.addGradesWrap : undefined}>
      <View style={styles.gradesHeader}>
        <Text style={styles.gradesTitle}>Grades</Text>
        <TouchableOpacity
          style={styles.addGradeButton}
          onPress={() => openCreateGradeEditor(forAdd)}
          accessibilityRole="button"
          accessibilityLabel="Add grade">
          <Plus size={16} color={colors.surface} strokeWidth={2.5} />
          <Text style={styles.addGradeText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.gradesSubtitle}>
        {grades.length === 0
          ? 'No grades yet. Add grades offered at this school.'
          : `${grades.length} grade${grades.length === 1 ? '' : 's'}`}
      </Text>

      {grades.length === 0 ? null : (
        <View style={styles.gradeList}>
          {grades.map((grade, index) => (
            <View key={grade.id} style={styles.gradeCard}>
              <View style={styles.gradeMeta}>
                <Text style={styles.gradeIndex}>G{index + 1}</Text>
                <Text style={styles.gradeName} numberOfLines={2}>
                  {grade.name}
                </Text>
              </View>
              <View style={styles.gradeActions}>
                <AdminIconButton
                  icon={Pencil}
                  onPress={() => openEditGradeEditor(grade, forAdd)}
                />
                <AdminIconButton
                  icon={Trash2}
                  danger
                  onPress={() => confirmDeleteGrade(grade, forAdd)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const listHeader = (
    <>
      <Text style={adminStyles.blockTitle}>Add a school</Text>
      <Text style={adminStyles.sectionHint}>
        New schools appear in the list below. Add grades for each school, then
        use reorder arrows to change display order.
      </Text>
      <AdminSectionCard
        saving={adding}
        saveLabel="Add school"
        onSave={handleAddSchool}>
        <AdminFormField
          label="School name"
          value={addName}
          onChangeText={setAddName}
          placeholder="e.g. Riverside High School"
          autoCapitalize="words"
        />
        <AdminFormField
          label="City (optional)"
          value={addCity}
          onChangeText={setAddCity}
          placeholder="e.g. Austin, TX"
          autoCapitalize="words"
        />
        {renderGradesSection(addGrades, true)}
      </AdminSectionCard>
      <Text style={adminStyles.blockTitle}>Schools</Text>
    </>
  );

  const renderSchool = useCallback(
    ({ item: school, index }: { item: School; index: number }) => {
      const city = school.city.trim();
      const gradeCount = school.grades.length;
      const gradeLabel =
        gradeCount === 0
          ? 'No grades'
          : `${gradeCount} grade${gradeCount === 1 ? '' : 's'}`;
      const subtitle = city ? `${city} · ${gradeLabel}` : gradeLabel;

      return (
        <AdminListRow
          title={school.name}
          subtitle={subtitle}
          isPublished
          index={index}
          itemCount={schools.length}
          reordering={reorderingId === school.id}
          onMoveUp={() => handleMove(school.id, 'up')}
          onMoveDown={() => handleMove(school.id, 'down')}
          onEdit={() => openEditEditor(school)}
          onDelete={() => confirmDeleteSchool(school)}
        />
      );
    },
    [handleMove, schools.length, reorderingId],
  );

  const keyExtractor = useCallback((item: School) => item.id, []);

  const gradeEditorTitle = editingGradeId ? 'Edit grade' : 'Add grade';
  const gradeEditorSaveLabel = editingGradeId ? 'Save grade' : 'Add grade';

  return (
    <>
      <AdminListLayout
        title="Add Schools"
        subtitle="Register partner schools for the Evolve platform"
        data={schools}
        loading={loading}
        error={error}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderSchool}
        listHeader={listHeader}
        emptyMessage="No schools yet. Add one using the form above."
      />

      <AdminEntityForm
        visible={editorVisible || (gradeEditorVisible && !gradeEditorForAdd)}
        title={
          gradeEditorVisible && !gradeEditorForAdd
            ? gradeEditorTitle
            : 'Edit school'
        }
        saveLabel={
          gradeEditorVisible && !gradeEditorForAdd
            ? gradeEditorSaveLabel
            : 'Save school'
        }
        saving={
          gradeEditorVisible && !gradeEditorForAdd ? false : savingSchool
        }
        error={
          gradeEditorVisible && !gradeEditorForAdd ? gradeFormError : formError
        }
        onClose={
          gradeEditorVisible && !gradeEditorForAdd
            ? closeGradeEditor
            : closeEditor
        }
        onSave={
          gradeEditorVisible && !gradeEditorForAdd
            ? upsertGrade
            : handleSaveSchool
        }>
        {gradeEditorVisible && !gradeEditorForAdd ? (
          <>
            <BackButton
              label="← Back to school"
              onPress={closeGradeEditor}
              withSpacingBelow
            />
            <AdminFormField
              label="Grade name"
              value={gradeDraftName}
              onChangeText={setGradeDraftName}
              placeholder="e.g. Grade 8, Nursery, LKG"
              autoCapitalize="words"
            />
          </>
        ) : (
          <>
            <AdminFormField
              label="School name"
              value={schoolForm.name}
              onChangeText={name => setSchoolForm(prev => ({ ...prev, name }))}
              placeholder="School name"
              autoCapitalize="words"
            />
            <AdminFormField
              label="City (optional)"
              value={schoolForm.city}
              onChangeText={city => setSchoolForm(prev => ({ ...prev, city }))}
              placeholder="City"
              autoCapitalize="words"
            />
            {renderGradesSection(schoolForm.grades, false)}
          </>
        )}
      </AdminEntityForm>

      <AdminEntityForm
        visible={gradeEditorVisible && gradeEditorForAdd}
        title={gradeEditorTitle}
        saveLabel={gradeEditorSaveLabel}
        saving={false}
        error={gradeFormError}
        onClose={closeGradeEditor}
        onSave={upsertGrade}>
        <AdminFormField
          label="Grade name"
          value={gradeDraftName}
          onChangeText={setGradeDraftName}
          placeholder="e.g. Grade 8, Nursery, LKG"
          autoCapitalize="words"
        />
      </AdminEntityForm>
    </>
  );
}

const styles = StyleSheet.create({
  addGradesWrap: {
    marginBottom: 8,
  },
  gradesHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addGradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.buttonRadius,
  },
  addGradeText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  gradesSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  gradeList: {
    gap: 10,
  },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  gradeMeta: {
    flex: 1,
    gap: 4,
  },
  gradeIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  gradeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gradeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default ManageSchools;
