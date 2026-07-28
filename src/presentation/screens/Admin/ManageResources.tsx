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
import { useResources } from '../../hooks/useResources';
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
  createResourceNote,
  deleteResourceNote,
  ensureResourcesSectionDefaults,
  moveResourceNote,
  updateResourceNote,
  updateResourcesSection,
} from '../../../services/firebase/resourcesService';
import {
  deleteResourceNotePdfByUrlSafe,
  uploadResourceNotePdf,
} from '../../../services/firebase/storageService';
import type {
  ResourceNote,
  UpdateResourcesSectionInput,
} from '../../../store/content/types/resources.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { saveAdminPdfEntity } from '../../../utils/admin/saveAdminPdfEntity';

type NoteFormState = {
  title: string;
  subtitle: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_NOTE_FORM: NoteFormState = {
  title: '',
  subtitle: '',
  track: null,
  isPublished: true,
};

function ManageResources() {
  const { section, notes, loading } = useResources({ includeUnpublished: true });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormState>(EMPTY_NOTE_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const pdfPicker = useAdminPdfPicker();
  const { resetAudience } = audienceForm;
  const { loadExistingPdf } = pdfPicker;
  const { reorderingId, handleMove } = useAdminReorder(notes, moveResourceNote);

  useAdminSectionDefaults(ensureResourcesSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setFormError(null);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (note: ResourceNote) => {
      setEditingNoteId(note.id);
      setNoteForm({
        title: note.title,
        subtitle: note.subtitle,
        track: note.track,
        isPublished: note.isPublished,
      });
      setFormError(null);
      resetAudience({
        audience: note.audience,
        schoolIds: note.schoolIds,
        schoolGradeIds: note.schoolGradeIds,
      });
      loadExistingPdf(note.pdfUrl);
      setEditorVisible(true);
    },
    [loadExistingPdf, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setFormError(null);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
  };

  const handleSaveSection = async () => {
    const payload: UpdateResourcesSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      appAlert(
        appAlertCopy.admin.screenTitleNeeded,
        appAlertCopy.admin.screenTitleRequired('Resources'),
      );
      return;
    }

    setSavingSection(true);
    try {
      await updateResourcesSection(payload);
      appAlert(
        appAlertCopy.admin.savedTitle,
        appAlertCopy.admin.screenHeadingsSaved('Resources'),
      );
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNote = async () => {
    // Avoid appAlert here: nesting it over this form's Modal blocks touches after dismiss.
    if (!noteForm.title.trim()) {
      setFormError(appAlertCopy.admin.headingRequired('note'));
      return;
    }

    if (!pdfPicker.hasPdf) {
      setFormError(appAlertCopy.admin.pdfRequired('note'));
      return;
    }

    const visibilityError = validateContentVisibility(
      noteForm.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      setFormError(visibilityError);
      return;
    }

    const visibilityPayload = buildContentVisibilityPayload(
      noteForm.track!,
      audienceForm.toPayload(),
    );
    setFormError(null);
    setSavingNote(true);
    try {
      await saveAdminPdfEntity({
        editingId: editingNoteId,
        pendingPdfUri: pdfPicker.pendingPdfUri,
        existingPdfUrl: pdfPicker.existingPdfUrl,
        uploadPdf: uploadResourceNotePdf,
        deleteOldPdf: deleteResourceNotePdfByUrlSafe,
        createEntity: () =>
          createResourceNote({
            title: noteForm.title,
            subtitle: noteForm.subtitle,
            pdfUrl: '',
            isPublished: noteForm.isPublished,
            ...visibilityPayload,
          }),
        updateEntity: (id, pdfUrl) =>
          updateResourceNote(id, {
            title: noteForm.title,
            subtitle: noteForm.subtitle,
            pdfUrl,
            isPublished: noteForm.isPublished,
            ...visibilityPayload,
          }),
      });
      closeEditor();
    } catch (error) {
      setFormError(toAdminWriteErrorMessage(error));
    } finally {
      setSavingNote(false);
    }
  };

  const confirmDeleteNote = (note: ResourceNote) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('note'),
      appAlertCopy.admin.deleteConfirm('note', note.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteResourceNotePdfByUrlSafe(note.pdfUrl);
              await deleteResourceNote(note.id);
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
          placeholder="Resources"
        />
        <AdminFormField
          label="Screen subtitle"
          value={sectionSubtitle}
          onChangeText={setSectionSubtitle}
          placeholder="Study notes from your instructors"
        />
      </AdminSectionCard>
      <AdminListSectionHeader title="PDF notes" onAdd={openCreateEditor} />
    </>
  );

  const renderNote = useCallback(
    ({ item: note, index }: { item: ResourceNote; index: number }) => (
      <AdminListRow
        title={note.title}
        subtitle={note.subtitle}
        statusLine={`${note.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'} · ${formatContentVisibilitySummary(note.track, note, schools)}`}
        isPublished={note.isPublished}
        index={index}
        itemCount={notes.length}
        reordering={reorderingId === note.id}
        onMoveUp={() => handleMove(note.id, 'up')}
        onMoveDown={() => handleMove(note.id, 'down')}
        onEdit={() => openEditEditor(note)}
        onDelete={() => confirmDeleteNote(note)}
      />
    ),
    [handleMove, notes.length, openEditEditor, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: ResourceNote) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Resources"
        subtitle="Add PDF study notes with headings for the Resources screen"
        data={notes}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderNote}
        listHeader={listHeader}
        emptyMessage="No notes yet. Add a PDF note for students to open from Quick Access."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingNoteId ? 'Edit note' : 'New note'}
        saveLabel="Save note"
        saving={savingNote}
        error={formError}
        onClose={closeEditor}
        onSave={handleSaveNote}>
        <AdminFormField
          label="Heading"
          value={noteForm.title}
          onChangeText={title => {
            setFormError(null);
            setNoteForm(prev => ({ ...prev, title }));
          }}
          placeholder="Chapter 3 — Kinematics"
        />
        <AdminFormField
          label="Subtitle (optional)"
          value={noteForm.subtitle}
          onChangeText={subtitle =>
            setNoteForm(prev => ({ ...prev, subtitle }))
          }
          placeholder="Brief description shown on the card"
        />
        <AdminPdfPicker
          statusLabel={pdfPicker.pdfStatusLabel}
          picking={pdfPicker.pickingPdf}
          onPick={() => {
            setFormError(null);
            pdfPicker.handlePickPdf().catch(() => {
              // Errors are surfaced by the picker hook.
            });
          }}
        />
        <AdminPublishedSwitch
          label="Published for students"
          value={noteForm.isPublished}
          onValueChange={isPublished =>
            setNoteForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminContentVisibilityFields
          track={noteForm.track}
          onTrackChange={track => {
            setFormError(null);
            setNoteForm(prev => ({ ...prev, track }));
          }}
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
          trackHint="Required. Choose whether this note is visible to kids or professionals."
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageResources;
