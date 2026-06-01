import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  FileUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';

import AdminScreenLayout from '../../components/Admin/AdminScreenLayout';
import AppButton from '../../components/AppButton';
import { VERTICAL_LIST_PERF } from '../../constants/listPerformance';
import { colors, cardShadow, spacing } from '../../constants/theme';
import { useAssignments } from '../../presentation/hooks/useAssignments';
import {
  createAssignment,
  deleteAssignment,
  ensureAssignmentsSectionDefaults,
  moveAssignment,
  updateAssignment,
  updateAssignmentsSection,
} from '../../services/firebase/assignmentsService';
import {
  deleteAssignmentPdfByUrlSafe,
  uploadAssignmentPdf,
} from '../../services/firebase/storageService';
import type {
  Assignment,
  UpdateAssignmentsSectionInput,
} from '../../store/content/types/assignments.types';
import { toAdminWriteErrorMessage } from '../../utils/admin/adminWriteErrorMessage';
import { pickPdfFile } from '../../utils/documents/pickPdfFile';
import { getErrorMessage } from '../../utils/firebase/errors';

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
  const [pendingPdfUri, setPendingPdfUri] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [pickingPdf, setPickingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    ensureAssignmentsSectionDefaults().catch(() => undefined);
  }, []);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPendingPdfUri(null);
    setExistingPdfUrl('');
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
    setPendingPdfUri(null);
    setExistingPdfUrl(assignment.pdfUrl);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPendingPdfUri(null);
    setExistingPdfUrl('');
  };

  const handlePickPdf = async () => {
    setPickingPdf(true);
    try {
      const uri = await pickPdfFile();
      if (uri) {
        setPendingPdfUri(uri);
      }
    } catch (error) {
      Alert.alert('Could not open file', getErrorMessage(error));
    } finally {
      setPickingPdf(false);
    }
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

    const hasPdf = Boolean(pendingPdfUri || existingPdfUrl.trim());
    if (!hasPdf) {
      Alert.alert('PDF required', 'Attach a PDF file for this assignment.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        let pdfUrl = existingPdfUrl.trim();
        if (pendingPdfUri) {
          pdfUrl = await uploadAssignmentPdf(editingId, pendingPdfUri);
          if (existingPdfUrl.trim()) {
            await deleteAssignmentPdfByUrlSafe(existingPdfUrl);
          }
        }
        await updateAssignment(editingId, {
          title: form.title,
          subtitle: form.subtitle,
          dueDateLabel: form.dueDateLabel,
          pdfUrl,
          isPublished: form.isPublished,
        });
      } else {
        const created = await createAssignment({
          title: form.title,
          subtitle: form.subtitle,
          dueDateLabel: form.dueDateLabel,
          pdfUrl: '',
          isPublished: form.isPublished,
        });
        const pdfUrl = await uploadAssignmentPdf(created.id, pendingPdfUri!);
        await updateAssignment(created.id, { pdfUrl });
      }
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

  const handleMove = useCallback(
    async (assignmentId: string, direction: 'up' | 'down') => {
      setReorderingId(assignmentId);
      try {
        await moveAssignment(assignmentId, direction, assignments);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [assignments],
  );

  const pdfLabel = pendingPdfUri
    ? 'New PDF selected'
    : existingPdfUrl.trim()
      ? 'Current PDF attached'
      : 'No PDF selected';

  const listHeader = useCallback(
    () => (
      <>
        <Text style={styles.blockTitle}>Screen headings</Text>
        <View style={styles.card}>
          <FormField
            label="Screen title"
            value={sectionTitle}
            onChangeText={setSectionTitle}
            placeholder="Assignments"
          />
          <FormField
            label="Screen subtitle"
            value={sectionSubtitle}
            onChangeText={setSectionSubtitle}
            placeholder="Download sheets and check due dates"
          />
          <AppButton
            title={savingSection ? 'Saving…' : 'Save headings'}
            onPress={handleSaveSection}
            disabled={savingSection}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
        <View style={styles.listHeader}>
          <Text style={styles.blockTitle}>Assignments</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add assignment">
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [
      handleSaveSection,
      openCreateEditor,
      savingSection,
      sectionSubtitle,
      sectionTitle,
    ],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (assignments.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No assignments yet. Add a PDF for students to open from Quick Access.
        </Text>
      );
    }
    return null;
  }, [assignments.length, loading]);

  const renderAssignment = useCallback(
    ({ item: assignment, index }: { item: Assignment; index: number }) => (
      <View style={styles.itemCard}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemMeta}>
            <Text style={styles.itemTitle}>{assignment.title}</Text>
            {assignment.subtitle ? (
              <Text style={styles.itemSubtitle}>{assignment.subtitle}</Text>
            ) : null}
            {assignment.dueDateLabel ? (
              <Text style={styles.dueLabel}>{assignment.dueDateLabel}</Text>
            ) : null}
            <Text style={styles.pdfStatus}>
              {assignment.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'}
            </Text>
            {!assignment.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.itemActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === assignment.id}
              onPress={() => handleMove(assignment.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={
                index === assignments.length - 1 ||
                reorderingId === assignment.id
              }
              onPress={() => handleMove(assignment.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(assignment)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDelete(assignment)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [
      assignments.length,
      confirmDelete,
      handleMove,
      openEditEditor,
      reorderingId,
    ],
  );

  const keyExtractor = useCallback((item: Assignment) => item.id, []);

  return (
    <AdminScreenLayout
      title="Assignments"
      subtitle="Publish PDF assignments with headings and due dates"
      scrollable={false}>
      <FlatList
        data={assignments}
        keyExtractor={keyExtractor}
        renderItem={renderAssignment}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        extraData={reorderingId}
        {...VERTICAL_LIST_PERF}
      />

      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditor}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingId ? 'Edit assignment' : 'New assignment'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <FormField
              label="Heading"
              value={form.title}
              onChangeText={title => setForm(prev => ({ ...prev, title }))}
              placeholder="Lab Report — Week 3"
            />
            <FormField
              label="Subtitle (optional)"
              value={form.subtitle}
              onChangeText={subtitle =>
                setForm(prev => ({ ...prev, subtitle }))
              }
              placeholder="Instructions shown on the card"
            />
            <FormField
              label="Due date label"
              value={form.dueDateLabel}
              onChangeText={dueDateLabel =>
                setForm(prev => ({ ...prev, dueDateLabel }))
              }
              placeholder="Due 25 Jun 2025"
            />

            <Text style={styles.fieldLabel}>Assignment PDF</Text>
            <TouchableOpacity
              style={styles.pdfPicker}
              onPress={handlePickPdf}
              disabled={pickingPdf}
              activeOpacity={0.85}>
              <FileUp size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.pdfPickerText}>
                {pickingPdf ? 'Opening files…' : 'Choose PDF'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.pdfHint}>{pdfLabel}</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published for students</Text>
              <Switch
                value={form.isPublished}
                onValueChange={isPublished =>
                  setForm(prev => ({ ...prev, isPublished }))
                }
                trackColor={{ true: colors.primarySoft, false: colors.border }}
                thumbColor={
                  form.isPublished ? colors.primary : colors.textMuted
                }
              />
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              onPress={closeEditor}
              buttonStyle={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
            <AppButton
              title={saving ? 'Saving…' : 'Save assignment'}
              onPress={handleSaveAssignment}
              disabled={saving}
              buttonStyle={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          </View>
        </View>
      </Modal>
    </AdminScreenLayout>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

type IconButtonProps = {
  icon: typeof Pencil;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
};

function IconButton({
  icon: Icon,
  onPress,
  disabled,
  danger,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.iconButton, disabled && styles.iconButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}>
      <Icon
        size={18}
        color={danger ? colors.danger : colors.primary}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 40,
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  itemTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentGreen,
    marginTop: 6,
  },
  pdfStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  draftBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentOrange,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconButton: {
    padding: 6,
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: spacing.screenHorizontal,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalScroll: {
    paddingBottom: 16,
  },
  pdfPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 10,
    padding: 14,
    backgroundColor: colors.primaryLight,
    marginBottom: 6,
  },
  pdfPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  pdfHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default ManageAssignments;
