import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import BackButton from '../BackButton';
import { colors, spacing } from '../../constants/theme';

type AdminScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

function AdminScreenLayout({
  title,
  subtitle,
  children,
  scrollable = true,
  contentContainerStyle,
}: AdminScreenLayoutProps) {
  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton withSpacingBelow />
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  titleBlock: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 32,
  },
  staticContent: {
    flex: 1,
    padding: spacing.screenHorizontal,
  },
});

export default AdminScreenLayout;
