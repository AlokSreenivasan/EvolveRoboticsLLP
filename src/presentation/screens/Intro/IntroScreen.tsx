import React, { useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import AppButton from '../../../components/AppButton.tsx';
import ExpandingDotPagination from '../../../components/ExpandingDotPagination';
import { useIntroFlow } from '../../context/IntroFlowContext';

const LAST_SLIDE_BOTTOM_OFFSET = 128;

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
  const [swiperSize, setSwiperSize] = useState({ width: 0, height: 0 });
  const swiperRef = useRef<Swiper>(null);
  const insets = useSafeAreaInsets();
  const isLastSlide = currentIndex === slides.length - 1;

  const onSwipeContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSwiperSize(prev =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  };

  return (
    <View style={styles.container}>
      {/* Swiper (full screen) */}
      <View style={styles.swipeContainer} onLayout={onSwipeContainerLayout}>
        {swiperSize.height > 0 ? (
        <Swiper
          ref={swiperRef}
          loop={false}
          width={swiperSize.width}
          height={swiperSize.height}
          showsPagination={false}
          onIndexChanged={index => setCurrentIndex(index)}
        >
          {slides.map(slide => (
            <View style={styles.slide} key={slide.id}>
              <Image source={slide.image} style={styles.image} resizeMode="cover" />
            </View>
          ))}
        </Swiper>
        ) : null}
      </View>

      <View
        style={[
          styles.paginationOverlay,
          {
            bottom: isLastSlide
              ? LAST_SLIDE_BOTTOM_OFFSET + insets.bottom
              : 28 + insets.bottom,
          },
        ]}>
        <ExpandingDotPagination
          total={slides.length}
          activeIndex={currentIndex}
          variant="dark"
          onDotPress={index => swiperRef.current?.scrollTo(index)}
        />
      </View>

      {/* Bottom overlay */}
      {isLastSlide && (
        <View style={[styles.bottomOverlay, { paddingBottom: 18 + insets.bottom }]}>
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  swipeContainer: {
    flex: 1,
  },
  paginationOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
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
});

export default IntroScreen;
