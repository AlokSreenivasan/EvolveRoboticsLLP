import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { cardShadowLight, colors, glassBorder, spacing } from '../../constants/theme';
import HomeSectionHeader from './HomeSectionHeader';

type HomeFeedSectionProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  subtitle?: string;
  loading?: boolean;
  errorMessage?: string | null;
  emptyTitle?: string;
  emptyMessage?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function HomeFeedSection({
  title,
  actionLabel,
  onActionPress,
  subtitle,
  loading = false,
  errorMessage = null,
  emptyTitle,
  emptyMessage,
  children,
  style,
}: HomeFeedSectionProps) {
  const showEmpty =
    !loading && !errorMessage && emptyTitle != null && children == null;

  return (
    <View style={[styles.section, style]}>
      <HomeSectionHeader
        title={title}
        actionLabel={actionLabel}
        onActionPress={onActionPress}
      />
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : errorMessage ? (
        <View style={styles.messageWrap}>
          <Text style={styles.messageText}>{errorMessage}</Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.messageWrap}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          {emptyMessage ? (
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          ) : null}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sectionGap,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 18,
  },
  loadingWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  messageWrap: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    ...glassBorder,
    ...cardShadowLight,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeFeedSection;
