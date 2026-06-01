import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';

import AdminScreenLayout from '../../../components/Admin/AdminScreenLayout';
import AppButton from '../../../components/AppButton';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, cardShadow, spacing } from '../../../constants/theme';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import {
  createUpcomingEvent,
  deleteUpcomingEvent,
  ensureUpcomingEventsSectionDefaults,
  moveUpcomingEvent,
  updateUpcomingEvent,
  updateUpcomingEventsSection,
} from '../../../services/firebase/upcomingEventsService';
import type {
  UpcomingEvent,
  UpdateUpcomingEventsSectionInput,
} from '../../../store/content/types/upcomingEvents.types';
import { getErrorMessage } from '../../../utils/firebase/errors';

type EventFormState = {
  month: string;
  day: string;
  title: string;
  dateRange: string;
  timeRange: string;
  daysLeftLabel: string;
  isPublished: boolean;
};

const EMPTY_EVENT_FORM: EventFormState = {
  month: '',
  day: '',
  title: '',
  dateRange: '',
  timeRange: '',
  daysLeftLabel: '',
  isPublished: true,
};

function isPermissionDenied(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (typeof code === 'string' && code.includes('permission-denied')) {
    return true;
  }
  const message = (error as { message?: string } | null)?.message;
  return typeof message === 'string' && message.toLowerCase().includes('permission');
}

function toAdminWriteErrorMessage(error: unknown): string {
  const base = getErrorMessage(error);
  if (!isPermissionDenied(error)) {
    return base;
  }
  return `${base}\n\nFix checklist:\n1) Firestore users/{uid}.role must be exactly \"admin\"\n2) Deploy rules: cd Evolve && firebase deploy --only firestore:rules`;
}

