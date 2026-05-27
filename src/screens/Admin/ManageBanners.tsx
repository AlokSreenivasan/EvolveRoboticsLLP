import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AdminScreenLayout from '../../components/Admin/AdminScreenLayout';
import { colors, cardShadow, spacing } from '../../constants/theme';

function ManageBanners() {
  return (
    <AdminScreenLayout
      title="Manage Banners"
      subtitle="Home hero carousel and promos">
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Coming soon</Text>
        <Text style={styles.placeholderText}>
          Upload banner images, set display order, and schedule promotional
          slides for the home screen.
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

export default ManageBanners;
