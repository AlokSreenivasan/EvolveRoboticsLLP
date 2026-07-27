import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bot, Sparkles } from 'lucide-react-native';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import {
  colors,
  spacing,
  typography,
} from '../../../constants/theme';

function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="About"
        subtitle="Learn more about Evolve Robotics"
        compact
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../../assets/LOGO__.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <SurfaceCard elevation="default" style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconTile}>
              <Bot size={22} color={colors.primary} strokeWidth={2.25} />
            </View>
            <Text style={styles.cardTitle}>Evolve Robotics</Text>
          </View>
          <Text style={styles.body}>
            Evolve is a robotics learning platform designed to help students and
            professionals explore automation, coding, and hands-on project building
            — all in one place.
          </Text>
        </SurfaceCard>

        <SurfaceCard elevation="light" style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconTile}>
              <Sparkles size={20} color={colors.primary} strokeWidth={2.25} />
            </View>
            <Text style={styles.cardTitle}>What you can do</Text>
          </View>
          <Text style={styles.body}>
            Browse courses and lessons, track your progress, complete daily missions,
            join quiz competitions, and build real-world robotics projects with guided
            support from our chat assistant.
          </Text>
        </SurfaceCard>

        <Text style={styles.version}>Version 0.0.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 36,
    gap: 16,
  },
  logoWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  card: {
    padding: 20,
    gap: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.cardTitle,
    flex: 1,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  version: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AboutScreen;
