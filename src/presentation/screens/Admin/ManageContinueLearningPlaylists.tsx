import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  InteractionManager,
  Keyboard,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
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
import AdminCourseTrackPicker from '../../../components/Admin/AdminCourseTrackPicker';
import AdminSchoolAudiencePicker from '../../../components/Admin/AdminSchoolAudiencePicker';
import AppSwitch from '../../../components/AppSwitch';
import AppButton from '../../../components/AppButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, cardShadow, spacing } from '../../../constants/theme';
import { useContinueLearningPlaylists } from '../../hooks/useContinueLearningPlaylists';
import { useSchools } from '../../hooks/useSchools';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { FIRESTORE_COLLECTIONS } from '../../../services/firebase/constants';
import {
  createContinueLearningPlaylist,
  deleteContinueLearningPlaylist,
  isValidYouTubePlaylistUrl,
  moveContinueLearningPlaylist,
  resolveYouTubePlaylistUrl,
  updateContinueLearningPlaylist,
} from '../../../services/firebase/continueLearningPlaylistsService';
import { uploadContinueLearningThumbnail } from '../../../services/firebase/storageService';
import { pickProfilePhotoFromGallery } from '../../../services/profilePhotoPicker';
import type { ContinueLearningPlaylist } from '../../../store/content/types/continueLearningPlaylists.types';
import {
  courseTrackLabel,
  type CourseTrack,
} from '../../../store/content/types/courses.types';
import { extractFirebaseErrorDetails } from '../../../utils/firebase/extractFirebaseError';
import { formatSchoolAudienceSummary } from '../../../utils/content/schoolAudience';
import { getErrorMessage } from '../../../utils/firebase/errors';
import { getCurrentUserId } from '../../../services/firebase/authService';
import { isAdmin } from '../../../services/firebase/roleService';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type PlaylistFormState = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  videoCount: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_FORM: PlaylistFormState = {
  title: '',
  subtitle: '',
  imageUri: '',
  playlistUrl: '',
  videoCount: '1',
  track: null,
  isPublished: true,
};

function parseVideoCount(value: string): number | null {
  const parsed = Math.trunc(Number(value.trim()));
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 500) {
    return null;
  }
  return parsed;
}

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

  const service =
    code?.includes('storage') ? 'Storage' : 'Firestore';

  return (
    `${service} permission denied.${uidLine}\n\n` +
    'Fix checklist:\n' +
    '1) Firestore → users → (your UID) → field role must be exactly: admin\n' +
    '2) Sign out, sign back in, then retry\n' +
    '3) Deploy rules: cd Evolve && firebase deploy --only firestore:rules,storage\n' +
    `4) Error code: ${code ?? 'unknown'}`
  );
}

