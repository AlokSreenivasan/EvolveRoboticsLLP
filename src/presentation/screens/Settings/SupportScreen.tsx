import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { Headphones } from 'lucide-react-native';

import SettingsCard from '../../../components/Settings/SettingsCard';
import SettingsDetailRow from '../../../components/Settings/SettingsDetailRow';
import SettingsInfoCard from '../../../components/Settings/SettingsInfoCard';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import SettingsSectionHeader from '../../../components/Settings/SettingsSectionHeader';
import { colors, spacing } from '../../../constants/theme';
import {
  SUPPORT_DESCRIPTION,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DIAL,
} from '../../../config/support';

/** tel:/mailto: are opened directly — canOpenURL is unreliable on simulators and Android 11+. */
async function openExternalUrl(url: string, failureMessage: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unavailable', failureMessage);
  }
}

function SupportScreen() {
  const handleEmailPress = () => {
    openExternalUrl(
      `mailto:${SUPPORT_EMAIL}`,
      'Could not open your email app. You can copy the address and email us directly.',
    );
  };

  const handlePhonePress = () => {
    openExternalUrl(
      `tel:${SUPPORT_PHONE_DIAL}`,
      'Could not open the phone dialer. You can call us at the number shown.',
    );
  };

  return (
    <SettingsScreenLayout title="Support">
      <SettingsInfoCard
        icon={Headphones}
        iconColor={colors.accentOrange}
        iconBackgroundColor="#FFF3E0"
        title="Get in touch"
        description={SUPPORT_DESCRIPTION}
      />

      <View style={styles.sectionBlock}>
        <SettingsSectionHeader title="Contact details" />
        <SettingsCard>
          <SettingsDetailRow
            label="Email"
            value={SUPPORT_EMAIL}
            onPress={handleEmailPress}
          />
          <SettingsDetailRow
            label="Phone"
            value={SUPPORT_PHONE}
            onPress={handlePhonePress}
          />
          <SettingsDetailRow
            label="Hours"
            value={SUPPORT_HOURS}
            isLast
          />
        </SettingsCard>
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: spacing.sectionGap,
  },
});

export default SupportScreen;
