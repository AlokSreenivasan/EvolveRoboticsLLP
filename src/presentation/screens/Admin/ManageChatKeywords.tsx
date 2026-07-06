import React, { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
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

  const [addLabel, setAddLabel] = useState('');
  const [addResponse, setAddResponse] = useState('');
  const [addPublished, setAddPublished] = useState(true);
  const [adding, setAdding] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [keywordForm, setKeywordForm] = useState<KeywordFormState>(EMPTY_FORM);
  const [savingKeyword, setSavingKeyword] = useState(false);

  const { reorderingId, handleMove } = useAdminReorder(keywords, moveChatKeyword);

  const handleAddKeyword = async () => {
    const label = addLabel.trim();
    if (!label) {
      Alert.alert('Keyword required', 'Enter a label for the quick reply option.');
      return;
    }

    setAdding(true);
    try {
      await createChatKeyword({
        label,
        response: addResponse,
        isPublished: addPublished,
      });
      setAddLabel('');
      setAddResponse('');
      setAddPublished(true);
    } catch (error) {
      Alert.alert('Add failed', toAdminWriteErrorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  const openEditEditor = (keyword: ChatKeyword) => {
    setEditingKeywordId(keyword.id);
    setKeywordForm({
      label: keyword.label,
      response: keyword.response,
      isPublished: keyword.isPublished,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingKeywordId(null);
    setKeywordForm(EMPTY_FORM);
  };

  const handleSaveKeyword = async () => {
    if (!keywordForm.label.trim()) {
      Alert.alert('Keyword required', 'Enter a label for the quick reply option.');
      return;
    }

    if (!editingKeywordId) {
      return;
    }

    setSavingKeyword(true);
    try {
      await updateChatKeyword(editingKeywordId, {
        label: keywordForm.label,
        response: keywordForm.response,
        isPublished: keywordForm.isPublished,
      });
      closeEditor();
    } catch (error) {
      Alert.alert('Save failed', toAdminWriteErrorMessage(error));
    } finally {
      setSavingKeyword(false);
    }
  };

  const confirmDeleteKeyword = (keyword: ChatKeyword) => {
    Alert.alert('Delete keyword', `Remove "${keyword.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteChatKeyword(keyword.id);
          } catch (error) {
            Alert.alert('Delete failed', toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const listHeader = (
    <>
      <Text style={adminStyles.blockTitle}>Add a keyword option</Text>
      <Text style={adminStyles.sectionHint}>
        These appear as quick-reply chips on the chat screen. Learners can tap
        a chip to send the keyword and receive the configured response.
      </Text>
      <AdminSectionCard
        saving={adding}
        saveLabel="Add keyword"
        onSave={handleAddKeyword}>
        <AdminFormField
          label="Keyword label"
          value={addLabel}
          onChangeText={setAddLabel}
          placeholder="e.g. Courses"
          autoCapitalize="sentences"
        />
        <AdminFormField
          label="Assistant response"
          value={addResponse}
          onChangeText={setAddResponse}
          placeholder="Reply shown when this keyword is used"
          multiline
        />
        <AdminPublishedSwitch
          label="Published"
          value={addPublished}
          onValueChange={setAddPublished}
        />
      </AdminSectionCard>
      <Text style={adminStyles.blockTitle}>Keyword options</Text>
    </>
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
        subtitle="Configure quick-reply options for the chat assistant"
        data={keywords}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderKeyword}
        listHeader={listHeader}
        emptyMessage="No keywords yet. Add one using the form above."
      />

      <AdminEntityForm
        visible={editorVisible}
        title="Edit keyword"
        saveLabel="Save keyword"
        saving={savingKeyword}
        onClose={closeEditor}
        onSave={handleSaveKeyword}>
        <AdminFormField
          label="Keyword label"
          value={keywordForm.label}
          onChangeText={label => setKeywordForm(prev => ({ ...prev, label }))}
          placeholder="Keyword label"
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
