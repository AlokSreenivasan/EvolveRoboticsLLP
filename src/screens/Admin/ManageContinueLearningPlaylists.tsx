import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';

import AdminScreenLayout from '../../components/Admin/AdminScreenLayout';
import AppButton from '../../components/AppButton';
import { colors, cardShadow, spacing } from '../../constants/theme';
import { useContinueLearningPlaylists } from '../../presentation/hooks/useContinueLearningPlaylists';
import { FIRESTORE_COLLECTIONS } from '../../services/firebase/constants';
import {
  createContinueLearningPlaylist,
  deleteContinueLearningPlaylist,
  isValidYouTubePlaylistUrl,
  moveContinueLearningPlaylist,
  resolveYouTubePlaylistUrl,
  updateContinueLearningPlaylist,
} from '../../services/firebase/continueLearningPlaylistsService';
import { uploadContinueLearningThumbnail } from '../../services/firebase/storageService';
import { pickProfilePhotoFromGallery } from '../../services/profilePhotoPicker';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import { extractFirebaseErrorDetails } from '../../utils/firebase/extractFirebaseError';
import { getErrorMessage } from '../../utils/firebase/errors';
import { getCurrentUserId } from '../../services/firebase/authService';
import { isAdmin } from '../../services/firebase/roleService';

type PlaylistFormState = {
  title: string;
  subtitle: string;
  imageUri: string;
  playlistUrl: string;
  isPublished: boolean;
};

const EMPTY_FORM: PlaylistFormState = {
  title: '',
  subtitle: '',
  imageUri: '',
  playlistUrl: '',
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
    setEditorVisible(true);
  };

  const openEditEditor = (playlist: ContinueLearningPlaylist) => {
    setEditingId(playlist.id);
    setForm({
      title: playlist.title,
      subtitle: playlist.subtitle,
      imageUri: playlist.imageUri,
      playlistUrl: playlist.playlistUrl,
      isPublished: playlist.isPublished,
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
    const playlistUrl = resolveYouTubePlaylistUrl({
      playlistUrl: current.playlistUrl,
      title: current.title,
      subtitle: current.subtitle,
    });

    if (!isValidYouTubePlaylistUrl(playlistUrl)) {
      Alert.alert(
        'Playlist link required',
        'Paste a YouTube playlist URL in the Playlist URL field (must include list=).',
      );
      return;
    }

    const title = current.title.trim();
    if (!title) {
      Alert.alert('Title required', 'Enter a title for this playlist.');
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

    const playlistId =
      editingId ??
      firestore().collection(FIRESTORE_COLLECTIONS.continueLearningPlaylists).doc()
        .id;

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
        isPublished: current.isPublished,
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

  const confirmDelete = (playlist: ContinueLearningPlaylist) => {
    Alert.alert('Delete playlist', `Remove "${playlist.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContinueLearningPlaylist(playlist.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const handleMove = useCallback(
    async (playlistId: string, direction: 'up' | 'down') => {
      setReorderingId(playlistId);
      try {
        await moveContinueLearningPlaylist(playlistId, direction, playlists);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [playlists],
  );

  return (
    <AdminScreenLayout
      title="Continue Learning"
      subtitle="Add YouTube playlists shown on the home screen"
      scrollable={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
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
          from your gallery or paste an image URL. Published playlists appear on
          Home.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : playlists.length === 0 ? (
          <Text style={styles.emptyText}>
            No playlists yet. Add a YouTube playlist to show on the home screen.
          </Text>
        ) : (
          playlists.map((playlist, index) => (
            <View key={playlist.id} style={styles.card}>
              <View style={styles.cardRow}>
                {playlist.imageUri ? (
                  <Image
                    source={{ uri: playlist.imageUri }}
                    style={styles.thumb}
                  />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]} />
                )}
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{playlist.title}</Text>
                  {playlist.subtitle ? (
                    <Text style={styles.cardSubtitle}>{playlist.subtitle}</Text>
                  ) : null}
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
                      index === playlists.length - 1 ||
                      reorderingId === playlist.id
                    }
                    onPress={() => handleMove(playlist.id, 'down')}
                  />
                  <IconButton
                    icon={Pencil}
                    onPress={() => openEditEditor(playlist)}
                  />
                  <IconButton
                    icon={Trash2}
                    onPress={() => confirmDelete(playlist)}
                    danger
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published on home</Text>
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
  keyboardType?: 'default' | 'url';
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

export default ManageContinueLearningPlaylists;
