import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import Header from '../../../components/Header.tsx';
import AppButton from '../../../components/AppButton.tsx';
import CourseCard from '../../../components/Home/CourseCard.tsx';
import QuickStatsCard from '../../../components/Home/QuickStatsCard.tsx';
import UpcomingEventsCard from '../../../components/Home/UpcomingEventsCard.tsx';
import NotificationCard from '../../../components/Home/NotificationCard.tsx';
import { useAuth } from '../../context/AuthContext';
import { useStoredProfileFullName } from '../../hooks/useStoredProfileFullName';

function HomeScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const displayName = useStoredProfileFullName();
  const { avatarUri } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Learning Platform"
          rightAction="settings"
          onAvatarPress={() => navigation.navigate('Settings')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarSmall}
          />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>Welcome back to your learning</Text>
          <Text style={styles.userEmail1}>journey!</Text>

          <AppButton
            title="Continue Learning"
            // onPress={() => navigation.navigate('SignUp')}
            buttonStyle={styles.signUpButton}
            textStyle={styles.signUpText}
          />
        </View>

        {/*Quick Stats*/}
        <QuickStatsCard />

        {/*Courses section*/}
        <View style={styles.coursesSection}>
          <Text style={styles.heading}>Your Courses</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coursesCardView}
          >
            <CourseCard />
            <CourseCard />
            <CourseCard />
          </ScrollView>
        </View>

        {/*Upcoming Events section*/}
        <View style={styles.UpcomingEventsSection}>
          <Text style={styles.heading}>Upcoming Events</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coursesCardView}
          >
            <UpcomingEventsCard />
            <UpcomingEventsCard />
            <UpcomingEventsCard />
          </ScrollView>
        </View>

        {/*Recent Notifications*/}
        <View style={styles.notificationSection}>
          <Text style={styles.heading}>Upcoming Notifications</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.notificationsView}
          >
            <NotificationCard/>
            {/*<Text style={styles.heading}>Your Notifications</Text>*/}
          </ScrollView>
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
  headerContainer: {
    backgroundColor: 'white',
    height: 80,
    justifyContent: 'center', // centers title vertically
  },

  scrollContent: {
    padding: 16,
  },
  profileCard: {
    height: 170,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#FAF2FF',
  },
  avatarSmall: {
    width: 76,
    height: 76,
    borderRadius: 36,
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
    flexWrap: 'wrap',
  },
  userEmail1: {
    fontSize: 15,
    fontWeight: '400',
    position: 'absolute',
    top: 78,
    left: 120,
    flexWrap: 'wrap',
  },
  signUpButton: {
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    height: 40,
    top: 15,
    backgroundColor: '#a42a8b',
  },
  signUpText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  coursesSection: {
    backgroundColor: 'white',
    height: 300,
    // top: 20
  },
  coursesCardView: {
    flexDirection: 'row',
    // backgroundColor: 'yellow',
  },
  UpcomingEventsSection: {
    // top: 20,
    height: 300,
    // borderWidth: 2,
    // backgroundColor: 'yellow',
  },
  upcomingEventsView: {
    flexDirection: 'row',
    height: 250,
    width: 300,
    borderWidth: 1,
  },
  headingEvents: {
    fontSize: 20,
    fontWeight: 'bold',
    // top: 20,
  },
  notificationSection: {
    height: 650,
    // backgroundColor: 'yellow',
  },
  notificationsView: {
    flexDirection: 'column',
    height: 250,
    width: '100%',
    // borderWidth: 1,
    // borderColor: '#FAF2FF',
  }
});

export default HomeScreen;
