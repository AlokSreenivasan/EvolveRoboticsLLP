import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GraduationCap } from 'lucide-react-native';

function QuickStatsCard() {
  return (
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
            <Text style={styles.statsCourseText}>Keep up the work great!</Text>
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
  );
}

const styles = StyleSheet.create({
  statsSection: {
    height: 250,
    top: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
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
    top: 20,

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
});

export default QuickStatsCard;
