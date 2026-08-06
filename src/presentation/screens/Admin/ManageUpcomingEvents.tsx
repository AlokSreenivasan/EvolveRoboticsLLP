import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import AppButton from '../../../components/AppButton';
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
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { getNotificationCategoryLabel } from '../../../constants/notificationCategories';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import { useSchools } from '../../hooks/useSchools';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
  validateContentVisibilityTrack,
} from '../../../utils/admin/contentVisibility';
import { useAdminSectionDefaults } from '../../hooks/admin/useAdminSectionDefaults';
import { sendLiveNotificationToUsers } from '../../../services/firebase/liveNotificationService';
import { createNotification } from '../../../services/firebase/notificationsService';
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
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { getErrorMessage } from '../../../utils/firebase/errors';
import {
  EVENT_YEAR_MAX,
  computeDaysLeftLabel,
  formatEventDateParts,
  getDisplayDaysLeftLabel,
  parseStoredEventYear,
  resolveUpcomingEventDate,
} from '../../../utils/upcomingEventDate';

const EVENT_NOTIFICATION_CATEGORY = 'events_workshops' as const;

function buildEventNotificationBody(event: UpcomingEvent): string {
  const lines = [
    event.dateRange.trim(),
    event.timeRange.trim(),
    event.location.trim(),
  ].filter(Boolean);

  if (lines.length === 0) {
    return `Don't miss ${event.title.trim()}.`;
  }

  return lines.join('\n');
}

