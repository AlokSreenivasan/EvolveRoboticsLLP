import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Keyboard,
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
  collection,
  db,
  doc,
} from '../../../services/firebase/firestoreClient';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import AppButton from '../../../components/AppButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, cardShadow, spacing } from '../../../constants/theme';
import { useCourses } from '../../hooks/useCourses';
import { FIRESTORE_COLLECTIONS } from '../../../services/firebase/constants';
import {
  createCourse,
  deleteCourse,
  moveCourse,
  updateCourse,
} from '../../../services/firebase/coursesService';
import { getCurrentUserId } from '../../../services/firebase/authService';
import { isAdmin } from '../../../services/firebase/roleService';
import { uploadCourseThumbnail } from '../../../services/firebase/storageService';
import { pickProfilePhotoFromGallery } from '../../../services/profilePhotoPicker';
import type { Course } from '../../../store/content/types/courses.types';
import { extractFirebaseErrorDetails } from '../../../utils/firebase/extractFirebaseError';
import { getErrorMessage } from '../../../utils/firebase/errors';

type CourseFormState = {
  title: string;
  subtitle: string;
  imageUri: string;
  durationLabel: string;
  description: string;
  isPublished: boolean;
};

const EMPTY_FORM: CourseFormState = {
  title: '',
  subtitle: '',
  imageUri: '',
  durationLabel: '',
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
  const { code, message } = extractFirebaseErrorDetails(error);
  const base = message || getErrorMessage(error);
  const uid = getCurrentUserId();
  const uidLine = uid ? `\nYour UID: ${uid}` : '';

  if (!isPermissionDenied(error)) {
    return `${base}${uidLine}`;
  }

  const service = code?.includes('storage') ? 'Storage' : 'Firestore';

  return (
    `${service} permission denied.${uidLine}\n\n` +
    'Fix checklist:\n' +
    '1) Firestore → users → (your UID) → field role must be exactly: admin\n' +
    '2) Sign out, sign back in, then retry\n' +
    '3) Deploy rules: cd Evolve && firebase deploy --only firestore:rules,storage\n' +
    `4) Error code: ${code ?? 'unknown'}`
  );
}

