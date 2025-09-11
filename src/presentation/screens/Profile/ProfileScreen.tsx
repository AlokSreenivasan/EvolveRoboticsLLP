import React from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../../components/Header.tsx';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import AppButton from '../../../components/AppButton.tsx';

function ProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Profile"
          onBellPress={() => Alert.alert('Bell clicked!')}
        />
      </View>

      <View style={styles.headerClicks}>
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
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
            style={styles.avatarSmall}
          />
          <Text style={styles.userName}>Sarah Woods</Text>
          <Text style={styles.userEmail}>sarahwoods@evolverobotics.com</Text>

          <AppButton
            title="Edit Profile"
            onPress={() => navigation.navigate('SignUp')}
            buttonStyle={styles.signUpButton}
            textStyle={styles.signUpText}
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

        <Text>Profile Content...</Text>
        <Text>More text...</Text>
        <Text>Even more...</Text>
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
  signUpButton: {
    borderWidth: 1,
    borderColor: '#a42a8b',
    paddingVertical: 10,
    borderRadius: 15,
    width: '100%',
    height: 40,
    top: 15,
  },
  signUpText: {
    color: '#a42a8b',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
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
  }
});

export default ProfileScreen;
