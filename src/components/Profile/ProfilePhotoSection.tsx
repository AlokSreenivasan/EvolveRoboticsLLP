import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';

type ProfilePhotoSectionProps = {
  photoUri: string | null;
  onChangePhotoPress?: () => void;
};

function ProfilePhotoSection({
  photoUri,
  onChangePhotoPress,
}: ProfilePhotoSectionProps) {
  const hasPhoto = Boolean(photoUri);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.photoFrame}
        onPress={onChangePhotoPress}
        activeOpacity={0.85}
        disabled={!onChangePhotoPress}>
        {hasPhoto ? (
          <Image source={{ uri: photoUri! }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Camera size={36} color={colors.primary} strokeWidth={2} opacity={0.45} />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.changeButton}
        onPress={onChangePhotoPress}
        activeOpacity={0.8}
        disabled={!onChangePhotoPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.changeButtonText}>
          {hasPhoto ? 'Change Photo' : 'Choose Photo'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        {hasPhoto
          ? 'Tap to choose a different photo from your gallery'
          : 'Select a photo from your gallery'}
      </Text>
    </View>
  );
}

const PHOTO_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  photoFrame: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    overflow: 'hidden',
    ...glassBorder,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
  },
  placeholder: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: spacing.buttonRadius,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  changeButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  hint: {
    ...typography.bodySecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default ProfilePhotoSection;
