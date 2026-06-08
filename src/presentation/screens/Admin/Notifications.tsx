import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import AppButton from '../../../components/AppButton';
import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import { adminStyles } from '../../../components/Admin/adminStyles';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminNotificationCategoryPicker from '../../../components/Admin/AdminNotificationCategoryPicker';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSchoolAudiencePicker from '../../../components/Admin/AdminSchoolAudiencePicker';
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
import { formatSchoolAudienceSummary } from '../../../utils/content/schoolAudience';
import {
  createNotification,
  deleteNotification,
  moveNotification,
  updateNotification,
} from '../../../services/firebase/notificationsService';
import type { AppNotification } from '../../../store/content/types/notifications.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { getErrorMessage } from '../../../utils/firebase/errors';

type NotificationFormState = {
  title: string;
  body: string;
  category: NotificationCategory;
  isPublished: boolean;
};

const EMPTY_FORM: NotificationFormState = {
  title: '',
  body: '',
  category: DEFAULT_NOTIFICATION_CATEGORY,
  isPublished: true,
};

function AdminNotifications() {
  const { notifications, loading } = useNotifications({
    includeUnpublished: true,
  });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();

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

  const openEditEditor = (notification: AppNotification) => {
    setEditingId(notification.id);
    setForm({
      title: notification.title,
      body: notification.body,
      category: notification.category,
      isPublished: notification.isPublished,
    });
    audienceForm.resetAudience({
      audience: notification.audience,
      schoolIds: notification.schoolIds,
      schoolGradeIds: notification.schoolGradeIds,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Title required', 'Each notification needs a title.');
      return;
    }
    if (!form.body.trim()) {
      Alert.alert('Message required', 'Enter the notification message for learners.');
      return;
    }

    const audienceError = audienceForm.validate();
    if (audienceError) {
      Alert.alert('Audience required', audienceError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        category: form.category,
        isPublished: form.isPublished,
        ...audienceForm.toPayload(),
      };
      if (editingId) {
        await updateNotification(editingId, payload);
      } else {
        await createNotification(payload);
      }
      closeEditor();
      Alert.alert(
        'Saved',
        form.isPublished
          ? 'Notification is live for learners in the app.'
          : 'Notification saved as a draft.',
      );
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const performSendLive = async (notification: AppNotification) => {
    setSendingLiveId(notification.id);
    try {
      const result = await sendLiveNotificationToUsers({
        notificationId: notification.id,
        title: notification.title,
        body: notification.body,
      });

      const delivered = result.successCount;
      const failed = result.failureCount;

      Alert.alert(
        'Live notification sent',
        failed > 0
          ? `Delivered to ${delivered} of ${result.recipientCount} device(s). ${failed} failed.`
          : `Delivered to ${delivered} device(s).`,
      );
    } catch (error) {
      Alert.alert('Send failed', getErrorMessage(error));
    } finally {
      setSendingLiveId(null);
    }
  };

  const handleSendLiveNotification = (notification: AppNotification) => {
    if (!notification.title.trim() || !notification.body.trim()) {
      Alert.alert(
        'Cannot send',
        'This notification needs a title and message before sending.',
      );
      return;
    }

    const audienceLabel = formatSchoolAudienceSummary(notification, schools);
    const categoryLabel = getNotificationCategoryLabel(notification.category);
    Alert.alert(
      'Send live notification',
      `Send push "${notification.title}" (${categoryLabel}) to learners at ${audienceLabel} who have notifications enabled for this category?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => performSendLive(notification),
        },
      ],
    );
  };

  const confirmDelete = (notification: AppNotification) => {
    Alert.alert('Delete notification', `Remove "${notification.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification(notification.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
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
      const audienceLine = formatSchoolAudienceSummary(notification, schools);
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
              buttonStyle={adminStyles.sendLiveButton}
              textStyle={adminStyles.sendLiveButtonText}
            />
          }
        />
      );
    },
    [handleMove, notifications.length, reorderingId, schools, sendingLiveId],
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
        <AdminSchoolAudiencePicker
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
        />
        {editingNotification ? (
          <>
            <AppButton
              title={editorSendingLive ? 'Sending…' : 'Send live notification'}
              onPress={() => handleSendLiveNotification(editingNotification)}
              disabled={saving || editorSendingLive || sendingLiveId != null}
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
