import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            <Text style={styles.placeholderIcon}>👤</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.changeButton}
        onPress={onChangePhotoPress}
        activeOpacity={0.8}>
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
    marginBottom: 24,
  },
  photoFrame: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eecdf4',
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
    backgroundColor: '#FAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.45,
  },
  changeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a42a8b',
  },
  changeButtonText: {
    color: '#a42a8b',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default ProfilePhotoSection;
