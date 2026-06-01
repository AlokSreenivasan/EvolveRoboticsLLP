import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPdfPicker from '../../../components/Admin/AdminPdfPicker';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useAssignments } from '../../hooks/useAssignments';
import { useAdminPdfPicker } from '../../hooks/admin/useAdminPdfPicker';
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
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { saveAdminPdfEntity } from '../../../utils/admin/saveAdminPdfEntity';

type AssignmentFormState = {
  title: string;
  subtitle: string;
  dueDateLabel: string;
  isPublished: boolean;
};

const EMPTY_FORM: AssignmentFormState = {
  title: '',
  subtitle: '',
  dueDateLabel: '',
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

  const pdfPicker = useAdminPdfPicker();
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
    pdfPicker.resetPdfState();
    setEditorVisible(true);
  };

  const openEditEditor = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setForm({
      title: assignment.title,
      subtitle: assignment.subtitle,
      dueDateLabel: assignment.dueDateLabel,
      isPublished: assignment.isPublished,
    });
    pdfPicker.loadExistingPdf(assignment.pdfUrl);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    pdfPicker.resetPdfState();
  };

  const handleSaveSection = async () => {
    const payload: UpdateAssignmentsSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      Alert.alert(
        'Screen title required',
        'Enter a title for the Assignments screen.',
      );
      return;
    }

    setSavingSection(true);
    try {
      await updateAssignmentsSection(payload);
      Alert.alert('Saved', 'Assignments screen headings updated.');
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!form.title.trim()) {
      Alert.alert('Heading required', 'Each assignment needs a heading (title).');
      return;
    }

    if (!pdfPicker.hasPdf) {
      Alert.alert('PDF required', 'Attach a PDF file for this assignment.');
      return;
    }

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
          }),
        updateEntity: (id, pdfUrl) =>
          updateAssignment(id, {
            title: form.title,
            subtitle: form.subtitle,
            dueDateLabel: form.dueDateLabel,
            pdfUrl,
            isPublished: form.isPublished,
          }),
      });
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (assignment: Assignment) => {
    Alert.alert('Delete assignment', `Remove "${assignment.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAssignmentPdfByUrlSafe(assignment.pdfUrl);
            await deleteAssignment(assignment.id);
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
        statusLine={
          assignment.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'
        }
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
    [assignments.length, handleMove, reorderingId],
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
      </AdminEntityForm>
    </>
  );
}

export default ManageAssignments;