function ManageCourses() {
  const { courses, loading } = useCourses({ includeUnpublished: true });

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [localThumbnailUri, setLocalThumbnailUri] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const formRef = useRef(form);
  const localThumbnailRef = useRef<string | null>(null);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    localThumbnailRef.current = localThumbnailUri;
  }, [localThumbnailUri]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLocalThumbnailUri(null);
    setEditorVisible(true);
  };

  const openEditEditor = (course: Course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      subtitle: course.subtitle,
      imageUri: course.imageUri,
      durationLabel: course.durationLabel,
      description: course.description,
      isPublished: course.isPublished,
    });
    setLocalThumbnailUri(null);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLocalThumbnailUri(null);
  };

  const handlePickThumbnail = async () => {
    const result = await pickProfilePhotoFromGallery();
    if (result.success) {
      setLocalThumbnailUri(result.uri);
      setForm(prev => ({ ...prev, imageUri: '' }));
      return;
    }
    if (!result.cancelled && result.message) {
      Alert.alert('Thumbnail', result.message);
    }
  };

  const thumbnailPreviewUri =
    localThumbnailUri?.trim() || form.imageUri.trim() || null;

  const performSave = async () => {
    const current = formRef.current;
    const title = current.title.trim();

    if (!title) {
      Alert.alert('Title required', 'Enter a title for this course.');
      return;
    }

    const durationLabel = current.durationLabel.trim();
    if (!durationLabel) {
      Alert.alert('Duration required', 'Enter a duration label (e.g. 2h 30m).');
      return;
    }

    const hasAdmin = await isAdmin();
    if (!hasAdmin) {
      const uid = getCurrentUserId();
      Alert.alert(
        'Admin access required',
        `Your account does not have admin role in Firestore.${uid ? `\n\nUID: ${uid}\n\nSet users/${uid}.role to "admin" in Firebase Console, then sign out and back in.` : ''}`,
      );
      return;
    }

    const courseId =
      editingId ??
      doc(collection(db, FIRESTORE_COLLECTIONS.courses)).id;

    let imageUri = current.imageUri.trim();
    const pendingLocalThumbnail = localThumbnailRef.current?.trim();

    setSaving(true);
    try {
      if (pendingLocalThumbnail) {
        setUploadingThumbnail(true);
        imageUri = await uploadCourseThumbnail(courseId, pendingLocalThumbnail);
      }

      const payload = {
        title,
        subtitle: current.subtitle.trim(),
        imageUri,
        durationLabel,
        description: current.description.trim(),
        isPublished: current.isPublished,
      };

      if (editingId) {
        await updateCourse(editingId, payload);
      } else {
        await createCourse(payload, { courseId });
      }
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setUploadingThumbnail(false);
      setSaving(false);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      void performSave();
    });
  };

  const confirmDelete = (course: Course) => {
    Alert.alert('Delete course', `Remove "${course.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourse(course.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const handleMove = useCallback(
    async (courseId: string, direction: 'up' | 'down') => {
      setReorderingId(courseId);
      try {
        await moveCourse(courseId, direction, courses);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [courses],
  );

  const listHeader = useCallback(
    () => (
      <>
        <View style={styles.headerRow}>
          <Text style={styles.blockTitle}>Course catalog</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add course">
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Add title, duration, and thumbnail for each course. Published courses
          appear in the Courses tab for all users.
        </Text>
      </>
    ),
    [openCreateEditor],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (courses.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No courses yet. Add one to show in the Courses tab.
        </Text>
      );
    }
    return null;
  }, [courses.length, loading]);

  const renderCourse = useCallback(
    ({ item: course, index }: { item: Course; index: number }) => (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          {course.imageUri ? (
            <Image source={{ uri: course.imageUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}
          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle}>{course.title}</Text>
            {course.subtitle ? (
              <Text style={styles.cardSubtitle}>{course.subtitle}</Text>
            ) : null}
            {course.durationLabel ? (
              <Text style={styles.cardDuration}>{course.durationLabel}</Text>
            ) : null}
            {!course.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === course.id}
              onPress={() => handleMove(course.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={
                index === courses.length - 1 || reorderingId === course.id
              }
              onPress={() => handleMove(course.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(course)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDelete(course)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [confirmDelete, courses.length, handleMove, openEditEditor, reorderingId],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <AdminScreenLayout
      title="Manage Courses"
      subtitle="Add courses shown in the Courses tab"
      scrollable={false}>
      <FlatList
        data={courses}
        keyExtractor={keyExtractor}
        renderItem={renderCourse}
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
            {editingId ? 'Edit course' : 'New course'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <FormField
              label="Title"
              value={form.title}
              onChangeText={title => setForm(prev => ({ ...prev, title }))}
              placeholder="Introduction to Robotics"
            />
            <FormField
              label="Subtitle"
              value={form.subtitle}
              onChangeText={subtitle =>
                setForm(prev => ({ ...prev, subtitle }))
              }
              placeholder="Beginner-friendly overview"
            />
            <FormField
              label="Duration"
              value={form.durationLabel}
              onChangeText={durationLabel =>
                setForm(prev => ({ ...prev, durationLabel }))
              }
              placeholder="2h 30m"
            />
            <FormField
              label="Description"
              value={form.description}
              onChangeText={description =>
                setForm(prev => ({ ...prev, description }))
              }
              placeholder="What students will learn (optional)"
              multiline
            />
            <Text style={styles.fieldLabel}>Thumbnail</Text>
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={handlePickThumbnail}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Choose thumbnail image">
              <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.pickImageText}>Choose image from gallery</Text>
            </TouchableOpacity>
            <FormField
              label="Or paste thumbnail URL"
              value={form.imageUri}
              onChangeText={imageUri => {
                setLocalThumbnailUri(null);
                setForm(prev => ({ ...prev, imageUri }));
              }}
              placeholder="https://..."
              autoCapitalize="none"
            />
            {thumbnailPreviewUri ? (
              <Image source={{ uri: thumbnailPreviewUri }} style={styles.preview} />
            ) : null}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published in Courses tab</Text>
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
              title={
                uploadingThumbnail
                  ? 'Uploading thumbnail…'
                  : saving
                    ? 'Saving…'
                    : 'Save course'
              }
              onPress={handleSave}
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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
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
        autoCapitalize={autoCapitalize}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 16,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
  },
  thumbPlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDuration: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconButton: {
    padding: 6,
  },
  iconButtonDisabled: {
    opacity: 0.35,
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
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    marginBottom: 14,
  },
  pickImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  preview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: colors.primaryMuted,
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
  primaryButton: {
    backgroundColor: colors.primary,
    flex: 1,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default ManageCourses;
