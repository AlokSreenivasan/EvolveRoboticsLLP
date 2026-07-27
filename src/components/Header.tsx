import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';

import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../constants/theme';

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
      <Text style={styles.headerTitle} accessibilityRole="header">
        {title}
      </Text>

      {onAvatarPress ? (
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onAvatarPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open settings">
          {rightAction === 'settings' ? (
            <View style={styles.iconTile}>
              <Settings size={20} color={colors.primary} strokeWidth={2.25} />
            </View>
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
    backgroundColor: colors.surface,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  headerTitle: {
    ...typography.screenTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  avatarButton: {
    position: 'absolute',
    right: spacing.screenHorizontal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassBorder,
    ...cardShadowLight,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primaryMuted,
  },
});
