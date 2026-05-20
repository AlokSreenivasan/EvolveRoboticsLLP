import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header.tsx';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';

function SettingsScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const displayName = useStoredProfileFullName();
  const [loggingOut, setLoggingOut] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await auth().signOut();
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
      <View style={styles.headerContainer}>
        <Header
          title="Settings"
          onBellPress={() => Alert.alert('Bell clicked!')}
        />
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
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
            style={styles.avatarSmall}
          />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>sarahwoods@evolverobotics.com</Text>

          <AppButton
            title="Edit Profile"
            onPress={() => navigation.navigate('Profile')}
            buttonStyle={[styles.outlineButton, styles.outlineButtonInCard]}
            textStyle={styles.outlineButtonText}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listText}>🔒 Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listText}>🛡 Privacy Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listText}>🔔 Notification Preferences</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Text style={styles.versionText}>Version 2.1.1</Text>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.linkText}>📄 Privacy Policy</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.linkText}>📄 Terms of Service</Text>
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
  headerContainer: {
    backgroundColor: 'white',
    height: 80,
    justifyContent: 'center', // centers title vertically
  },

  scrollContent: {
    padding: 16,
    // backgroundColor: 'red'
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
    width: 76,
    height: 76,
    borderRadius: 36,
    // top: 15,
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
