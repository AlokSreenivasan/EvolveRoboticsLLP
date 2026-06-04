import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPdfPicker from '../../../components/Admin/AdminPdfPicker';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSchoolAudiencePicker from '../../../components/Admin/AdminSchoolAudiencePicker';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useResources } from '../../hooks/useResources';
import { useSchools } from '../../hooks/useSchools';
import { useAdminPdfPicker } from '../../hooks/admin/useAdminPdfPicker';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { formatSchoolAudienceSummary } from '../../../utils/content/schoolAudience';
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
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { saveAdminPdfEntity } from '../../../utils/admin/saveAdminPdfEntity';

type NoteFormState = {
  title: string;
  subtitle: string;
  isPublished: boolean;
};

const EMPTY_NOTE_FORM: NoteFormState = {
  title: '',
  subtitle: '',
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
  const [savingNote, setSavingNote] = useState(false);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const pdfPicker = useAdminPdfPicker();
  const { reorderingId, handleMove } = useAdminReorder(notes, moveResourceNote);

  useAdminSectionDefaults(ensureResourcesSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
    setEditorVisible(true);
  };

  const openEditEditor = (note: ResourceNote) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      subtitle: note.subtitle,
      isPublished: note.isPublished,
    });
    audienceForm.resetAudience({
      audience: note.audience,
      schoolIds: note.schoolIds,
    });
    pdfPicker.loadExistingPdf(note.pdfUrl);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    audienceForm.resetAudience();
    pdfPicker.resetPdfState();
  };

  const handleSaveSection = async () => {
    const payload: UpdateResourcesSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      Alert.alert('Screen title required', 'Enter a title for the Resources screen.');
      return;
    }

    setSavingSection(true);
    try {
      await updateResourcesSection(payload);
      Alert.alert('Saved', 'Resources screen headings updated.');
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim()) {
      Alert.alert('Heading required', 'Each note needs a heading (title).');
      return;
    }

    if (!pdfPicker.hasPdf) {
      Alert.alert('PDF required', 'Attach a PDF file for this note.');
      return;
    }

    const audienceError = audienceForm.validate();
    if (audienceError) {
      Alert.alert('Audience required', audienceError);
      return;
    }

    const audiencePayload = audienceForm.toPayload();
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
            ...audiencePayload,
          }),
        updateEntity: (id, pdfUrl) =>
          updateResourceNote(id, {
            title: noteForm.title,
            subtitle: noteForm.subtitle,
            pdfUrl,
            isPublished: noteForm.isPublished,
            ...audiencePayload,
          }),
      });
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingNote(false);
    }
  };

  const confirmDeleteNote = (note: ResourceNote) => {
    Alert.alert('Delete note', `Remove "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteResourceNotePdfByUrlSafe(note.pdfUrl);
            await deleteResourceNote(note.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
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
        statusLine={`${note.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'} · ${formatSchoolAudienceSummary(note, schools)}`}
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
    [handleMove, notes.length, reorderingId, schools],
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
        onClose={closeEditor}
        onSave={handleSaveNote}>
        <AdminFormField
          label="Heading"
          value={noteForm.title}
          onChangeText={title => setNoteForm(prev => ({ ...prev, title }))}
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
          onPick={pdfPicker.handlePickPdf}
        />
        <AdminPublishedSwitch
          label="Published for students"
          value={noteForm.isPublished}
          onValueChange={isPublished =>
            setNoteForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminSchoolAudiencePicker
          audience={audienceForm.audience}
          selectedSchoolIds={audienceForm.schoolIds}
          schools={schools}
          schoolsLoading={schoolsLoading}
          schoolsError={schoolsError}
          onAudienceChange={audienceForm.setAudienceMode}
          onToggleSchool={audienceForm.toggleSchoolId}
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageResources;
