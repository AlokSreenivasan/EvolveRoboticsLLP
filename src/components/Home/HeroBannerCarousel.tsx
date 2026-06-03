import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { HERO_SLIDES } from '../../constants/homeScreenData';
import { colors } from '../../constants/theme';

const heroBanner = require('../../presentation/screens/Home/assets/Homepage banner.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 168;

type HeroBannerCarouselProps = {
  onCtaPress?: () => void;
};

function HeroBannerCarousel({ onCtaPress }: HeroBannerCarouselProps) {
  const slide = HERO_SLIDES[0];

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={heroBanner}
        style={styles.banner}
        imageStyle={styles.bannerImage}
        resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.headline}>
            {slide.headline}{' '}
            <Text style={styles.headlineHighlight}>{slide.highlight}</Text>
          </Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={onCtaPress}>
            <Text style={styles.ctaText}>{slide.cta}</Text>
            <ChevronRight size={16} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bannerImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.heroOverlay,
    padding: 18,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
    marginBottom: 6,
  },
  headlineHighlight: {
    color: colors.heroHighlight,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 17,
    marginBottom: 14,
    maxWidth: '72%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 2,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HeroBannerCarousel;
