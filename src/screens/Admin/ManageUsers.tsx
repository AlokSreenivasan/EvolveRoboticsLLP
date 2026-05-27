import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AdminScreenLayout from '../../components/Admin/AdminScreenLayout';
import { colors, cardShadow, spacing } from '../../constants/theme';

function ManageUsers() {
  return (
    <AdminScreenLayout
      title="Manage Users"
      subtitle="Accounts and roles">
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Coming soon</Text>
        <Text style={styles.placeholderText}>
          Search users, review profiles, and update roles between user and
          admin. Role changes should be performed via secure backend rules.
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

export default ManageUsers;
