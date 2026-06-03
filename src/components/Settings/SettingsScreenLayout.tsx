import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import BackButton, { backButtonOverlayStyle } from '../BackButton';
import Header from '../Header.tsx';
import { colors, spacing } from '../../constants/theme';

type SettingsScreenLayoutProps = {
  title: string;
  children: React.ReactNode;
  backDisabled?: boolean;
  loading?: boolean;
  keyboardAvoiding?: boolean;
  scrollContentStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'handled' | 'always' | 'never' | boolean;
};

function SettingsScreenLayout({
  title,
  children,
  backDisabled = false,
  loading = false,
  keyboardAvoiding = false,
  scrollContentStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps,
}: SettingsScreenLayoutProps) {
  const body = (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <BackButton
          style={backButtonOverlayStyle}
          disabled={backDisabled}
        />
        <Header title={title} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );

  if (!keyboardAvoiding) {
    return body;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenHeader: {
    backgroundColor: colors.surface,
    height: 80,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 32,
  },
});

export default SettingsScreenLayout;
