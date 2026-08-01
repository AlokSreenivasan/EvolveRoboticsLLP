import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';

import AppButton from '../../../components/AppButton';
import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import { adminStyles } from '../../../components/Admin/adminStyles';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import AdminNotificationCategoryPicker from '../../../components/Admin/AdminNotificationCategoryPicker';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import {
  DEFAULT_NOTIFICATION_CATEGORY,
  getNotificationCategoryLabel,
} from '../../../constants/notificationCategories';
import type { NotificationCategory } from '../../../constants/notificationCategories';
import { sendLiveNotificationToUsers } from '../../../services/firebase/liveNotificationService';
import { useNotifications } from '../../hooks/useNotifications';
import { useSchools } from '../../hooks/useSchools';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';
import {
  createNotification,
  deleteNotification,
  moveNotification,
  updateNotification,
} from '../../../services/firebase/notificationsService';
import type { AppNotification } from '../../../store/content/types/notifications.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import { getErrorMessage } from '../../../utils/firebase/errors';

type NotificationFormState = {
  title: string;
  body: string;
  category: NotificationCategory;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_FORM: NotificationFormState = {
  title: '',
  body: '',
  category: DEFAULT_NOTIFICATION_CATEGORY,
  track: null,
  isPublished: true,
};

function AdminNotifications() {
  const { notifications, loading } = useNotifications({
    includeUnpublished: true,
  });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { resetAudience } = audienceForm;

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NotificationFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sendingLiveId, setSendingLiveId] = useState<string | null>(null);

  const { reorderingId, handleMove } = useAdminReorder(
    notifications,
    moveNotification,
  );

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (notification: AppNotification) => {
      setEditingId(notification.id);
      setForm({
        title: notification.title,
        body: notification.body,
        category: notification.category,
        track: notification.track,
        isPublished: notification.isPublished,
      });
      resetAudience({
        audience: notification.audience,
        schoolIds: notification.schoolIds,
        schoolGradeIds: notification.schoolGradeIds,
      });
      setEditorVisible(true);
    },
    [resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      appAlert(
        appAlertCopy.admin.titleNeeded,
        appAlertCopy.admin.titleRequired('notification'),
      );
      return;
    }
    if (!form.body.trim()) {
      appAlert(
        appAlertCopy.admin.messageRequiredTitle,
        appAlertCopy.admin.messageRequired,
      );
      return;
    }

    const visibilityError = validateContentVisibility(
      form.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
      return;
    }

    setSaving(true);
    try {
      const visibilityPayload = buildContentVisibilityPayload(
        form.track!,
        audienceForm.toPayload(),
      );
      const payload = {
        title: form.title,
        body: form.body,
        category: form.category,
        isPublished: form.isPublished,
        ...visibilityPayload,
      };
      if (editingId) {
        await updateNotification(editingId, payload);
      } else {
        await createNotification(payload);
      }
      closeEditor();
      appAlert(
        appAlertCopy.admin.savedTitle,
        form.isPublished
          ? appAlertCopy.admin.notificationLiveSaved
          : appAlertCopy.admin.notificationDraftSaved,
      );
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const performSendLive = useCallback(async (notification: AppNotification) => {
    setSendingLiveId(notification.id);
    try {
      const result = await sendLiveNotificationToUsers({
        notificationId: notification.id,
        title: notification.title,
        body: notification.body,
      });

      const delivered = result.successCount;
      const failed = result.failureCount;

      appAlert(
        appAlertCopy.admin.liveSentTitle,
        appAlertCopy.admin.liveNotificationSent(
          delivered,
          result.recipientCount,
          failed,
        ),
      );
    } catch (error) {
      appAlert(appAlertCopy.admin.sendFailedTitle, getErrorMessage(error));
    } finally {
      setSendingLiveId(null);
    }
  }, []);

  const handleSendLiveNotification = useCallback(
    (notification: AppNotification) => {
      if (!notification.title.trim() || !notification.body.trim()) {
        appAlert(
          appAlertCopy.admin.cannotSendTitle,
          appAlertCopy.admin.cannotSendNotification,
        );
        return;
      }

      const audienceLabel = formatContentVisibilitySummary(
        notification.track,
        notification,
        schools,
      );
      const categoryLabel = getNotificationCategoryLabel(notification.category);
      appAlert(
        appAlertCopy.admin.sendLiveTitle,
        appAlertCopy.admin.sendLiveConfirm(
          notification.title,
          categoryLabel,
          audienceLabel,
        ),
        [
          { text: appAlertButtons.cancel, style: 'cancel' },
          {
            text: appAlertButtons.send,
            onPress: () => performSendLive(notification),
          },
        ],
      );
    },
    [performSendLive, schools],
  );

  const confirmDelete = (notification: AppNotification) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('notification'),
      appAlertCopy.admin.deleteConfirm('notification', notification.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notification.id);
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

  const listHeader = (
    <AdminListSectionHeader title="All notifications" onAdd={openCreateEditor} />
  );

  const renderItem = useCallback(
    ({
      item: notification,
      index,
    }: {
      item: AppNotification;
      index: number;
    }) => {
      const isSending = sendingLiveId === notification.id;
      const audienceLine = formatContentVisibilitySummary(
        notification.track,
        notification,
        schools,
      );
      const categoryLine = getNotificationCategoryLabel(notification.category);
      return (
        <AdminListRow
          title={notification.title}
          statusLine={
            notification.isPublished
              ? `Visible on home · ${categoryLine} · ${audienceLine}`
              : `${categoryLine} · ${audienceLine}`
          }
          isPublished={notification.isPublished}
          index={index}
          itemCount={notifications.length}
          reordering={reorderingId === notification.id}
          onMoveUp={() => handleMove(notification.id, 'up')}
          onMoveDown={() => handleMove(notification.id, 'down')}
          onEdit={() => openEditEditor(notification)}
          onDelete={() => confirmDelete(notification)}
          footer={
            <AppButton
              title={isSending ? 'Sending…' : 'Send live notification'}
              onPress={() => handleSendLiveNotification(notification)}
              disabled={isSending || sendingLiveId != null}
              variant="ghost"
              buttonStyle={adminStyles.sendLiveButton}
              textStyle={adminStyles.sendLiveButtonText}
            />
          }
        />
      );
    },
    [
      handleMove,
      handleSendLiveNotification,
      notifications.length,
      openEditEditor,
      reorderingId,
      schools,
      sendingLiveId,
    ],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  const editingNotification = editingId
    ? notifications.find(n => n.id === editingId)
    : null;
  const editorSendingLive =
    editingNotification != null && sendingLiveId === editingNotification.id;

  return (
    <>
      <AdminListLayout
        title="Notifications"
        subtitle="Create notifications and send push alerts"
        data={notifications}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        listHeader={listHeader}
        emptyMessage="No notifications yet. Tap Add to create one."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingId ? 'Edit notification' : 'New notification'}
        saveLabel="Save notification"
        saving={saving}
        onClose={closeEditor}
        onSave={handleSave}>
        <AdminFormField
          label="Title"
          value={form.title}
          onChangeText={title => setForm(prev => ({ ...prev, title }))}
          placeholder="New course module available"
        />
        <AdminFormField
          label="Message"
          value={form.body}
          onChangeText={body => setForm(prev => ({ ...prev, body }))}
          placeholder="Check the Courses tab to start learning."
          multiline
        />
        <AdminNotificationCategoryPicker
          value={form.category}
          onChange={category => setForm(prev => ({ ...prev, category }))}
        />
        <AdminPublishedSwitch
          label="Published for learners"
          value={form.isPublished}
          onValueChange={isPublished =>
            setForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminContentVisibilityFields
          track={form.track}
          onTrackChange={track => setForm(prev => ({ ...prev, track }))}
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
          trackHint="Required. Choose whether this notification targets kids or professionals."
        />
        {editingNotification ? (
          <>
            <AppButton
              title={editorSendingLive ? 'Sending…' : 'Send live notification'}
              onPress={() => handleSendLiveNotification(editingNotification)}
              disabled={saving || editorSendingLive || sendingLiveId != null}
              variant="ghost"
              buttonStyle={adminStyles.sendLiveButton}
              textStyle={adminStyles.sendLiveButtonText}
            />
            <Text style={adminStyles.sendLiveHint}>
              Sends a push alert to devices that have allowed notifications.
            </Text>
          </>
        ) : null}
      </AdminEntityForm>
    </>
  );
}

export default AdminNotifications;
