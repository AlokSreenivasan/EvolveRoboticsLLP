import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '../../constants/theme';
import type { ResourceNoteCategory } from '../../store/content/types/resources.types';

export const ALL_RESOURCE_NOTES = 'all';

type ResourceCategoryBarProps = {
  categories: ResourceNoteCategory[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
};

function ResourceCategoryBar({
  categories,
  selectedId,
  onSelect,
}: ResourceCategoryBarProps) {
  const options = [{ id: ALL_RESOURCE_NOTES, name: 'All' }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map(option => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.name}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.chip,
              selected ? styles.chipSelected : styles.chipIdle,
              pressed && styles.chipPressed,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  chip: {
    borderRadius: spacing.chipRadius,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 180,
  },
  chipIdle: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMuted,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  chipTextSelected: {
    color: colors.surface,
  },
});

export default ResourceCategoryBar;
