import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
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
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

/** tel:/mailto: are opened directly — canOpenURL is unreliable on simulators and Android 11+. */
async function openExternalUrl(url: string, failureMessage: string) {
  try {
    await Linking.openURL(url);
  } catch {
    appAlert(appAlertCopy.learner.unavailableTitle, failureMessage);
  }
}

function SupportScreen() {
  const handleEmailPress = () => {
    openExternalUrl(
      `mailto:${SUPPORT_EMAIL}`,
      appAlertCopy.learner.emailAppUnavailable,
    );
  };

  const handlePhonePress = () => {
    openExternalUrl(
      `tel:${SUPPORT_PHONE_DIAL}`,
      appAlertCopy.learner.phoneDialerUnavailable,
    );
  };

  return (
    <SettingsScreenLayout title="Support">
      <SettingsInfoCard
        icon={Headphones}
        iconColor={colors.accentOrange}
        iconBackgroundColor={colors.warningLight}
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
