import React from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackButton, { backButtonOverlayStyle } from '../../../components/BackButton';
import Header from '../../../components/Header.tsx';
import {
  SUPPORT_DESCRIPTION,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DIAL,
} from '../../../config/support';

type SupportRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

function SupportRow({ label, value, onPress }: SupportRowProps) {
  const content = (
    <>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, onPress ? styles.rowValueLink : null]}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

async function openUrl(url: string, failureMessage: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unavailable', failureMessage);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unavailable', failureMessage);
  }
}

function SupportScreen() {
  const handleEmailPress = () => {
    openUrl(
      `mailto:${SUPPORT_EMAIL}`,
      'Could not open your email app. You can copy the address and email us directly.',
    );
  };

  const handlePhonePress = () => {
    openUrl(
      `tel:${SUPPORT_PHONE_DIAL}`,
      'Could not open the phone dialer. You can call us at the number shown.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <BackButton style={backButtonOverlayStyle} />
        <Header title="Support" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in touch</Text>
          <Text style={styles.sectionDescription}>{SUPPORT_DESCRIPTION}</Text>
        </View>

        <View style={styles.detailsSection}>
          <SupportRow
            label="Email"
            value={SUPPORT_EMAIL}
            onPress={handleEmailPress}
          />
          <SupportRow
            label="Phone"
            value={SUPPORT_PHONE}
            onPress={handlePhonePress}
          />
          <SupportRow label="Hours" value={SUPPORT_HOURS} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenHeader: {
    backgroundColor: '#fff',
    height: 80,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 16,
    color: '#1a1a2e',
  },
  rowValueLink: {
    color: '#a42a8b',
  },
});

export default SupportScreen;
