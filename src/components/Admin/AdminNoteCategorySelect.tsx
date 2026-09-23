import { ChevronDown, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  MAX_RESOURCE_NOTE_CATEGORIES,
  MAX_RESOURCE_NOTE_CATEGORY_NAME_LENGTH,
} from '../../constants/resourcesDefaults';
import { colors, spacing } from '../../constants/theme';
import type { ResourceNoteCategory } from '../../store/content/types/resources.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type AdminNoteCategorySelectProps = {
  categories: ResourceNoteCategory[];
  selectedCategoryId: string;
  disabled?: boolean;
  onSelect: (categoryId: string) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
  onRemoveCategory: (categoryId: string) => Promise<void>;
};

function AdminNoteCategorySelect({
  categories,
  selectedCategoryId,
  disabled = false,
  onSelect,
  onAddCategory,
  onRemoveCategory,
}: AdminNoteCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const selected = categories.find(
    category => category.id === selectedCategoryId,
  );
  const label = selected?.name ?? 'Select category';
  const atLimit = categories.length >= MAX_RESOURCE_NOTE_CATEGORIES;

  const close = () => {
    if (saving) {
      return;
    }
    setOpen(false);
    setAdding(false);
    setDraft('');
    setError(null);
    setPendingRemoveId(null);
  };

  const run = async (action: () => Promise<void>, closeOnSuccess: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      setPendingRemoveId(null);
      if (closeOnSuccess) {
        setOpen(false);
        setAdding(false);
        setDraft('');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const name = draft.trim();
    if (!name) {
      setError('Enter a category name.');
      return;
    }

    const existing = categories.find(
      category => category.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      run(() => onSelect(existing.id), true).catch(() => undefined);
      return;
    }

    if (atLimit) {
      setError(`You can add up to ${MAX_RESOURCE_NOTE_CATEGORIES} categories.`);
      return;
    }

    run(() => onAddCategory(name), true).catch(() => undefined);
  };

  return (
    <View>
      <Text style={styles.fieldLabel}>Category</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Category, ${label}`}
        disabled={disabled || saving}
        onPress={() => {
          setError(null);
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          (disabled || saving) && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text
            style={[styles.triggerText, !selected && styles.triggerPlaceholder]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
        <ChevronDown size={18} color={colors.primary} strokeWidth={2.4} />
      </Pressable>

      {open ? (
        <Modal visible transparent animationType="fade" onRequestClose={close}>
          <KeyboardAvoidingView
            style={styles.keyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={styles.backdrop} onPress={close}>
              <Pressable
                style={styles.sheet}
                onPress={event => event.stopPropagation()}
              >
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Category</Text>
                  <Pressable onPress={close} hitSlop={8} disabled={saving}>
                    <Text style={styles.sheetDone}>Done</Text>
                  </Pressable>
                </View>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={styles.optionList}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: !selectedCategoryId }}
                    disabled={saving}
                    onPress={() => {
                      run(() => onSelect(''), true).catch(() => undefined);
                    }}
                    style={[
                      styles.optionRow,
                      !selectedCategoryId && styles.optionRowSelected,
                    ]}
                  >
                    <Text style={styles.optionTitle}>No category</Text>
                  </Pressable>

                  {categories.map(category => {
                    const isSelected = category.id === selectedCategoryId;
                    return (
                      <View
                        key={category.id}
                        style={[
                          styles.optionRow,
                          styles.optionRowWithAction,
                          isSelected && styles.optionRowSelected,
                        ]}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          disabled={saving}
                          onPress={() => {
                            run(() => onSelect(category.id), true).catch(
                              () => undefined,
                            );
                          }}
                          style={styles.optionMain}
                        >
                          <Text style={styles.optionTitle}>
                            {category.name}
                          </Text>
                        </Pressable>
                        {pendingRemoveId === category.id ? (
                          <Pressable
                            accessibilityRole="button"
                            disabled={saving}
                            onPress={() => {
                              run(
                                () => onRemoveCategory(category.id),
                                false,
                              ).catch(() => undefined);
                            }}
                            style={styles.removeConfirm}
                          >
                            <Text style={styles.removeConfirmText}>Remove</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${category.name}`}
                            disabled={saving}
                            hitSlop={8}
                            onPress={() => setPendingRemoveId(category.id)}
                            style={styles.removeButton}
                          >
                            <X
                              size={16}
                              color={colors.danger}
                              strokeWidth={2.4}
                            />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}

                  <Pressable
                    accessibilityRole="button"
                    disabled={saving || atLimit}
                    onPress={() => {
                      setError(null);
                      setAdding(true);
                    }}
                    style={styles.addRow}
                  >
                    <Plus size={16} color={colors.primary} strokeWidth={2.6} />
                    <Text style={styles.addRowText}>
                      {atLimit ? 'Category limit reached' : 'Add category'}
                    </Text>
                  </Pressable>
                </ScrollView>

                {adding ? (
                  <View style={styles.addForm}>
                    <TextInput
                      value={draft}
                      onChangeText={value => {
                        setError(null);
                        setDraft(value);
                      }}
                      placeholder="Category name"
                      placeholderTextColor={colors.textMuted}
                      maxLength={MAX_RESOURCE_NOTE_CATEGORY_NAME_LENGTH}
                      autoFocus
                      editable={!saving}
                      style={styles.addInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={handleAdd}
                      style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.triggerPressed,
                      ]}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                  </View>
                ) : null}

                {pendingRemoveId ? (
                  <Text style={styles.hint}>
                    Removing a category takes it off every note. Those notes
                    stay in All.
                  </Text>
                ) : null}
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  triggerPlaceholder: {
    color: colors.primary,
    fontWeight: '600',
  },
  keyboard: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlayScrim,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  optionList: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 320,
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionMain: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  removeButton: {
    padding: 4,
  },
  removeConfirm: {
    backgroundColor: colors.dangerLight,
    borderRadius: spacing.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dangerDark,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addRowText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.chipRadius,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

export default AdminNoteCategorySelect;
