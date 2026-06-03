import React, { useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import AppButton from '../../../components/AppButton.tsx';
import ExpandingDotPagination from '../../../components/ExpandingDotPagination';
import { colors, spacing } from '../../../constants/theme';
import { useIntroFlow } from '../../context/IntroFlowContext';

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

      {!isLastSlide && (
        <View
          style={[
            styles.paginationOverlay,
            { bottom: 28 + insets.bottom },
          ]}>
          <ExpandingDotPagination
            total={slides.length}
            activeIndex={currentIndex}
            variant="dark"
            showLabel={false}
            onDotPress={index => swiperRef.current?.scrollTo(index)}
          />
        </View>
      )}

      {/* Bottom overlay */}
      {isLastSlide && (
        <View style={[styles.bottomOverlay, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.ctaScrim}>
            <Text style={styles.ctaTitle}>Welcome to Evolve</Text>
            <Text style={styles.ctaSubtitle}>
              Sign in to continue learning or create a new account
            </Text>

            <AppButton
              title="Log In"
              onPress={() => finishIntro('Login')}
              buttonStyle={styles.loginButton}
              textStyle={styles.loginText}
            />

            <AppButton
              title="Create Account"
              onPress={() => finishIntro('SignUp')}
              buttonStyle={styles.signUpButton}
              textStyle={styles.signUpText}
            />
          </View>
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
    paddingHorizontal: spacing.screenHorizontal,
  },
  ctaScrim: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(238, 205, 244, 0.35)',
    alignItems: 'stretch',
  },
  ctaTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  ctaSubtitle: {
    color: colors.heroHighlight,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  loginButton: {
    backgroundColor: colors.primary,
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  loginText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpButton: {
    backgroundColor: colors.surface,
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primaryMuted,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  signUpText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default IntroScreen;
