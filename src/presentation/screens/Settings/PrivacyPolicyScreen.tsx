import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { FileText } from 'lucide-react-native';

import SettingsInfoCard from '../../../components/Settings/SettingsInfoCard';
import SettingsScreenLayout from '../../../components/Settings/SettingsScreenLayout';
import {
  APP_PRIVACY_POLICY_URL,
  PRIVACY_POLICY_EFFECTIVE_DATE,
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_OPERATOR,
  PRIVACY_POLICY_SECTIONS,
} from '../../../constants/legal';
import { colors, spacing, typography } from '../../../constants/theme';
import { appAlert, appAlertCopy } from '../../../utils/alert/appAlert';

async function openHostedPolicy() {
  try {
    await Linking.openURL(APP_PRIVACY_POLICY_URL);
  } catch {
    appAlert(
      appAlertCopy.learner.unavailableTitle,
      'Unable to open the hosted privacy policy right now. Please try again shortly.',
    );
  }
}

function PrivacyPolicyScreen() {
  return (
    <SettingsScreenLayout
      title="Privacy Policy"
      showsVerticalScrollIndicator>
      <SettingsInfoCard
        icon={FileText}
        title={`${PRIVACY_POLICY_OPERATOR} — Evolve app`}
        description={`Effective ${PRIVACY_POLICY_EFFECTIVE_DATE}. This policy describes data the Evolve app collects.`}
      />

      <Text style={styles.intro}>{PRIVACY_POLICY_INTRO}</Text>

      {PRIVACY_POLICY_SECTIONS.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.heading}>{section.title}</Text>
          {section.paragraphs.map(paragraph => (
            <Text key={paragraph.slice(0, 48)} style={styles.body}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.link} onPress={openHostedPolicy}>
        Open the public policy page (Play Data Safety URL)
      </Text>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sectionGap,
  },
  section: {
    marginBottom: spacing.sectionGap,
  },
  heading: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  link: {
    ...typography.body,
    color: colors.link,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default PrivacyPolicyScreen;
