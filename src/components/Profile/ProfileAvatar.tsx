import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { User } from 'lucide-react-native';

type ProfileAvatarProps = {
  /** Remote Storage URL or local picker URI; omit for empty placeholder. */
  imageUri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function ProfileAvatar({
  imageUri,
  size = 76,
  style,
}: ProfileAvatarProps) {
  const hasPhoto = Boolean(imageUri?.trim());
  const radius = size / 2;

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}>
      {hasPhoto ? (
        <Image
          source={{ uri: imageUri!.trim() }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: radius },
          ]}>
          <User
            size={Math.round(size * 0.42)}
            color="#a42a8b"
            strokeWidth={2}
            opacity={0.55}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eecdf4',
    backgroundColor: '#FAF2FF',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF2FF',
  },
});