type EventFormState = {
  month: string;
  day: string;
  year: number | null;
  title: string;
  dateRange: string;
  timeRange: string;
  location: string;
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
  location: '',
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
  const [sendingLiveId, setSendingLiveId] = useState<string | null>(null);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { resetAudience } = audienceForm;
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

  const openEditEditor = useCallback(
    (event: UpcomingEvent) => {
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
        location: event.location,
        daysLeftLabel: event.daysLeftLabel,
        track: event.track,
        isPublished: event.isPublished,
      });
      resetAudience({
        audience: event.audience,
        schoolIds: event.schoolIds,
        schoolGradeIds: event.schoolGradeIds,
      });
      setEditorVisible(true);
    },
    [resetAudience],
  );

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
      appAlert(
        appAlertCopy.admin.sectionTitleRequiredTitle,
        appAlertCopy.admin.sectionTitleRequired,
      );
      return;
    }

    setSavingSection(true);
    try {
      await updateUpcomingEventsSection(payload);
      appAlert(appAlertCopy.admin.savedTitle, appAlertCopy.admin.sectionSaved);
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      appAlert(appAlertCopy.admin.titleNeeded, appAlertCopy.admin.titleRequired('event'));
      return;
    }
    if (!eventForm.month.trim() || !eventForm.day.trim()) {
      appAlert(appAlertCopy.admin.dateRequiredTitle, appAlertCopy.admin.dateRequired);
      return;
    }

    const year = parseStoredEventYear(eventForm.year);
    if (year == null) {
      appAlert(
        appAlertCopy.admin.dateRequiredTitle,
        appAlertCopy.admin.dateYearRequired(EVENT_YEAR_MAX),
      );
      return;
    }

    if (!resolveUpcomingEventDate(eventForm.month, eventForm.day, { year })) {
      appAlert(
        appAlertCopy.admin.invalidDateTitle,
        appAlertCopy.admin.invalidDate(EVENT_YEAR_MAX),
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
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
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
        location: eventForm.location,
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
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingEvent(false);
    }
  };

  const confirmDeleteEvent = (event: UpcomingEvent) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('event'),
      appAlertCopy.admin.deleteConfirm('event', event.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUpcomingEvent(event.id);
            } catch (error) {
              appAlert(
                appAlertCopy.admin.deleteFailedTitle,
                toAdminWriteErrorMessage(error),
              );
            }
          },
        },
      ],
    );
  };

  const performSendEventNotification = useCallback(
    async (event: UpcomingEvent) => {
      const trackError = validateContentVisibilityTrack(event.track);
      if (trackError || !event.track) {
        appAlert(
          appAlertCopy.admin.visibilityRequiredTitle,
          trackError ?? 'Select whether this is visible to kids or professionals.',
        );
        return;
      }

      const title = event.title.trim();
      const body = buildEventNotificationBody(event);
      if (!title) {
        appAlert(
          appAlertCopy.admin.cannotSendTitle,
          appAlertCopy.admin.cannotSendNotification,
        );
        return;
      }

      setSendingLiveId(event.id);
      try {
        const visibilityPayload = buildContentVisibilityPayload(event.track, {
          audience: event.audience,
          schoolIds: event.schoolIds,
          schoolGradeIds: event.schoolGradeIds,
        });
        const notification = await createNotification({
          title,
          body,
          category: EVENT_NOTIFICATION_CATEGORY,
          isPublished: true,
          ...visibilityPayload,
        });
        const result = await sendLiveNotificationToUsers({
          notificationId: notification.id,
          title: notification.title,
          body: notification.body,
        });

        appAlert(
          appAlertCopy.admin.liveSentTitle,
          appAlertCopy.admin.liveNotificationSent(
            result.successCount,
            result.recipientCount,
            result.failureCount,
          ),
        );
      } catch (error) {
        appAlert(appAlertCopy.admin.sendFailedTitle, getErrorMessage(error));
      } finally {
        setSendingLiveId(null);
      }
    },
    [],
  );

  const handleSendEventNotification = useCallback(
    (event: UpcomingEvent) => {
      if (!event.title.trim()) {
        appAlert(
          appAlertCopy.admin.cannotSendTitle,
          appAlertCopy.admin.cannotSendNotification,
        );
        return;
      }

      const trackError = validateContentVisibilityTrack(event.track);
      if (trackError || !event.track) {
        appAlert(
          appAlertCopy.admin.visibilityRequiredTitle,
          trackError ?? 'Select whether this is visible to kids or professionals.',
        );
        return;
      }

      const audienceLabel = formatContentVisibilitySummary(
        event.track,
        event,
        schools,
      );
      const categoryLabel = getNotificationCategoryLabel(
        EVENT_NOTIFICATION_CATEGORY,
      );
      appAlert(
        appAlertCopy.admin.sendLiveTitle,
        appAlertCopy.admin.sendLiveConfirm(
          event.title.trim(),
          categoryLabel,
          audienceLabel,
        ),
        [
          { text: appAlertButtons.cancel, style: 'cancel' },
          {
            text: appAlertButtons.send,
            onPress: () => performSendEventNotification(event),
          },
        ],
      );
    },
    [performSendEventNotification, schools],
  );

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
    ({ item: event, index }: { item: UpcomingEvent; index: number }) => {
      const isSending = sendingLiveId === event.id;
      return (
        <SurfaceCard elevation="elevated" style={adminStyles.listRowCard}>
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
              {event.location ? (
                <Text style={adminStyles.listRowSubtitle}>{event.location}</Text>
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
          <View style={adminStyles.listRowFooter}>
            <AppButton
              title={isSending ? 'Sending…' : 'Send notification'}
              onPress={() => handleSendEventNotification(event)}
              disabled={isSending || sendingLiveId != null}
              variant="ghost"
              buttonStyle={adminStyles.sendLiveButton}
              textStyle={adminStyles.sendLiveButtonText}
            />
          </View>
        </SurfaceCard>
      );
    },
    [
      events.length,
      handleMove,
      handleSendEventNotification,
      openEditEditor,
      reorderingId,
      schools,
      sendingLiveId,
    ],
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
        <AdminFormField
          label="Location"
          value={eventForm.location}
          onChangeText={location =>
            setEventForm(prev => ({ ...prev, location }))
          }
          placeholder="Evolve Campus, Hall A"
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
