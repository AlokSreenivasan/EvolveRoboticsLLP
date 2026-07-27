import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ClipboardList,
  PenLine,
  FolderOpen,
  GraduationCap,
  Grid3x3,
  Play,
} from 'lucide-react-native';

import {
  QUICK_ACCESS_HIDDEN_IDS,
  QUICK_ACCESS_ITEMS,
  type QuickAccessItem,
} from '../../constants/homeScreenData';
import { cardShadowLight, colors, glassBorder } from '../../constants/theme';
import type { LoginScreenNavigationProp } from '../../types/navigation';

function QuickAccessIcon({
  item,
}: {
  item: QuickAccessItem;
}) {
  const size = 22;
  const stroke = 2.15;
  const color = item.iconColor;

  switch (item.iconName) {
    case 'graduation':
      return <GraduationCap size={size} color={color} strokeWidth={stroke} />;
    case 'play':
      return <Play size={size} color={color} strokeWidth={stroke} />;
    case 'clipboard':
      return <ClipboardList size={size} color={color} strokeWidth={stroke} />;
    case 'file':
      return <PenLine size={size} color={color} strokeWidth={stroke} />;
    case 'folder':
      return <FolderOpen size={size} color={color} strokeWidth={stroke} />;
    case 'grid':
      return <Grid3x3 size={size} color={color} strokeWidth={stroke} />;
    default:
      return null;
  }
}

function QuickAccessGrid() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handlePress = (itemId: string) => {
    if (itemId === 'resources') {
      navigation.navigate('Resources');
    } else if (itemId === 'assignments') {
      navigation.navigate('Assignments');
    } else if (itemId === 'exams') {
      navigation.navigate('Exams');
    }
  };

  const visibleItems = QUICK_ACCESS_ITEMS.filter(
    item => !QUICK_ACCESS_HIDDEN_IDS.has(item.id),
  );
  const itemWidth: DimensionValue = `${100 / visibleItems.length}%`;

  return (
    <View style={styles.grid}>
      {visibleItems.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, { width: itemWidth }]}
          activeOpacity={0.85}
          onPress={() => handlePress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={item.label}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: item.backgroundColor },
            ]}>
            <QuickAccessIcon item={item} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 8,
    ...glassBorder,
    ...cardShadowLight,
  },
  item: {
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default QuickAccessGrid;
