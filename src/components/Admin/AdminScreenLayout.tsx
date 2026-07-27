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

import ScreenHeader from '../ui/ScreenHeader';
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
      <ScreenHeader title={title} subtitle={subtitle} />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 36,
  },
  staticContent: {
    flex: 1,
    padding: spacing.screenHorizontal,
    paddingTop: 16,
  },
});

export default AdminScreenLayout;
