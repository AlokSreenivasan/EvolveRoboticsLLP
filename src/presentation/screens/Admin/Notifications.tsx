import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import { colors, cardShadow, spacing } from '../../../constants/theme';

function AdminNotifications() {
  return (
    <AdminScreenLayout
      title="Notifications"
      subtitle="Broadcasts and push campaigns">
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Coming soon</Text>
        <Text style={styles.placeholderText}>
          Compose in-app announcements and schedule push notifications for
          learners.
        </Text>
      </View>
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});

export default AdminNotifications;
