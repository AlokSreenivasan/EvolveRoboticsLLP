import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

type HomeHeaderProps = {
  displayName: string;
};

function HomeHeader({ displayName }: HomeHeaderProps) {
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {firstName}</Text>
      <Text style={styles.tagline}>
        Keep learning, keep building the future!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
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
