import React, { useCallback, useState } from 'react';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useChatKeywords } from '../../hooks/useChatKeywords';
import {
  createChatKeyword,
  deleteChatKeyword,
  moveChatKeyword,
  updateChatKeyword,
} from '../../../services/firebase/chatKeywordsService';
import type { ChatKeyword } from '../../../store/content/types/chatKeywords.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type KeywordFormState = {
  label: string;
  response: string;
  isPublished: boolean;
};

const EMPTY_FORM: KeywordFormState = {
  label: '',
  response: '',
  isPublished: true,
};

function ManageChatKeywords() {
  const { keywords, loading } = useChatKeywords({ includeUnpublished: true });

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [keywordForm, setKeywordForm] = useState<KeywordFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingKeyword, setSavingKeyword] = useState(false);

  const { reorderingId, handleMove } = useAdminReorder(keywords, moveChatKeyword);

  const openCreateEditor = () => {
    setEditingKeywordId(null);
    setKeywordForm(EMPTY_FORM);
    setFormError(null);
    setEditorVisible(true);
  };

  const openEditEditor = (keyword: ChatKeyword) => {
    setEditingKeywordId(keyword.id);
    setKeywordForm({
      label: keyword.label,
      response: keyword.response,
      isPublished: keyword.isPublished,
    });
    setFormError(null);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingKeywordId(null);
    setKeywordForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSaveKeyword = async () => {
    if (!keywordForm.label.trim()) {
      setFormError(appAlertCopy.admin.keywordRequired);
      return;
    }

    setSavingKeyword(true);
    setFormError(null);
    try {
      if (editingKeywordId) {
        await updateChatKeyword(editingKeywordId, {
          label: keywordForm.label,
          response: keywordForm.response,
          isPublished: keywordForm.isPublished,
        });
      } else {
        await createChatKeyword({
          label: keywordForm.label.trim(),
          response: keywordForm.response,
          isPublished: keywordForm.isPublished,
        });
      }
      closeEditor();
    } catch (error) {
      setFormError(toAdminWriteErrorMessage(error));
    } finally {
      setSavingKeyword(false);
    }
  };

  const confirmDeleteKeyword = (keyword: ChatKeyword) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('keyword'),
      appAlertCopy.admin.deleteConfirm('keyword', keyword.label),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatKeyword(keyword.id);
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
    <AdminListSectionHeader
      title="Keyword options"
      onAdd={openCreateEditor}
    />
  );

  const renderKeyword = useCallback(
    ({ item: keyword, index }: { item: ChatKeyword; index: number }) => (
      <AdminListRow
        title={keyword.label}
        subtitle={keyword.response.trim() || 'No response configured'}
        isPublished={keyword.isPublished}
        index={index}
        itemCount={keywords.length}
        reordering={reorderingId === keyword.id}
        onMoveUp={() => handleMove(keyword.id, 'up')}
        onMoveDown={() => handleMove(keyword.id, 'down')}
        onEdit={() => openEditEditor(keyword)}
        onDelete={() => confirmDeleteKeyword(keyword)}
      />
    ),
    [handleMove, keywords.length, reorderingId],
  );

  const keyExtractor = useCallback((item: ChatKeyword) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Chat Keywords"
        data={keywords}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderKeyword}
        listHeader={listHeader}
        emptyMessage="No keywords yet. Tap Add to create a quick-reply chip."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingKeywordId ? 'Edit keyword' : 'New keyword'}
        saveLabel="Save keyword"
        saving={savingKeyword}
        error={formError}
        onClose={closeEditor}
        onSave={handleSaveKeyword}>
        <AdminFormField
          label="Keyword label"
          value={keywordForm.label}
          onChangeText={label => {
            setFormError(null);
            setKeywordForm(prev => ({ ...prev, label }));
          }}
          placeholder="e.g. Courses"
          autoCapitalize="sentences"
        />
        <AdminFormField
          label="Assistant response"
          value={keywordForm.response}
          onChangeText={response =>
            setKeywordForm(prev => ({ ...prev, response }))
          }
          placeholder="Reply shown when this keyword is used"
          multiline
        />
        <AdminPublishedSwitch
          label="Published"
          value={keywordForm.isPublished}
          onValueChange={isPublished =>
            setKeywordForm(prev => ({ ...prev, isPublished }))
          }
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageChatKeywords;
