import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Explore the Future of Robotics',
    image: require('../assets/swipeImages/swipe1.png'),
  },
  {
    id: 2,
    title: 'Smart Automation for Everyone',
    image: require('../assets/swipeImages/swipe2.png'),
  },
  {
    id: 3,
    title: 'Innovating Tomorrow, Today',
    image: require('../assets/swipeImages/swipe3.png'),
  },
];

function IntroScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/LOGO__.png')} style={styles.logo} />
      </View>

      <View style={styles.swipeContainer}>
        <Swiper
          loop={false}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          paginationStyle={{ bottom: height * 0.05 }}  // <-- Adjust position

        >
          {slides.map(slide => (
            <View style={styles.slide} key={slide.id}>
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.title}>{slide.title}</Text>
            </View>
          ))}
        </Swiper>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    height: 120,
    width: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#a42a8b',
    textAlign: 'center',
    marginTop: 320,
    position: 'absolute',
    textShadowColor: 'white', // border color
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },





  logoContainer: {
    flex: 1,          // Takes small space
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,

  },
  swipeContainer: {
    flex: 4,          // Takes most space
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "yellow",
  },
  buttonContainer: {
    flex: 1,          // Bottom area
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 1,
    height: height * 0.9,
    marginBottom: 30,

  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,

  },
  activeDot: {
    backgroundColor: '#a42a8b',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },


  loginButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    height: 40,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: '#a42a8b',
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    height: 40,
  },
  signUpText: {
    color: '#a42a8b',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },

});

export default IntroScreen;
