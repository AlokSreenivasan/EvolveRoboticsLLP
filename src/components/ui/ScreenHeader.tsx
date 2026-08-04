import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import BackButton from '../BackButton';
import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backDisabled?: boolean;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Compact header used under floating chrome. */
  compact?: boolean;
};

/**
 * Soft elevated page header — replaces hairline sticky bars across the app.
 */
function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  backDisabled = false,
  onBackPress,
  rightSlot,
  style,
  compact = false,
}: ScreenHeaderProps) {
  const centerTitle = !showBack && !rightSlot;

  return (
    <View style={[styles.header, compact && styles.headerCompact, style]}>
      {showBack ? (
        <BackButton
          withSpacingBelow={Boolean(subtitle) || !compact}
          disabled={backDisabled}
          onPress={onBackPress}
        />
      ) : null}

      <View style={[styles.titleRow, centerTitle && styles.titleRowCentered]}>
        <View
          style={centerTitle ? styles.titleBlockCentered : styles.titleBlock}>
          <Text
            style={[styles.title, centerTitle && styles.textCentered]}
            accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, centerTitle && styles.textCentered]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.cardRadiusLg,
    borderBottomRightRadius: spacing.cardRadiusLg,
    ...glassBorder,
    borderTopWidth: 0,
    ...cardShadowLight,
  },
  headerCompact: {
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleRowCentered: {
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleBlockCentered: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.screenSubtitle,
  },
  textCentered: {
    textAlign: 'center',
  },
  rightSlot: {
    paddingTop: 2,
  },
});

export default ScreenHeader;