function ManageContinueLearningPlaylists() {
  const { playlists, loading } = useContinueLearningPlaylists({
    includeUnpublished: true,
  });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlaylistFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [localThumbnailUri, setLocalThumbnailUri] = useState<string | null>(
    null,
  );
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
    audienceForm.resetAudience();
    setEditorVisible(true);
  };

  const openEditEditor = (playlist: ContinueLearningPlaylist) => {
    setEditingId(playlist.id);
    setForm({
      title: playlist.title,
      subtitle: playlist.subtitle,
      imageUri: playlist.imageUri,
      playlistUrl: playlist.playlistUrl,
      videoCount: String(playlist.videoCount),
      track: playlist.track,
      isPublished: playlist.isPublished,
    });
    if (playlist.track === 'kids') {
      audienceForm.resetAudience({
        audience: playlist.audience,
        schoolIds: playlist.schoolIds,
        schoolGradeIds: playlist.schoolGradeIds,
      });
    } else {
      audienceForm.resetAudience();
    }
    setLocalThumbnailUri(null);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLocalThumbnailUri(null);
    audienceForm.resetAudience();
  };

  const handlePickThumbnail = async () => {
    const result = await pickProfilePhotoFromGallery();
    if (result.success) {
      setLocalThumbnailUri(result.uri);
      setForm(prev => ({ ...prev, imageUri: '' }));
      return;
    }
    if (!result.cancelled && result.message) {
      appAlert(
        appAlertCopy.admin.thumbnailTitle,
        appAlertCopy.admin.thumbnail(result.message),
      );
    }
  };

  const thumbnailPreviewUri =
    localThumbnailUri?.trim() || form.imageUri.trim() || null;

  const performSave = async () => {
    const current = formRef.current;
    const playlistUrl = resolveYouTubePlaylistUrl({
      playlistUrl: current.playlistUrl,
      title: current.title,
      subtitle: current.subtitle,
    });

    if (!isValidYouTubePlaylistUrl(playlistUrl)) {
      appAlert(
        appAlertCopy.admin.playlistLinkNeeded,
        appAlertCopy.admin.playlistLinkRequired,
      );
      return;
    }

    const title = current.title.trim();
    if (!title) {
      appAlert(
        appAlertCopy.admin.titleNeeded,
        appAlertCopy.admin.playlistTitleRequired,
      );
      return;
    }

    const videoCount = parseVideoCount(current.videoCount);
    if (videoCount == null) {
      appAlert(
        appAlertCopy.admin.videoCountNeeded,
        appAlertCopy.admin.videoCountRequired,
      );
      return;
    }

    if (current.track !== 'kids' && current.track !== 'professionals') {
      appAlert(
        appAlertCopy.admin.visibilityRequiredTitle,
        appAlertCopy.admin.trackVisibilityRequired,
      );
      return;
    }

    if (current.track === 'kids') {
      const audienceError = audienceForm.validate();
      if (audienceError) {
        appAlert(
          appAlertCopy.admin.schoolVisibilityRequiredTitle,
          appAlertCopy.admin.schoolVisibilityRequired(audienceError),
        );
        return;
      }
    }

    const hasAdmin = await isAdmin();
    if (!hasAdmin) {
      const uid = getCurrentUserId();
      appAlert(
        appAlertCopy.admin.adminAccessRequiredTitle,
        appAlertCopy.admin.adminAccessRequired(uid),
      );
      return;
    }

    const playlistId =
      editingId ??
      doc(collection(db, FIRESTORE_COLLECTIONS.continueLearningPlaylists)).id;

    let imageUri = current.imageUri.trim();
    const pendingLocalThumbnail = localThumbnailRef.current?.trim();

    setSaving(true);
    try {
      if (pendingLocalThumbnail) {
        setUploadingThumbnail(true);
        imageUri = await uploadContinueLearningThumbnail(
          playlistId,
          pendingLocalThumbnail,
        );
      }

      const payload = {
        title,
        subtitle: current.subtitle.trim(),
        imageUri,
        playlistUrl,
        videoCount,
        track: current.track,
        isPublished: current.isPublished,
        ...(current.track === 'kids'
          ? audienceForm.toPayload()
          : { audience: 'all' as const, schoolIds: [], schoolGradeIds: {} }),
      };

      if (editingId) {
        await updateContinueLearningPlaylist(editingId, payload);
      } else {
        await createContinueLearningPlaylist(payload, { playlistId });
      }
      closeEditor();
    } catch (error) {
      const details = extractFirebaseErrorDetails(error);
      if (__DEV__) {
        console.warn('[ManageContinueLearningPlaylists] save failed', details);
      }
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
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

  const confirmDelete = (playlist: ContinueLearningPlaylist) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('playlist'),
      appAlertCopy.admin.deleteConfirm('playlist', playlist.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContinueLearningPlaylist(playlist.id);
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

  const handleMove = useCallback(
    async (playlistId: string, direction: 'up' | 'down') => {
      setReorderingId(playlistId);
      try {
        await moveContinueLearningPlaylist(playlistId, direction, playlists);
      } catch (error) {
        appAlert(appAlertCopy.admin.reorderFailedTitle, appAlertCopy.admin.reorderFailed);
      } finally {
        setReorderingId(null);
      }
    },
    [playlists],
  );

  const listHeader = useCallback(
    () => (
      <>
        <View style={styles.headerRow}>
          <Text style={styles.blockTitle}>YouTube playlists</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add playlist">
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Add a YouTube playlist link, title, and subtitle. Choose a thumbnail
          from your gallery or paste an image URL. Published lessons appear on
          Home and in To Do.
        </Text>
      </>
    ),
    [openCreateEditor],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (playlists.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No lessons yet. Add a YouTube playlist to show on Home and in To Do.
        </Text>
      );
    }
    return null;
  }, [loading, playlists.length]);

  const renderPlaylist = useCallback(
    ({ item: playlist, index }: { item: ContinueLearningPlaylist; index: number }) => (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          {playlist.imageUri ? (
            <Image source={{ uri: playlist.imageUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {playlist.title}
            </Text>
            {playlist.subtitle ? (
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {playlist.subtitle}
              </Text>
            ) : null}
            <Text style={styles.cardDetail}>
              {courseTrackLabel(playlist.track)}
              {playlist.track === 'kids'
                ? ` · ${formatSchoolAudienceSummary(playlist, schools)}`
                : ''}
              {' · '}
              {playlist.videoCount} video
              {playlist.videoCount === 1 ? '' : 's'}
            </Text>
            {!playlist.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === playlist.id}
              onPress={() => handleMove(playlist.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={
                index === playlists.length - 1 || reorderingId === playlist.id
              }
              onPress={() => handleMove(playlist.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(playlist)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDelete(playlist)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [
      confirmDelete,
      handleMove,
      openEditEditor,
      playlists.length,
      reorderingId,
      schools,
    ],
  );

  const keyExtractor = useCallback(
    (item: ContinueLearningPlaylist) => item.id,
    [],
  );

  return (
    <AdminScreenLayout
      title="Lessons"
      subtitle="Manage lesson playlists shown on Home and in To Do"
      scrollable={false}>
      <FlatList
        data={playlists}
        keyExtractor={keyExtractor}
        renderItem={renderPlaylist}
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
            {editingId ? 'Edit playlist' : 'New playlist'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <FormField
              label="Title"
              value={form.title}
              onChangeText={title => setForm(prev => ({ ...prev, title }))}
              placeholder="PIC16F877A Tutorial Series"
            />
            <FormField
              label="YouTube playlist URL"
              value={form.playlistUrl}
              onChangeText={playlistUrl =>
                setForm(prev => ({ ...prev, playlistUrl }))
              }
              placeholder="https://youtube.com/playlist?list=PL..."
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
            <FormField
              label="Subtitle"
              value={form.subtitle}
              onChangeText={subtitle =>
                setForm(prev => ({ ...prev, subtitle }))
              }
              placeholder="Introduction to Robotics"
            />
            <FormField
              label="Number of videos in playlist"
              value={form.videoCount}
              onChangeText={videoCount =>
                setForm(prev => ({ ...prev, videoCount }))
              }
              placeholder="18"
              keyboardType="number-pad"
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
              placeholder="https://i.ytimg.com/vi/.../hqdefault.jpg"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
            {thumbnailPreviewUri ? (
              <Image source={{ uri: thumbnailPreviewUri }} style={styles.preview} />
            ) : null}
            <AdminCourseTrackPicker
              value={form.track}
              onChange={track => {
                setForm(prev => ({ ...prev, track }));
                if (track === 'professionals') {
                  audienceForm.resetAudience();
                }
              }}
              label="Visibility *"
              hint="Required. Choose whether this playlist is shown to kids or professionals on Home."
            />
            {form.track === 'kids' ? (
              <AdminSchoolAudiencePicker
                label="School visibility"
                hint="Choose all schools or specific schools, then set grade visibility for each selected school."
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
              />
            ) : null}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published on home</Text>
              <AppSwitch
                value={form.isPublished}
                onValueChange={isPublished =>
                  setForm(prev => ({ ...prev, isPublished }))
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
                    : 'Save playlist'
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
  keyboardType?: 'default' | 'url' | 'number-pad';
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
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
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
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
    alignItems: 'flex-start',
    gap: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    backgroundColor: colors.primaryMuted,
  },
  cardTextWrap: {
    flex: 1,
    minWidth: 0,
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
  cardDetail: {
    fontSize: 12,
    color: colors.textMuted,
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
    flexShrink: 0,
  },
  iconButton: {
    padding: 4,
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
    flex: 1,
    flexShrink: 1,
    paddingRight: 12,
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

export default ManageContinueLearningPlaylists;
