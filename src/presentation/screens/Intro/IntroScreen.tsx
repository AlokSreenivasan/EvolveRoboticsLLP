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
    // image: require('../../../assets/swipeImages/swipe1.png'),
    image: require('../../../assets/swipeScreenImages/swipe1.png'),

  },
  {
    id: 2,
    title: 'Smart Automation for Everyone',
    // image: require('../../../assets/swipeImages/swipe2.png'),
    image: require('../../../assets/swipeScreenImages/swipe2.png'),
  },
  {
    id: 3,
    title: 'Innovating Tomorrow, Today',
    // image: require('../../../assets/swipeImages/swipe3.png'),
    image: require('../../../assets/swipeScreenImages/swipe4.png'),
  },
];

function IntroScreen() {
  const { finishIntro } = useIntroFlow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Swiper (full screen) */}
      <View style={styles.swipeContainer}>
        <Swiper
          ref={swiperRef}
          loop={false}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          paginationStyle={styles.pagination}
          onIndexChanged={index => setCurrentIndex(index)}
        >
          {slides.map(slide => (
            <View style={styles.slide} key={slide.id}>
              <Image source={slide.image} style={styles.image} resizeMode="cover" />
            </View>
          ))}
        </Swiper>
      </View>

      {/* Skip overlay */}
      {currentIndex !== slides.length - 1 && (
        <TouchableOpacity
          onPress={() => finishIntro('Login')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
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
          <TouchableWithoutFeedback onPress={() => swiperRef.current?.scrollBy(1, true)}>
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
    backgroundColor: '#000',
  },
  skipButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#a42a8b',
    fontWeight: '600',
  },

  swipeContainer: {
    flex: 1,
  },
  pagination: {
    bottom: height * 0.14,
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
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 12,
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
