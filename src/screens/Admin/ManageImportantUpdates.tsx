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
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';

import AdminScreenLayout from '../../components/Admin/AdminScreenLayout';
import AppButton from '../../components/AppButton';
import { VERTICAL_LIST_PERF } from '../../constants/listPerformance';
import { colors, cardShadow, spacing } from '../../constants/theme';
import { useImportantUpdates } from '../../presentation/hooks/useImportantUpdates';
import {
  createImportantUpdateNotice,
  deleteImportantUpdateNotice,
  ensureImportantUpdatesSectionDefaults,
  moveImportantUpdateNotice,
  updateImportantUpdateNotice,
  updateImportantUpdatesSection,
} from '../../services/firebase/importantUpdatesService';
import type {
  ImportantUpdateNotice,
  UpdateImportantUpdatesSectionInput,
} from '../../store/content/types/importantUpdates.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type NoticeFormState = {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  isPublished: boolean;
};

const EMPTY_NOTICE_FORM: NoticeFormState = {
  tag: '',
  title: '',
  subtitle: '',
  description: '',
  isPublished: true,
};

function isPermissionDenied(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (typeof code === 'string' && code.includes('permission-denied')) {
    return true;
  }
  const message = (error as { message?: string } | null)?.message;
  return typeof message === 'string' && message.toLowerCase().includes('permission');
}

function toAdminWriteErrorMessage(error: unknown): string {
  const base = getErrorMessage(error);
  if (!isPermissionDenied(error)) {
    return base;
  }
  return `${base}\n\nFix checklist:\n1) Firestore users/{uid}.role must be exactly \"admin\"\n2) Deploy rules: cd Evolve && firebase deploy --only firestore:rules`;
}

