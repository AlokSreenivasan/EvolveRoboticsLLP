import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackButton, { backButtonOverlayStyle } from '../../../components/BackButton';
import DeleteAccountConfirmModal from '../../../components/Settings/DeleteAccountConfirmModal';
import Header from '../../../components/Header.tsx';
import { deleteAccount } from '../../../services/firebase/deleteAccountService';
import { hasEmailPasswordProvider } from '../../../services/firebase/authService';
function PrivacySettingsScreen() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const requiresPassword = hasEmailPasswordProvider();

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setShowDeleteModal(false);
    }
  };

  const handleConfirmDelete = async (currentPassword?: string) => {
    setDeleting(true);

    try {
      await deleteAccount({ currentPassword });
      setShowDeleteModal(false);
      Alert.alert(
        'Account Deleted',
        'Your account and associated data have been permanently removed.',
      );
    } catch (error) {
      Alert.alert(
        'Deletion Failed',
        error instanceof Error
          ? error.message
          : 'Could not delete your account. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <BackButton style={backButtonOverlayStyle} disabled={deleting} />
        <Header title="Privacy Settings" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy</Text>
          <Text style={styles.sectionDescription}>
            Manage how your account and personal data are handled in the app.
          </Text>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
          <Text style={styles.dangerDescription}>
            Permanently delete your account and remove your profile, sign-in
            access, and associated user data. This cannot be undone.
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            disabled={deleting}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteAccountConfirmModal
        visible={showDeleteModal}
        requiresPassword={requiresPassword}
        loading={deleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
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
  dangerSection: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ef9a9a',
    elevation: 2,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#c62828',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PrivacySettingsScreen;
