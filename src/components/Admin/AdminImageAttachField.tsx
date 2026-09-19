import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ImagePlus, Trash2 } from 'lucide-react-native';

import { colors, spacing } from '../../constants/theme';
import { pickProfilePhotoFromGallery } from '../../services/profilePhotoPicker';
import { appAlert, appAlertCopy } from '../../utils/alert/appAlert';
import TactileButton from '../ui/TactileButton';
import { adminStyles } from './adminStyles';

type AdminImageAttachFieldProps = {
  imageUri: string;
  onChange: (uri: string) => void;
  compact?: boolean;
  accessibilityLabel?: string;
};

function AdminImageAttachField({
  imageUri,
  onChange,
  compact = false,
  accessibilityLabel,
}: AdminImageAttachFieldProps) {
  const trimmed = imageUri.trim();

  const handlePick = useCallback(async () => {
    try {
      const result = await pickProfilePhotoFromGallery();
      if (result.success) {
        onChange(result.uri);
        return;
      }
      if (!result.cancelled && result.message) {
        appAlert(
          appAlertCopy.admin.imageTitle,
          appAlertCopy.admin.image(result.message),
        );
      }
    } catch {
      appAlert(
        appAlertCopy.admin.galleryOpenFailedTitle,
        appAlertCopy.admin.galleryOpenFailed,
      );
    }
  }, [onChange]);

  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <View style={styles.actions}>
        <TactileButton
          variant="ghost"
          style={
            compact
              ? styles.compactButton
              : [adminStyles.pickImageButton, styles.pickButton]
          }
          onPress={() => {
            handlePick().catch(() => {
              // Errors are surfaced by the picker.
            });
          }}
          accessibilityLabel={
            accessibilityLabel ??
            (trimmed ? 'Change image' : 'Add image')
          }>
          <ImagePlus size={compact ? 16 : 18} color={colors.primary} strokeWidth={2} />
          <Text
            style={compact ? styles.compactButtonText : adminStyles.pickImageText}>
            {trimmed ? 'Change image' : 'Add image'}
          </Text>
        </TactileButton>
        {trimmed ? (
          <TactileButton
            variant="ghost"
            style={styles.removeButton}
            onPress={() => onChange('')}
            accessibilityLabel="Remove image">
            <Trash2 size={16} color={colors.danger} strokeWidth={2} />
            <Text style={styles.removeText}>Remove</Text>
          </TactileButton>
        ) : null}
      </View>
      {trimmed ? (
        <Image
          source={{ uri: trimmed }}
          style={compact ? styles.compactPreview : styles.preview}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  compactWrap: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: spacing.chipRadius,
  },
  compactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  pickButton: {
    marginBottom: 0,
  },
  removeButton: {
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: spacing.chipRadius,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: spacing.inputRadius,
    marginTop: 10,
    backgroundColor: colors.primaryLight,
  },
  compactPreview: {
    width: '100%',
    height: 96,
    borderRadius: spacing.inputRadius,
    marginTop: 8,
    backgroundColor: colors.primaryLight,
  },
});

export default AdminImageAttachField;
