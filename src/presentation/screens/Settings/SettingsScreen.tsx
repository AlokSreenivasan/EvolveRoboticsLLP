import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { signOut } from '../../../services/firebase/authService';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header.tsx';
import ProfileAvatar from '../../../components/Profile/ProfileAvatar.tsx';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import { useAuth } from '../../context/AuthContext';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';

function SettingsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { user, profile, profileImage } = useAuth();
  const displayName = useStoredProfileFullName();
  const userEmail = profile?.email ?? user?.email ?? '';
  const [loggingOut, setLoggingOut] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert('Logout Failed', 'Could not sign out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: performLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Header title="Settings" />
      </View>

      {/* <View style={styles.headerClicks}>
        <View style={styles.headerSubClicks}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text
              style={[
                styles.tabText,
                route.name === 'Home' && styles.activeTabText,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>
        </View>


        <View style={styles.headerSubClicks}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text
              style={[
                styles.tabText,
                route.name === 'Profile' && styles.activeTabText,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <ProfileAvatar
            imageUri={profileImage}
            size={76}
            style={styles.avatarSmall}
          />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {userEmail}
          </Text>

          <AppButton
            title="Edit Profile"
            onPress={() => navigation.navigate('Profile')}
            buttonStyle={[styles.outlineButton, styles.outlineButtonInCard]}
            textStyle={styles.outlineButtonText}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.listText}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listText}>Privacy Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listText}>Notification Preferences</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Text style={styles.versionText}>Version 2.1.1</Text>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title={loggingOut ? 'Logging out...' : 'Log Out'}
          onPress={handleLogoutPress}
          buttonStyle={[styles.outlineButton, styles.logoutButtonSpacing]}
          textStyle={styles.outlineButtonText}
          disabled={loggingOut}
        />
        {loggingOut ? (
          <ActivityIndicator color="#a42a8b" style={styles.loader} />
        ) : null}
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
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  backText: {
    color: '#a42a8b',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerClicks: {
    flexDirection: 'row',
    borderColor: 'lightgrey',
    borderBottomWidth: 1,
    height: 50,
    alignItems: 'center',
  },
  headerSubClicks: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'black',
  },
  activeTabText: {
    color: '#a42a8b', // highlight active tab
    fontWeight: '400',
  },

  profileCard: {
    height: 170,
    padding: 16,
    borderRadius: 15,
    borderColor: '#d3d3d3',
    borderWidth: 1,
    // borderColor: 'black',
  },
  avatarSmall: {
    left: 12,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    left: 120,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '400',
    position: 'absolute',
    top: 60,
    left: 120,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#a42a8b',
    paddingVertical: 10,
    borderRadius: 15,
    width: '100%',
    height: 40,
  },
  outlineButtonText: {
    color: '#a42a8b',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  outlineButtonInCard: {
    top: 15,
  },
  loader: {
    marginTop: 12,
    marginBottom: 24,
    alignSelf: 'center',
  },
  section: {
    // borderWidth: 1,
    // borderColor: '#d3d3d3',
    // borderRadius: 15,
    // width: '100%',
    // height: 200,
    top: 16,
    // paddingVertical: 10,
    paddingHorizontal: 20,

    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  listText: {
    fontSize: 15,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
  versionText: {
    fontSize: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  linkText: {
    fontSize: 15,
    color: '#a42a8b',
  },
  logoutButtonSpacing: {
    marginTop: 8,
  },
});

export default SettingsScreen;
