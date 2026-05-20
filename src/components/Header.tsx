import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type HeaderProps = {
  title: string;
  avatarUrl?: string;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
};

export default function Header({
                                 title,
                                 avatarUrl = 'https://randomuser.me/api/portraits/women/44.jpg',
                                 onBellPress,
                                 onAvatarPress,
                               }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Title in center */}
      <Text style={styles.headerTitle}>{title}</Text>

      {(onBellPress || onAvatarPress) ? (
        <View style={styles.headerRight}>
          {onBellPress ? (
            <TouchableOpacity onPress={onBellPress}>
              <Text style={styles.bell}>🔔</Text>
            </TouchableOpacity>
          ) : null}
          {onAvatarPress ? (
            <TouchableOpacity onPress={onAvatarPress}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarSmall} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    height: 80,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRight: {
    position: 'absolute',
    right: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '20%',
  },
  bell: {
    padding: 6,
    fontSize: 20,
    right: 3,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
