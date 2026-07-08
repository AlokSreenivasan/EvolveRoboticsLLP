import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Briefcase, GraduationCap, type LucideIcon } from 'lucide-react-native';

import { cardShadow, colors } from '../../constants/theme';

type TrackCardProps = {
  label: string;
  Icon: LucideIcon;
  onPress?: () => void;
};

function TrackCard({ label, Icon, onPress }: TrackCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.iconChip}>
        <Icon size={22} color={colors.primary} strokeWidth={2.2} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type HeroBannerCarouselProps = {
  onStudentsPress?: () => void;
  onProfessionalPress?: () => void;
  /** Backwards compatibility: if provided, used for both cards. */
  onCtaPress?: () => void;
};

function HeroBannerCarousel({
  onStudentsPress,
  onProfessionalPress,
  onCtaPress,
}: HeroBannerCarouselProps) {
  const handleKidsPress = onStudentsPress ?? onCtaPress;
  const handleProfessionalsPress = onProfessionalPress ?? onCtaPress;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TrackCard
          label="For Kids"
          Icon={GraduationCap}
          onPress={handleKidsPress}
        />
        <TrackCard
          label="For Professionals"
          Icon={Briefcase}
          onPress={handleProfessionalsPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    minHeight: 120,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 20,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...cardShadow,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  label: {
    width: '100%',
    height: 20,
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HeroBannerCarousel;
