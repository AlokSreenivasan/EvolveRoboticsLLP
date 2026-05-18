import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import AppButton from '../../../components/AppButton.tsx';
import { useIntroFlow } from '../../context/IntroFlowContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Explore the Future of Robotics',
    image: require('../../../assets/swipeImages/swipe1.png'),
  },
  {
    id: 2,
    title: 'Smart Automation for Everyone',
    image: require('../../../assets/swipeImages/swipe2.png'),
  },
  {
    id: 3,
    title: 'Innovating Tomorrow, Today',
    image: require('../../../assets/swipeImages/swipe3.png'),
  },
];

function IntroScreen() {
  const { finishIntro } = useIntroFlow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo + Skip */}
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/LOGO__.png')} style={styles.logo} />
        {currentIndex !== slides.length - 1 && (
          <TouchableOpacity
            onPress={() => finishIntro('Login')}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swiper */}
      <View style={styles.swipeContainer}>
        <Swiper
          ref={swiperRef}
          loop={false}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          paginationStyle={{ bottom: height * 0.05 }}
          onIndexChanged={index => setCurrentIndex(index)}
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

      {/* Buttons or Swipe Wrapper */}
      <View style={styles.buttonContainer}>
        {currentIndex === slides.length - 1 ? (
          <>
           
            <AppButton
              title="Login"
              onPress={() => finishIntro('Login')}
              buttonStyle={styles.loginButton}
              textStyle={styles.loginText}
            />

            <AppButton
              title="Sign Up"
              onPress={() => finishIntro('SignUp')}
              buttonStyle={styles.signUpButton}
              textStyle={styles.signUpText}
            />
          </>
        ) : (
          <TouchableWithoutFeedback
            onPress={() => swiperRef.current?.scrollBy(1, true)}
          >
            <View style={styles.swipeWrapper}>
              <Text style={styles.swipeText}>Swipe to explore</Text>
              <Text style={styles.swipeArrow}>➔</Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1, // Takes small space
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,
  },
  logo: {
    height: 120,
    width: 120,
    resizeMode: 'contain',
  },
  skipButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  skipText: {
    color: '#a42a8b',
    fontWeight: '600',
  },

  swipeContainer: {
    flex: 4, // Takes most space
    justifyContent: 'center',
    alignItems: 'center',
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

  buttonContainer: {
    flex: 1, // Bottom area
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#a42a8b',
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 10,
    width: '90%',
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
    borderRadius: 15,
    width: '90%',
    height: 40,
  },
  signUpText: {
    color: '#a42a8b',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  swipeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a42a8b', // translucent background
    paddingHorizontal: 46,
    paddingVertical: 14,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android shadow
  },
  swipeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  swipeArrow: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default IntroScreen;