function ManageUpcomingEvents() {
  const { section, events, loading } = useUpcomingEvents({
    includeUnpublished: true,
  });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [savingEvent, setSavingEvent] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    ensureUpcomingEventsSectionDefaults().catch(() => undefined);
  }, []);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
    setActionLabel(section.actionLabel);
  }, [section]);

  const openCreateEditor = () => {
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT_FORM);
    setEditorVisible(true);
  };

  const openEditEditor = (event: UpcomingEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      month: event.month,
      day: event.day,
      title: event.title,
      dateRange: event.dateRange,
      timeRange: event.timeRange,
      daysLeftLabel: event.daysLeftLabel,
      isPublished: event.isPublished,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT_FORM);
  };

  const handleSaveSection = async () => {
    const payload: UpdateUpcomingEventsSectionInput = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
      actionLabel: actionLabel.trim(),
    };

    if (!payload.sectionTitle) {
      Alert.alert('Section title required', 'Enter a title for this home section.');
      return;
    }

    setSavingSection(true);
    try {
      await updateUpcomingEventsSection(payload);
      Alert.alert('Saved', 'Section headings updated. Changes appear on Home instantly.');
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      Alert.alert('Title required', 'Each event needs a title.');
      return;
    }
    if (!eventForm.month.trim() || !eventForm.day.trim()) {
      Alert.alert('Date required', 'Enter month (e.g. MAY) and day (e.g. 25) for the date block.');
      return;
    }

    setSavingEvent(true);
    try {
      if (editingEventId) {
        await updateUpcomingEvent(editingEventId, {
          month: eventForm.month,
          day: eventForm.day,
          title: eventForm.title,
          dateRange: eventForm.dateRange,
          timeRange: eventForm.timeRange,
          daysLeftLabel: eventForm.daysLeftLabel,
          isPublished: eventForm.isPublished,
        });
      } else {
        await createUpcomingEvent({
          month: eventForm.month,
          day: eventForm.day,
          title: eventForm.title,
          dateRange: eventForm.dateRange,
          timeRange: eventForm.timeRange,
          daysLeftLabel: eventForm.daysLeftLabel,
          isPublished: eventForm.isPublished,
        });
      }
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingEvent(false);
    }
  };

  const confirmDeleteEvent = (event: UpcomingEvent) => {
    Alert.alert('Delete event', `Remove "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUpcomingEvent(event.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const handleMove = useCallback(
    async (eventId: string, direction: 'up' | 'down') => {
      setReorderingId(eventId);
      try {
        await moveUpcomingEvent(eventId, direction, events);
      } catch (error) {
        Alert.alert('Reorder failed', getErrorMessage(error));
      } finally {
        setReorderingId(null);
      }
    },
    [events],
  );

  const listHeader = useCallback(
    () => (
      <>
        <Text style={styles.blockTitle}>Section headings</Text>
        <View style={styles.card}>
          <FormField
            label="Section title"
            value={sectionTitle}
            onChangeText={setSectionTitle}
            placeholder="Upcoming Events"
          />
          <FormField
            label="Section subtitle"
            value={sectionSubtitle}
            onChangeText={setSectionSubtitle}
            placeholder="Optional line under the title"
          />
          <FormField
            label="Action label"
            value={actionLabel}
            onChangeText={setActionLabel}
            placeholder="View Calendar"
          />
          <AppButton
            title={savingSection ? 'Saving…' : 'Save section'}
            onPress={handleSaveSection}
            disabled={savingSection}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>
        <View style={styles.eventsHeader}>
          <Text style={styles.blockTitle}>Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateEditor}
            accessibilityRole="button"
            accessibilityLabel="Add event">
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [
      actionLabel,
      handleSaveSection,
      openCreateEditor,
      savingSection,
      sectionSubtitle,
      sectionTitle,
    ],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    }
    if (events.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No events yet. Add one to show on the home screen.
        </Text>
      );
    }
    return null;
  }, [events.length, loading]);

  const renderEvent = useCallback(
    ({ item: event, index }: { item: UpcomingEvent; index: number }) => (
      <View style={styles.eventCard}>
        <View style={styles.eventTopRow}>
          <View style={styles.eventMeta}>
            <View style={styles.datePreview}>
              <Text style={styles.dateMonth}>{event.month}</Text>
              <Text style={styles.dateDay}>{event.day}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.dateRange ? (
              <Text style={styles.eventSubtitle}>{event.dateRange}</Text>
            ) : null}
            {event.timeRange ? (
              <Text style={styles.eventSubtitle}>{event.timeRange}</Text>
            ) : null}
            {event.daysLeftLabel ? (
              <Text style={styles.badgePreview}>{event.daysLeftLabel}</Text>
            ) : null}
            {!event.isPublished ? (
              <Text style={styles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <View style={styles.eventActions}>
            <IconButton
              icon={ArrowUp}
              disabled={index === 0 || reorderingId === event.id}
              onPress={() => handleMove(event.id, 'up')}
            />
            <IconButton
              icon={ArrowDown}
              disabled={
                index === events.length - 1 || reorderingId === event.id
              }
              onPress={() => handleMove(event.id, 'down')}
            />
            <IconButton icon={Pencil} onPress={() => openEditEditor(event)} />
            <IconButton
              icon={Trash2}
              onPress={() => confirmDeleteEvent(event)}
              danger
            />
          </View>
        </View>
      </View>
    ),
    [
      confirmDeleteEvent,
      events.length,
      handleMove,
      openEditEditor,
      reorderingId,
    ],
  );

  const keyExtractor = useCallback((item: UpcomingEvent) => item.id, []);

  return (
    <AdminScreenLayout
      title="Upcoming Events"
      subtitle="Edit home section titles and event cards"
      scrollable={false}>
      <FlatList
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderEvent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        extraData={reorderingId}
        {...VERTICAL_LIST_PERF}
      />

      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditor}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingEventId ? 'Edit event' : 'New event'}
          </Text>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <FormField
                  label="Month (date block)"
                  value={eventForm.month}
                  onChangeText={month =>
                    setEventForm(prev => ({ ...prev, month }))
                  }
                  placeholder="MAY"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfField}>
                <FormField
                  label="Day (date block)"
                  value={eventForm.day}
                  onChangeText={day => setEventForm(prev => ({ ...prev, day }))}
                  placeholder="25"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <FormField
              label="Title"
              value={eventForm.title}
              onChangeText={title => setEventForm(prev => ({ ...prev, title }))}
              placeholder="Robotics Workshop"
            />
            <FormField
              label="Date range"
              value={eventForm.dateRange}
              onChangeText={dateRange =>
                setEventForm(prev => ({ ...prev, dateRange }))
              }
              placeholder="25 May 2025"
            />
            <FormField
              label="Time range"
              value={eventForm.timeRange}
              onChangeText={timeRange =>
                setEventForm(prev => ({ ...prev, timeRange }))
              }
              placeholder="10:00 AM – 1:00 PM"
            />
            <FormField
              label="Days-left badge"
              value={eventForm.daysLeftLabel}
              onChangeText={daysLeftLabel =>
                setEventForm(prev => ({ ...prev, daysLeftLabel }))
              }
              placeholder="2 Days Left"
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Published on home</Text>
              <Switch
                value={eventForm.isPublished}
                onValueChange={isPublished =>
                  setEventForm(prev => ({ ...prev, isPublished }))
                }
                trackColor={{ true: colors.primarySoft, false: colors.border }}
                thumbColor={
                  eventForm.isPublished ? colors.primary : colors.textMuted
                }
              />
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              onPress={closeEditor}
              buttonStyle={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
            <AppButton
              title={savingEvent ? 'Saving…' : 'Save event'}
              onPress={handleSaveEvent}
              disabled={savingEvent}
              buttonStyle={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          </View>
        </View>
      </Modal>
    </AdminScreenLayout>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'number-pad';
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize,
  keyboardType,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

type IconButtonProps = {
  icon: typeof Pencil;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
};

function IconButton({
  icon: Icon,
  onPress,
  disabled,
  danger,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.iconButton, disabled && styles.iconButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}>
      <Icon
        size={18}
        color={danger ? colors.danger : colors.primary}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.screenHorizontal,
    paddingBottom: 40,
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  eventTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  eventMeta: {
    flex: 1,
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eventSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgePreview: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  draftBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentOrange,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconButton: {
    padding: 6,
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingHorizontal: spacing.screenHorizontal,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalScroll: {
    paddingBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});

export default ManageUpcomingEvents;
