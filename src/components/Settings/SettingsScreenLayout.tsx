import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import BackButton, { backButtonOverlayStyle } from '../BackButton';
import Header from '../Header';
import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../constants/theme';
import ScreenSafeArea from '../ui/ScreenSafeArea';

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
    <ScreenSafeArea style={styles.container}>
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
    </ScreenSafeArea>
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
    minHeight: 80,
    justifyContent: 'center',
    borderBottomLeftRadius: spacing.cardRadiusLg,
    borderBottomRightRadius: spacing.cardRadiusLg,
    ...glassBorder,
    borderTopWidth: 0,
    ...cardShadowLight,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 36,
  },
});

export default SettingsScreenLayout;
