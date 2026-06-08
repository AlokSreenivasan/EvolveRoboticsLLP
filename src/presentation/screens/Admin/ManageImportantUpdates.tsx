import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSchoolAudiencePicker from '../../../components/Admin/AdminSchoolAudiencePicker';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useImportantUpdates } from '../../hooks/useImportantUpdates';
import { useSchools } from '../../hooks/useSchools';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { formatSchoolAudienceSummary } from '../../../utils/content/schoolAudience';
import { useAdminSectionDefaults } from '../../hooks/admin/useAdminSectionDefaults';
import {
  createImportantUpdateNotice,
  deleteImportantUpdateNotice,
  ensureImportantUpdatesSectionDefaults,
  moveImportantUpdateNotice,
  updateImportantUpdateNotice,
  updateImportantUpdatesSection,
} from '../../../services/firebase/importantUpdatesService';
import type {
  ImportantUpdateNotice,
  UpdateImportantUpdatesSectionInput,
} from '../../../store/content/types/importantUpdates.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';

type NoticeFormState = {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  isPublished: boolean;
};

const EMPTY_NOTICE_FORM: NoticeFormState = {
  tag: '',
  title: '',
  subtitle: '',
  description: '',
  isPublished: true,
};

function ManageImportantUpdates() {
  const { section, notices, loading } = useImportantUpdates({
    includeUnpublished: true,
  });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState<NoticeFormState>(EMPTY_NOTICE_FORM);
  const [savingNotice, setSavingNotice] = useState(false);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { reorderingId, handleMove } = useAdminReorder(
    notices,
    moveImportantUpdateNotice,
  );

  useAdminSectionDefaults(ensureImportantUpdatesSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
    setActionLabel(section.actionLabel);
  }, [section]);

  const openCreateEditor = () => {
    setEditingNoticeId(null);
    setNoticeForm(EMPTY_NOTICE_FORM);
    audienceForm.resetAudience();
    setEditorVisible(true);
  };

  const openEditEditor = (notice: ImportantUpdateNotice) => {
    setEditingNoticeId(notice.id);
    setNoticeForm({
      tag: notice.tag,
      title: notice.title,
      subtitle: notice.subtitle,
      description: notice.description,
      isPublished: notice.isPublished,
    });
    audienceForm.resetAudience({
      audience: notice.audience,
      schoolIds: notice.schoolIds,
      schoolGradeIds: notice.schoolGradeIds,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingNoticeId(null);
    setNoticeForm(EMPTY_NOTICE_FORM);
    audienceForm.resetAudience();
  };

  const handleSaveSection = async () => {
    const payload: UpdateImportantUpdatesSectionInput = {
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
      await updateImportantUpdatesSection(payload);
      Alert.alert('Saved', 'Section headings updated. Changes appear on Home instantly.');
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeForm.title.trim()) {
      Alert.alert('Title required', 'Each notice needs a title.');
      return;
    }

    const audienceError = audienceForm.validate();
    if (audienceError) {
      Alert.alert('Audience required', audienceError);
      return;
    }

    setSavingNotice(true);
    try {
      const audiencePayload = audienceForm.toPayload();
      if (editingNoticeId) {
        await updateImportantUpdateNotice(editingNoticeId, {
          tag: noticeForm.tag,
          title: noticeForm.title,
          subtitle: noticeForm.subtitle,
          description: noticeForm.description,
          isPublished: noticeForm.isPublished,
          ...audiencePayload,
        });
      } else {
        await createImportantUpdateNotice({
          tag: noticeForm.tag.trim() || 'New Notice',
          title: noticeForm.title,
          subtitle: noticeForm.subtitle,
          description: noticeForm.description,
          isPublished: noticeForm.isPublished,
          ...audiencePayload,
        });
      }
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingNotice(false);
    }
  };

  const confirmDeleteNotice = (notice: ImportantUpdateNotice) => {
    Alert.alert('Delete notice', `Remove "${notice.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteImportantUpdateNotice(notice.id);
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
          placeholder="Important Updates"
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
          placeholder="View All"
        />
      </AdminSectionCard>
      <AdminListSectionHeader title="Notices" onAdd={openCreateEditor} />
    </>
  );

  const renderNotice = useCallback(
    ({ item: notice, index }: { item: ImportantUpdateNotice; index: number }) => (
      <AdminListRow
        title={notice.title}
        subtitle={
          notice.subtitle
            ? `${notice.subtitle} · ${formatSchoolAudienceSummary(notice, schools)}`
            : formatSchoolAudienceSummary(notice, schools)
        }
        tag={notice.tag}
        isPublished={notice.isPublished}
        index={index}
        itemCount={notices.length}
        reordering={reorderingId === notice.id}
        onMoveUp={() => handleMove(notice.id, 'up')}
        onMoveDown={() => handleMove(notice.id, 'down')}
        onEdit={() => openEditEditor(notice)}
        onDelete={() => confirmDeleteNotice(notice)}
      />
    ),
    [handleMove, notices.length, reorderingId, schools],
  );

  const keyExtractor = useCallback(
    (item: ImportantUpdateNotice) => item.id,
    [],
  );

  return (
    <>
      <AdminListLayout
        title="Important Updates"
        subtitle="Edit home section titles and notices"
        data={notices}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderNotice}
        listHeader={listHeader}
        emptyMessage="No notices yet. Add one to show on the home screen."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingNoticeId ? 'Edit notice' : 'New notice'}
        saveLabel="Save notice"
        saving={savingNotice}
        onClose={closeEditor}
        onSave={handleSaveNotice}>
        <AdminFormField
          label="Tag"
          value={noticeForm.tag}
          onChangeText={tag => setNoticeForm(prev => ({ ...prev, tag }))}
          placeholder="New Notice"
        />
        <AdminFormField
          label="Title"
          value={noticeForm.title}
          onChangeText={title => setNoticeForm(prev => ({ ...prev, title }))}
          placeholder="Robotics Workshop on 25 May 2025"
        />
        <AdminFormField
          label="Subtitle"
          value={noticeForm.subtitle}
          onChangeText={subtitle =>
            setNoticeForm(prev => ({ ...prev, subtitle }))
          }
          placeholder="Hands-on session for all students."
        />
        <AdminFormField
          label="Description"
          value={noticeForm.description}
          onChangeText={description =>
            setNoticeForm(prev => ({ ...prev, description }))
          }
          placeholder="Additional details (optional)"
          multiline
        />
        <AdminPublishedSwitch
          label="Published on home"
          value={noticeForm.isPublished}
          onValueChange={isPublished =>
            setNoticeForm(prev => ({ ...prev, isPublished }))
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
      </AdminEntityForm>
    </>
  );
}

export default ManageImportantUpdates;
