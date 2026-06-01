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
import { useResources } from '../../presentation/hooks/useResources';
import {
  createResourceNote,
  deleteResourceNote,
  ensureResourcesSectionDefaults,
  moveResourceNote,
  updateResourceNote,
  updateResourcesSection,
} from '../../services/firebase/resourcesService';
import {
  deleteResourceNotePdfByUrlSafe,
  uploadResourceNotePdf,
} from '../../services/firebase/storageService';
import type {
  ResourceNote,
  UpdateResourcesSectionInput,
} from '../../store/content/types/resources.types';
import { toAdminWriteErrorMessage } from '../../utils/admin/adminWriteErrorMessage';
import { pickPdfFile } from '../../utils/documents/pickPdfFile';
import { getErrorMessage } from '../../utils/firebase/errors';

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
  const [pendingPdfUri, setPendingPdfUri] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [pickingPdf, setPickingPdf] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    ensureResourcesSectionDefaults().catch(() => undefined);
  }, []);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setPendingPdfUri(null);
    setExistingPdfUrl('');
    setEditorVisible(true);
  };

  const openEditEditor = (note: ResourceNote) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      subtitle: note.subtitle,
      isPublished: note.isPublished,
    });
    setPendingPdfUri(null);
    setExistingPdfUrl(note.pdfUrl);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
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

    const hasPdf = Boolean(pendingPdfUri || existingPdfUrl.trim());
    if (!hasPdf) {
      Alert.alert('PDF required', 'Attach a PDF file for this note.');
      return;
    }

    setSavingNote(true);
    try {
      if (editingNoteId) {
        let pdfUrl = existingPdfUrl.trim();
        if (pendingPdfUri) {
          pdfUrl = await uploadResourceNotePdf(editingNoteId, pendingPdfUri);
          if (existingPdfUrl.trim()) {
            await deleteResourceNotePdfByUrlSafe(existingPdfUrl);
          }
        }
        await updateResourceNote(editingNoteId, {
          title: noteForm.title,
          subtitle: noteForm.subtitle,
          pdfUrl,
          isPublished: noteForm.isPublished,
        });
      } else {
        const created = await createResourceNote({
          title: noteForm.title,
          subtitle: noteForm.subtitle,
          pdfUrl: '',
          isPublished: noteForm.isPublished,
        });
        const pdfUrl = await uploadResourceNotePdf(created.id, pendingPdfUri!);
        await updateResourceNote(created.id, { pdfUrl });
      }
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

  const handleMove = useCallback(
    async (noteId: string, direction: 'up' | 'down') => {
      setReorderingId(noteId);
      try {
        await moveResourceNote(noteId, direction, notes);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [notes],
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
            placeholder="Resources"
          />
          <FormField
            label="Screen subtitle"
            value={sectionSubtitle}
            onChangeText={setSectionSubtitle}
            placeholder="Study notes from your instructors"
          />
          <AppButton
            title={savingSection ? 'Saving…' : 'Save headings'}
            onPress={handleSaveSection}
            disabled={savingSection}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
        <View style={styles.notesHeader}>
          <Text style={styles.blockTitle}>PDF notes</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add note">
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
    if (notes.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No notes yet. Add a PDF note for students to open from Quick Access.
        </Text>
      );
    }
    return null;
  }, [loading, notes.length]);

  const renderNote = useCallback(
    ({ item: note, index }: { item: ResourceNote; index: number }) => (
      <View style={styles.noteCard}>
        <View style={styles.noteTopRow}>
          <View style={styles.noteMeta}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            {note.subtitle ? (
              <Text style={styles.noteSubtitle}>{note.subtitle}</Text>
            ) : null}
            <Text style={styles.pdfStatus}>
              {note.pdfUrl.trim() ? 'PDF attached' : 'Missing PDF'}
            </Text>
            {!note.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.noteActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === note.id}
              onPress={() => handleMove(note.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={index === notes.length - 1 || reorderingId === note.id}
              onPress={() => handleMove(note.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(note)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDeleteNote(note)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [
      confirmDeleteNote,
      handleMove,
      notes.length,
      openEditEditor,
      reorderingId,
    ],
  );

  const keyExtractor = useCallback((item: ResourceNote) => item.id, []);

  return (
    <AdminScreenLayout
      title="Resources"
      subtitle="Add PDF study notes with headings for the Resources screen"
      scrollable={false}>
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderNote}
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
            {editingNoteId ? 'Edit note' : 'New note'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <FormField
              label="Heading"
              value={noteForm.title}
              onChangeText={title => setNoteForm(prev => ({ ...prev, title }))}
              placeholder="Chapter 3 — Kinematics"
            />
            <FormField
              label="Subtitle (optional)"
              value={noteForm.subtitle}
              onChangeText={subtitle =>
                setNoteForm(prev => ({ ...prev, subtitle }))
              }
              placeholder="Brief description shown on the card"
            />

            <Text style={styles.fieldLabel}>PDF file</Text>
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
                value={noteForm.isPublished}
                onValueChange={isPublished =>
                  setNoteForm(prev => ({ ...prev, isPublished }))
                }
                trackColor={{ true: colors.primarySoft, false: colors.border }}
                thumbColor={
                  noteForm.isPublished ? colors.primary : colors.textMuted
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
              title={savingNote ? 'Saving…' : 'Save note'}
              onPress={handleSaveNote}
              disabled={savingNote}
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
  notesHeader: {
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
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  noteTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noteMeta: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noteSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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
  noteActions: {
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

export default ManageResources;
