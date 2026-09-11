import React, { useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import AppButton from '../../../components/AppButton.tsx';
import ExpandingDotPagination from '../../../components/ExpandingDotPagination';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';
import { useIntroFlow } from '../../context/IntroFlowContext';

const slides = [
  {
    id: 1,
    title: 'Learn Today Build Tomorrow',
    image: require('../../../assets/swipeScreenImages/swipe1.webp'),
  },
  {
    id: 2,
    title: 'Real Learning Real Impact',
    image: require('../../../assets/swipeScreenImages/swipe2.webp'),
  },
  {
    id: 3,
    title: 'Turn Ideas into Real Projects',
    image: require('../../../assets/swipeScreenImages/swipe4.webp'),
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

      {isLastSlide && (
        <View style={[styles.bottomOverlay, { paddingBottom: 20 + insets.bottom }]}>
          <SurfaceCard elevation="elevated" style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Welcome to Evolve</Text>
            <Text style={styles.ctaSubtitle}>
              Sign in to continue learning or create a new account
            </Text>

            <AppButton
              title="Log In"
              onPress={() => finishIntro('Login')}
              variant="primary"
              buttonStyle={styles.ctaButton}
            />

            <AppButton
              title="Create Account"
              onPress={() => finishIntro('SignUp')}
              variant="secondary"
              buttonStyle={styles.ctaButtonLast}
            />
          </SurfaceCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
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
    backgroundColor: colors.textPrimary,
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
  ctaCard: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: colors.heroOverlay,
    borderColor: 'rgba(238, 205, 244, 0.35)',
  },
  ctaTitle: {
    ...typography.screenTitle,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    ...typography.screenSubtitle,
    color: colors.heroHighlight,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  ctaButton: {
    marginBottom: 12,
    width: '100%',
  },
  ctaButtonLast: {
    width: '100%',
  },
});

export default IntroScreen;
