import React from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  // TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import Header from '../../../components/Header.tsx';
import AppButton from '../../../components/AppButton.tsx';
import { GraduationCap } from 'lucide-react-native';

function HomeScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Learning Platform"
          onBellPress={() => Alert.alert('Bell clicked!')}
          onAvatarPress={() => navigation.navigate('Profile')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
            style={styles.avatarSmall}
          />
          <Text style={styles.userName}>Sarah Woods</Text>
          <Text style={styles.userEmail}>Welcome back to your learning</Text>
          <Text style={styles.userEmail1}>journey!</Text>

          <AppButton
            title="Continue Learning"
            onPress={() => navigation.navigate('SignUp')}
            buttonStyle={styles.signUpButton}
            textStyle={styles.signUpText}
          />
        </View>


        {/*Quick Stats*/}
        <View style={styles.statsSection}>
          <Text style={styles.heading}>Quick Stats</Text>
          <View style={styles.statsCardView}>
            {/*Stats card 1*/}
            <View style={styles.statsCard}>
              <View style={styles.statsLine1}>
                <GraduationCap
                  size={30}
                  color="#4A90E2"
                  style={styles.iconStyle}
                />
                <View style={styles.statsCourseHeading}>
                  <Text style={styles.statsCourseHeadingText}>Courses</Text>
                  <Text style={styles.statsCourseHeadingText}>Enrolled</Text>
                </View>
              </View>
              <Text style={styles.coursesCount}>12</Text>
              <Text style={styles.statsCourseText}>
                Keep up the work great!
              </Text>
            </View>
            {/*Stats card 2*/}
            <View style={styles.statsCard}>
              <View style={styles.statsLine1}>
                <GraduationCap
                  size={30}
                  color="#4A90E2"
                  style={styles.iconStyle}
                />
                <View style={styles.statsCourseHeading}>
                  <Text style={styles.statsCourseHeadingText}>Completed</Text>
                  <Text style={styles.statsCourseHeadingText}>Courses</Text>
                </View>
              </View>
              <Text style={styles.coursesCount}>07</Text>
              <Text style={styles.statsCourseText}>
                Excellence progress so far
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.coursesSection}>
          <Text style={styles.heading}>Your Courses</Text>
          <ScrollView horizontal style={styles.coursesCardView}>
            <View style={styles.courseCard}>
              <Text>Hi</Text>
            </View>
            <View style={styles.courseCard}>
              <Text>Hello</Text>
            </View>
            <View style={styles.courseCard}>
              <Text>Hello1</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      <Text>Home Screen</Text>
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
  profileCard: {
    height: 170,
    padding: 16,
    borderRadius: 15,
    // borderColor: '#d3d3d3',
    // borderWidth: 1,
    backgroundColor: '#FAF2FF',
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
    // borderWidth: 1,
    // borderColor: '#a42a8b',
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

  statsSection: {
    backgroundColor: 'white',
    height: 240,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    top: 20,
  },
  statsCardView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#F5F5F5',
    height: 170,
    width: 170,
    borderRadius: 15,
    borderColor: '#E3E3E3',
    top: 40,
  },
  statsLine1: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingLeft: 10,
  },
  iconStyle: {
    left: 5,
    top: 8,
  },
  statsCourseHeading: {
    flexDirection: 'column',
    paddingLeft: 22,
    // backgroundColor: 'white',
  },
  statsCourseHeadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  coursesCount: {
    fontSize: 30,
    fontWeight: 'bold',
    left: 12,
  },
  statsCourseText: {
    fontSize: 12,
    left: 15,
    top: 10,
  },
  coursesSection: {
    backgroundColor: 'yellow',
    height: 400,
  },
  coursesCardView : {
    flexDirection: 'row',
    paddingTop: 30,
    // padding: 10,
  },
  courseCard : {
    height: 240,
    width: 300,
    borderWidth: 1,
    paddingLeft: 10,
    marginRight: 12,
    borderRadius: 15,
  }

});

export default HomeScreen;
