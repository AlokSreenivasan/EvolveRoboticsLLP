import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPdfPicker from '../../../components/Admin/AdminPdfPicker';
import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useAssignments } from '../../hooks/useAssignments';
import { useSchools } from '../../hooks/useSchools';
import { useAdminPdfPicker } from '../../hooks/admin/useAdminPdfPicker';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSectionDefaults } from '../../hooks/admin/useAdminSectionDefaults';
import {
  createAssignment,
  deleteAssignment,
  ensureAssignmentsSectionDefaults,
  moveAssignment,
  updateAssignment,
  updateAssignmentsSection,
} from '../../../services/firebase/assignmentsService';
import {
  deleteAssignmentPdfByUrlSafe,
  uploadAssignmentPdf,
} from '../../../services/firebase/storageService';
import type {
  Assignment,
  UpdateAssignmentsSectionInput,
} from '../../../store/content/types/assignments.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { saveAdminPdfEntity } from '../../../utils/admin/saveAdminPdfEntity';

type AssignmentFormState = {
  title: string;
  subtitle: string;
  dueDateLabel: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_FORM: AssignmentFormState = {
  title: '',
  subtitle: '',
  dueDateLabel: '',
  track: null,
  isPublished: true,
};

function ManageAssignments() {
  const { section, assignments, loading } = useAssignments({
    includeUnpublished: true,
  });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssignmentFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const pdfPicker = useAdminPdfPicker();
  const { resetAudience } = audienceForm;
  const { loadExistingPdf } = pdfPicker;
  const { reorderingId, handleMove } = useAdminReorder(
    assignments,
    moveAssignment,
  );

  useAdminSectionDefaults(ensureAssignmentsSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (assignment: Assignment) => {
      setEditingId(assignment.id);
      setForm({
        title: assignment.title,
        subtitle: assignment.subtitle,
        dueDateLabel: assignment.dueDateLabel,
        track: assignment.track,
        isPublished: assignment.isPublished,
      });
      resetAudience({
        audience: assignment.audience,
        schoolIds: assignment.schoolIds,
        schoolGradeIds: assignment.schoolGradeIds,
      });
      loadExistingPdf(assignment.pdfUrl);
      setEditorVisible(true);
    },
    [loadExistingPdf, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
  };

  const handleSaveSection = async () => {
    const payload: UpdateAssignmentsSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      appAlert(
        appAlertCopy.admin.screenTitleNeeded,
        appAlertCopy.admin.screenTitleRequired('Assignments'),
      );
      return;
    }

    setSavingSection(true);
    try {
      await updateAssignmentsSection(payload);
      appAlert(
        appAlertCopy.admin.savedTitle,
        appAlertCopy.admin.screenHeadingsSaved('Assignments'),
      );
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!form.title.trim()) {
      appAlert(
        appAlertCopy.admin.headingRequiredTitle,
        appAlertCopy.admin.headingRequired('assignment'),
      );
      return;
    }

    if (!pdfPicker.hasPdf) {
      appAlert(
        appAlertCopy.admin.pdfRequiredTitle,
        appAlertCopy.admin.pdfRequired('assignment'),
      );
      return;
    }

    const visibilityError = validateContentVisibility(
      form.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
      return;
    }

    const visibilityPayload = buildContentVisibilityPayload(
      form.track!,
      audienceForm.toPayload(),
    );
    setSaving(true);
    try {
      await saveAdminPdfEntity({
        editingId: editingId,
        pendingPdfUri: pdfPicker.pendingPdfUri,
        existingPdfUrl: pdfPicker.existingPdfUrl,
        uploadPdf: uploadAssignmentPdf,
        deleteOldPdf: deleteAssignmentPdfByUrlSafe,
        createEntity: () =>
          createAssignment({
            title: form.title,
            subtitle: form.subtitle,
            dueDateLabel: form.dueDateLabel,
            pdfUrl: '',
            isPublished: form.isPublished,
            ...visibilityPayload,
          }),
        updateEntity: (id, pdfUrl) =>
          updateAssignment(id, {
            title: form.title,
            subtitle: form.subtitle,
            dueDateLabel: form.dueDateLabel,
            pdfUrl,
            isPublished: form.isPublished,
            ...visibilityPayload,
          }),
      });
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (assignment: Assignment) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('assignment'),
      appAlertCopy.admin.deleteConfirm('assignment', assignment.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAssignmentPdfByUrlSafe(assignment.pdfUrl);
              await deleteAssignment(assignment.id);
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

  const listHeader = (
    <>
      <Text style={adminStyles.blockTitle}>Screen headings</Text>
      <AdminSectionCard saving={savingSection} onSave={handleSaveSection}>
        <AdminFormField
          label="Screen title"
          value={sectionTitle}
          onChangeText={setSectionTitle}
          placeholder="Assignments"
        />
        <AdminFormField
          label="Screen subtitle"
          value={sectionSubtitle}
          onChangeText={setSectionSubtitle}
          placeholder="Download and complete your tasks"
        />
      </AdminSectionCard>
      <AdminListSectionHeader title="Assignments" onAdd={openCreateEditor} />
    </>
  );

  const renderAssignment = useCallback(
    ({ item: assignment, index }: { item: Assignment; index: number }) => (
      <AdminListRow
        title={assignment.title}
        subtitle={assignment.subtitle || assignment.dueDateLabel}
        statusLine={`${assignment.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'} · ${formatContentVisibilitySummary(assignment.track, assignment, schools)}`}
        isPublished={assignment.isPublished}
        index={index}
        itemCount={assignments.length}
        reordering={reorderingId === assignment.id}
        onMoveUp={() => handleMove(assignment.id, 'up')}
        onMoveDown={() => handleMove(assignment.id, 'down')}
        onEdit={() => openEditEditor(assignment)}
        onDelete={() => confirmDelete(assignment)}
      />
    ),
    [assignments.length, handleMove, openEditEditor, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Assignments"
        subtitle="Add PDF assignments with due dates for the Assignments screen"
        data={assignments}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderAssignment}
        listHeader={listHeader}
        emptyMessage="No assignments yet. Add a PDF for students to download."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingId ? 'Edit assignment' : 'New assignment'}
        saveLabel="Save assignment"
        saving={saving}
        onClose={closeEditor}
        onSave={handleSaveAssignment}>
        <AdminFormField
          label="Heading"
          value={form.title}
          onChangeText={title => setForm(prev => ({ ...prev, title }))}
          placeholder="Lab report — Motion graphs"
        />
        <AdminFormField
          label="Subtitle (optional)"
          value={form.subtitle}
          onChangeText={subtitle => setForm(prev => ({ ...prev, subtitle }))}
          placeholder="Shown on the card"
        />
        <AdminFormField
          label="Due date label"
          value={form.dueDateLabel}
          onChangeText={dueDateLabel =>
            setForm(prev => ({ ...prev, dueDateLabel }))
          }
          placeholder="Due 12 Jun"
        />
        <AdminPdfPicker
          statusLabel={pdfPicker.pdfStatusLabel}
          picking={pdfPicker.pickingPdf}
          onPick={pdfPicker.handlePickPdf}
        />
        <AdminPublishedSwitch
          label="Published for students"
          value={form.isPublished}
          onValueChange={isPublished =>
            setForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminContentVisibilityFields
          track={form.track}
          onTrackChange={track => setForm(prev => ({ ...prev, track }))}
          onProfessionalsTrackSelected={() => audienceForm.resetAudience()}
          audience={audienceForm.audience}
          selectedSchoolIds={audienceForm.schoolIds}
          schoolGradeIds={audienceForm.schoolGradeIds}
          schools={schools}
          schoolsLoading={schoolsLoading}
          schoolsError={schoolsError}
          onAudienceChange={audienceForm.setAudienceMode}
          onToggleSchool={audienceForm.toggleSchoolId}
          onSchoolGradeModeChange={audienceForm.setSchoolGradeMode}
          onToggleSchoolGrade={audienceForm.toggleSchoolGrade}
          getSchoolGradeMode={audienceForm.getSchoolGradeMode}
          trackHint="Required. Choose whether this assignment is visible to kids or professionals."
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageAssignments;
