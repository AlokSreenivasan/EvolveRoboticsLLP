import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';

type HeaderProps = {
  title: string;
  avatarUrl?: string;
  onAvatarPress?: () => void;
  /** Use a settings gear in the header instead of a profile image. */
  rightAction?: 'avatar' | 'settings';
};

export default function Header({
  title,
  avatarUrl = 'https://randomuser.me/api/portraits/women/44.jpg',
  onAvatarPress,
  rightAction = 'avatar',
}: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>

      {onAvatarPress ? (
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onAvatarPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open settings">
          {rightAction === 'settings' ? (
            <Settings size={26} color="#a42a8b" strokeWidth={2} />
          ) : (
            <Image source={{ uri: avatarUrl }} style={styles.avatarSmall} />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  avatarButton: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
