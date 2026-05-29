import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'lucide-react-native';

import { colors } from '../../constants/theme';

type HomeHeaderProps = {
  displayName: string;
  onMenuPress?: () => void;
};

function HomeHeader({ displayName, onMenuPress }: HomeHeaderProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open menu">
        <Menu size={24} color={colors.primary} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.tagline}>
          Keep learning, keep building the future!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  menuButton: {
    marginRight: 12,
  },
  greetingBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default HomeHeader;
