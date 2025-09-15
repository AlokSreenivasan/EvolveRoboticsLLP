import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
function UpcomingEventsCard() {
  return (
    <View style={styles.statsSection}>
      {/*<Text style={styles.heading}>Upcoming Events</Text>*/}

      <View style={styles.statsCardView}>
        <View style={styles.statsCard}>
          {/*Line 1*/}
          <View style={styles.titleLine}>
            <View style={styles.eventType}>
              <Text style={styles.eventText}>Webinar</Text>
            </View>
            <Text style={styles.eventDate}>Aug 12</Text>
          </View>

          {/*Event title line*/}
          <View style={styles.eventTitleView}>
            <Text style={styles.eventTitle}>
              Live Q&A: Deep Learning with Robotics
            </Text>
          </View>
          <View style={styles.eventDetailsView}>
            <Text style={styles.eventDetailsText}>Online Webinar</Text>
            <Text style={styles.eventDetailsText}>.</Text>
            <Text style={styles.eventDetailsText}>3:00 PM PST</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    height: 250,
    // top: 20,
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
    backgroundColor: 'white',
    padding: 18,
    height: 190,
    width: 350,
    borderRadius: 15,
    borderColor: '#E3E3E3',
    top: 20,
    marginLeft: 10,
    borderWidth: 1,
    // borderColor: "#E3E3E3",
    // Android
    elevation: 3,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventType: {
    backgroundColor: 'lightgrey',
    borderRadius: 12,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    width: 100,
    height: 25,
    alignItems: 'center',
  },

  eventText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '400',
  },
  eventTitleView: {
    flexDirection: 'row',
    top: 10,
    height: 80,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  eventDetailsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 7,
    height: 40,
    marginRight: 12,
  },
  eventDetailsText: {
    color: 'grey',
  }
});

export default UpcomingEventsCard;
