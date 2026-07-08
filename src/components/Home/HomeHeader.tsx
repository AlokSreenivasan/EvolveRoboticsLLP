import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Award } from 'lucide-react-native';

import { cardShadowLight, colors } from '../../constants/theme';

type HomeHeaderProps = {
  displayName: string;
};

function HomeHeader({ displayName }: HomeHeaderProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.tagline}>
          Keep learning, keep building the future!
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Certificates"
        accessibilityHint="View your earned certificates"
        style={({ pressed }) => [
          styles.certificateButton,
          pressed && styles.certificateButtonPressed,
        ]}>
        <View style={styles.certificateIconWrap}>
          <Award size={20} color={colors.primary} strokeWidth={2.25} />
        </View>
        <Text style={styles.certificateLabel}>Certificates</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
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
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadowLight,
  },
  certificateButtonPressed: {
    opacity: 0.88,
    backgroundColor: colors.primaryLight,
  },
  certificateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  certificateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 16,
  },
});

export default HomeHeader;