function ManageImportantUpdates() {
  const { section, notices, loading } = useImportantUpdates({
    includeUnpublished: true,
  });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState<NoticeFormState>(EMPTY_NOTICE_FORM);
  const [savingNotice, setSavingNotice] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    ensureImportantUpdatesSectionDefaults().catch(() => undefined);
  }, []);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
    setActionLabel(section.actionLabel);
  }, [section]);

  const openCreateEditor = () => {
    setEditingNoticeId(null);
    setNoticeForm(EMPTY_NOTICE_FORM);
    setEditorVisible(true);
  };

  const openEditEditor = (notice: ImportantUpdateNotice) => {
    setEditingNoticeId(notice.id);
    setNoticeForm({
      tag: notice.tag,
      title: notice.title,
      subtitle: notice.subtitle,
      description: notice.description,
      isPublished: notice.isPublished,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoticeId(null);
    setNoticeForm(EMPTY_NOTICE_FORM);
  };

  const handleSaveSection = async () => {
    const payload: UpdateImportantUpdatesSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
      actionLabel: actionLabel.trim(),
    };

    if (!payload.sectionTitle) {
      Alert.alert('Section title required', 'Enter a title for this home section.');
      return;
    }

    setSavingSection(true);
    try {
      await updateImportantUpdatesSection(payload);
      Alert.alert('Saved', 'Section headings updated. Changes appear on Home instantly.');
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeForm.title.trim()) {
      Alert.alert('Title required', 'Each notice needs a title.');
      return;
    }

    setSavingNotice(true);
    try {
      if (editingNoticeId) {
        await updateImportantUpdateNotice(editingNoticeId, {
          tag: noticeForm.tag,
          title: noticeForm.title,
          subtitle: noticeForm.subtitle,
          description: noticeForm.description,
          isPublished: noticeForm.isPublished,
        });
      } else {
        await createImportantUpdateNotice({
          tag: noticeForm.tag.trim() || 'New Notice',
          title: noticeForm.title,
          subtitle: noticeForm.subtitle,
          description: noticeForm.description,
          isPublished: noticeForm.isPublished,
        });
      }
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingNotice(false);
    }
  };

  const confirmDeleteNotice = (notice: ImportantUpdateNotice) => {
    Alert.alert('Delete notice', `Remove "${notice.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteImportantUpdateNotice(notice.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const handleMove = useCallback(
    async (noticeId: string, direction: 'up' | 'down') => {
      setReorderingId(noticeId);
      try {
        await moveImportantUpdateNotice(noticeId, direction, notices);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [notices],
  );

  const listHeader = useCallback(
    () => (
      <>
        <Text style={styles.blockTitle}>Section headings</Text>
        <View style={styles.card}>
          <FormField
            label="Section title"
            value={sectionTitle}
            onChangeText={setSectionTitle}
            placeholder="Important Updates"
          />
          <FormField
            label="Section subtitle"
            value={sectionSubtitle}
            onChangeText={setSectionSubtitle}
            placeholder="Optional line under the title"
          />
          <FormField
            label="Action label"
            value={actionLabel}
            onChangeText={setActionLabel}
            placeholder="View All"
          />
          <AppButton
            title={savingSection ? 'Saving…' : 'Save section'}
            onPress={handleSaveSection}
            disabled={savingSection}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
        <View style={styles.noticesHeader}>
          <Text style={styles.blockTitle}>Notices</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add notice">
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [
      actionLabel,
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
    if (notices.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No notices yet. Add one to show on the home screen.
        </Text>
      );
    }
    return null;
  }, [loading, notices.length]);

  const renderNotice = useCallback(
    ({ item: notice, index }: { item: ImportantUpdateNotice; index: number }) => (
      <View style={styles.noticeCard}>
        <View style={styles.noticeTopRow}>
          <View style={styles.noticeMeta}>
            {notice.tag ? <Text style={styles.noticeTag}>{notice.tag}</Text> : null}
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            {notice.subtitle ? (
              <Text style={styles.noticeSubtitle}>{notice.subtitle}</Text>
            ) : null}
            {!notice.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.noticeActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === notice.id}
              onPress={() => handleMove(notice.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={
                index === notices.length - 1 || reorderingId === notice.id
              }
              onPress={() => handleMove(notice.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(notice)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDeleteNotice(notice)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [
      confirmDeleteNotice,
      handleMove,
      notices.length,
      openEditEditor,
      reorderingId,
    ],
  );

  const keyExtractor = useCallback(
    (item: ImportantUpdateNotice) => item.id,
    [],
  );

  return (
    <AdminScreenLayout
      title="Important Updates"
      subtitle="Edit home section titles and notices"
      scrollable={false}>
      <FlatList
        data={notices}
        keyExtractor={keyExtractor}
        renderItem={renderNotice}
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
            {editingNoticeId ? 'Edit notice' : 'New notice'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <FormField
              label="Tag"
              value={noticeForm.tag}
              onChangeText={tag => setNoticeForm(prev => ({ ...prev, tag }))}
              placeholder="New Notice"
            />
            <FormField
              label="Title"
              value={noticeForm.title}
              onChangeText={title =>
                setNoticeForm(prev => ({ ...prev, title }))
              }
              placeholder="Robotics Workshop on 25 May 2025"
            />
            <FormField
              label="Subtitle"
              value={noticeForm.subtitle}
              onChangeText={subtitle =>
                setNoticeForm(prev => ({ ...prev, subtitle }))
              }
              placeholder="Hands-on session for all students."
            />
            <FormField
              label="Description"
              value={noticeForm.description}
              onChangeText={description =>
                setNoticeForm(prev => ({ ...prev, description }))
              }
              placeholder="Additional details (optional)"
              multiline
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published on home</Text>
              <Switch
                value={noticeForm.isPublished}
                onValueChange={isPublished =>
                  setNoticeForm(prev => ({ ...prev, isPublished }))
                }
                trackColor={{ true: colors.primarySoft, false: colors.border }}
                thumbColor={
                  noticeForm.isPublished ? colors.primary : colors.textMuted
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
              title={savingNotice ? 'Saving…' : 'Save notice'}
              onPress={handleSaveNotice}
              disabled={savingNotice}
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
  multiline?: boolean;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
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
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
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
  noticesHeader: {
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
  noticeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  noticeTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noticeMeta: {
    flex: 1,
  },
  noticeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noticeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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
  noticeActions: {
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

export default ManageImportantUpdates;
