import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  QUICK_ACCESS_ITEMS,
  type QuickAccessItem,
} from '../../constants/homeScreenData';
import { colors } from '../../constants/theme';
import type { LoginScreenNavigationProp } from '../../types/navigation';

function QuickAccessIcon({
  item,
}: {
  item: QuickAccessItem;
}) {
  const size = 24;
  const stroke = 2;
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

  return (
    <View style={styles.grid}>
      {QUICK_ACCESS_ITEMS.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          activeOpacity={0.85}
          onPress={() => handlePress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={item.label}>
          <View style={[styles.iconBox, { backgroundColor: item.backgroundColor }]}>
            <QuickAccessIcon item={item} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  item: {
    width: '30%',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default QuickAccessGrid;
