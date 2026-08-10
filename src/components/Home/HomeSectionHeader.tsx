import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, homeAccents, sectionTitleStyle } from '../../constants/theme';
import { softenColor } from '../../utils/ui/softenColor';
import TactileButton from '../ui/TactileButton';

type HomeSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  /** Optional accent for the action chip (student-friendly section colors). */
  actionColor?: string;
  /** Kept for callers; filled Material chip uses `actionColor` as the fill. */
  actionBackground?: string;
};

function HomeSectionHeader({
  title,
  actionLabel,
  onActionPress,
  actionColor = homeAccents.sectionAction.text,
}: HomeSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onActionPress ? (
        <TactileButton
          onPress={onActionPress}
          hitSlop={8}
          style={styles.actionHit}
          faceColor={actionColor}
          edgeColor={softenColor(actionColor, 0.55)}
          borderColor="transparent"
          accessibilityLabel={actionLabel}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TactileButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: {
    ...sectionTitleStyle,
    fontWeight: '800',
  },
  actionHit: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.2,
  },
});

export default HomeSectionHeader;
