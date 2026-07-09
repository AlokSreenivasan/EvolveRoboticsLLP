import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminEventDateScrollPicker from '../../../components/Admin/AdminEventDateScrollPicker';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRowActions from '../../../components/Admin/AdminListRowActions';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import EventDateBlock from '../../../components/Home/EventDateBlock';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import { useSchools } from '../../hooks/useSchools';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';
import { useAdminSectionDefaults } from '../../hooks/admin/useAdminSectionDefaults';
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
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import {
  EVENT_YEAR_MAX,
  computeDaysLeftLabel,
  formatEventDateParts,
  getDisplayDaysLeftLabel,
  parseStoredEventYear,
  resolveUpcomingEventDate,
} from '../../../utils/upcomingEventDate';

type EventFormState = {
  month: string;
  day: string;
  year: number | null;
  title: string;
  dateRange: string;
  timeRange: string;
  daysLeftLabel: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_EVENT_FORM: EventFormState = {
  month: '',
  day: '',
  year: null,
  title: '',
  dateRange: '',
  timeRange: '',
  daysLeftLabel: '',
  track: null,
  isPublished: true,
};

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

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { reorderingId, handleMove } = useAdminReorder(events, moveUpcomingEvent);

  useAdminSectionDefaults(ensureUpcomingEventsSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
    setActionLabel(section.actionLabel);
  }, [section]);

  const openCreateEditor = () => {
    const today = new Date();
    const { month, day, year } = formatEventDateParts(today);
    setEditingEventId(null);
    setEventForm({
      ...EMPTY_EVENT_FORM,
      month,
      day,
      year,
      daysLeftLabel: computeDaysLeftLabel(month, day, { year }),
    });
    audienceForm.resetAudience();
    setEditorVisible(true);
  };

  const openEditEditor = (event: UpcomingEvent) => {
    const resolvedYear =
      event.year ??
      resolveUpcomingEventDate(event.month, event.day)?.getFullYear() ??
      new Date().getFullYear();
    setEditingEventId(event.id);
    setEventForm({
      month: event.month,
      day: event.day,
      year: resolvedYear,
      title: event.title,
      dateRange: event.dateRange,
      timeRange: event.timeRange,
      daysLeftLabel: event.daysLeftLabel,
      track: event.track,
      isPublished: event.isPublished,
    });
    audienceForm.resetAudience({
      audience: event.audience,
      schoolIds: event.schoolIds,
      schoolGradeIds: event.schoolGradeIds,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT_FORM);
    audienceForm.resetAudience();
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
      Alert.alert(
        'Date required',
        'Choose an event date for the home card.',
      );
      return;
    }

    const year = parseStoredEventYear(eventForm.year);
    if (year == null) {
      Alert.alert(
        'Date required',
        `Choose a valid year (today through ${EVENT_YEAR_MAX}).`,
      );
      return;
    }

    if (!resolveUpcomingEventDate(eventForm.month, eventForm.day, { year })) {
      Alert.alert(
        'Invalid date',
        `That date is not valid or falls after ${EVENT_YEAR_MAX}.`,
      );
      return;
    }

    const daysLeftLabel = computeDaysLeftLabel(
      eventForm.month.trim(),
      eventForm.day.trim(),
      { year },
    );

    const visibilityError = validateContentVisibility(
      eventForm.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      Alert.alert('Visibility required', visibilityError);
      return;
    }

    setSavingEvent(true);
    try {
      const visibilityPayload = buildContentVisibilityPayload(
        eventForm.track!,
        audienceForm.toPayload(),
      );
      const payload = {
        month: eventForm.month,
        day: eventForm.day,
        year,
        title: eventForm.title,
        dateRange: eventForm.dateRange,
        timeRange: eventForm.timeRange,
        daysLeftLabel,
        isPublished: eventForm.isPublished,
        ...visibilityPayload,
      };
      if (editingEventId) {
        await updateUpcomingEvent(editingEventId, payload);
      } else {
        await createUpcomingEvent(payload);
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

  const listHeader = (
    <>
      <Text style={adminStyles.blockTitle}>Section headings</Text>
      <AdminSectionCard
        saving={savingSection}
        saveLabel="Save section"
        onSave={handleSaveSection}>
        <AdminFormField
          label="Section title"
          value={sectionTitle}
          onChangeText={setSectionTitle}
          placeholder="Upcoming Events"
        />
        <AdminFormField
          label="Section subtitle"
          value={sectionSubtitle}
          onChangeText={setSectionSubtitle}
          placeholder="Optional line under the title"
        />
        <AdminFormField
          label="Action label"
          value={actionLabel}
          onChangeText={setActionLabel}
          placeholder="View Calendar"
        />
      </AdminSectionCard>
      <AdminListSectionHeader title="Events" onAdd={openCreateEditor} />
    </>
  );

  const renderEvent = useCallback(
    ({ item: event, index }: { item: UpcomingEvent; index: number }) => (
      <View style={adminStyles.listRowCard}>
        <View style={adminStyles.listRowTop}>
          <View style={adminStyles.listRowMeta}>
            <EventDateBlock
              month={event.month}
              day={event.day}
              size="compact"
              style={adminStyles.listRowDateBlock}
            />
            <Text style={adminStyles.listRowTitle}>{event.title}</Text>
            {event.dateRange ? (
              <Text style={adminStyles.listRowSubtitle}>{event.dateRange}</Text>
            ) : null}
            {event.timeRange ? (
              <Text style={adminStyles.listRowSubtitle}>{event.timeRange}</Text>
            ) : null}
            <Text style={adminStyles.listRowSubtitle}>
              {formatContentVisibilitySummary(event.track, event, schools)}
            </Text>
            {getDisplayDaysLeftLabel(
              event.month,
              event.day,
              event.daysLeftLabel,
              event.year ?? undefined,
            ) ? (
              <Text style={adminStyles.badgePreview}>
                {getDisplayDaysLeftLabel(
                  event.month,
                  event.day,
                  event.daysLeftLabel,
                  event.year ?? undefined,
                )}
              </Text>
            ) : null}
            {!event.isPublished ? (
              <Text style={adminStyles.draftBadge}>Draft</Text>
            ) : null}
          </View>
          <AdminListRowActions
            index={index}
            itemCount={events.length}
            reordering={reorderingId === event.id}
            onMoveUp={() => handleMove(event.id, 'up')}
            onMoveDown={() => handleMove(event.id, 'down')}
            onEdit={() => openEditEditor(event)}
            onDelete={() => confirmDeleteEvent(event)}
          />
        </View>
      </View>
    ),
    [events.length, handleMove, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: UpcomingEvent) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Upcoming Events"
        subtitle="Edit home section titles and event cards"
        data={events}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderEvent}
        listHeader={listHeader}
        emptyMessage="No events yet. Add one to show on the home screen."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingEventId ? 'Edit event' : 'New event'}
        saveLabel="Save event"
        saving={savingEvent}
        onClose={closeEditor}
        onSave={handleSaveEvent}>
        <AdminEventDateScrollPicker
          month={eventForm.month}
          day={eventForm.day}
          year={eventForm.year}
          onChange={(month, day, year) =>
            setEventForm(prev => ({
              ...prev,
              month,
              day,
              year,
              daysLeftLabel: computeDaysLeftLabel(month, day, { year }),
            }))
          }
        />
        <AdminFormField
          label="Title"
          value={eventForm.title}
          onChangeText={title => setEventForm(prev => ({ ...prev, title }))}
          placeholder="Robotics Workshop"
        />
        <AdminFormField
          label="Date range"
          value={eventForm.dateRange}
          onChangeText={dateRange =>
            setEventForm(prev => ({ ...prev, dateRange }))
          }
          placeholder="25 May 2025"
        />
        <AdminFormField
          label="Time range"
          value={eventForm.timeRange}
          onChangeText={timeRange =>
            setEventForm(prev => ({ ...prev, timeRange }))
          }
          placeholder="10:00 AM – 1:00 PM"
        />
        <AdminPublishedSwitch
          label="Published on home"
          value={eventForm.isPublished}
          onValueChange={isPublished =>
            setEventForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminContentVisibilityFields
          track={eventForm.track}
          onTrackChange={track => setEventForm(prev => ({ ...prev, track }))}
          onProfessionalsTrackSelected={() => audienceForm.resetAudience()}
          audience={audienceForm.audience}
          selectedSchoolIds={audienceForm.schoolIds}
          schoolGradeIds={audienceForm.schoolGradeIds}
          schools={schools}
          schoolsLoading={schoolsLoading}
          schoolsError={schoolsError}
          onAudienceChange={audienceForm.setAudienceMode}
          onToggleSchool={audienceForm.toggleSchoolId}
          onSchoolGradeModeChange={audienceForm.setSchoolGradeMode}
          onToggleSchoolGrade={audienceForm.toggleSchoolGrade}
          getSchoolGradeMode={audienceForm.getSchoolGradeMode}
          trackHint="Required. Choose whether this event is shown to kids or professionals on Home."
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageUpcomingEvents;
