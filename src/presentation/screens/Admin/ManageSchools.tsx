import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useSchools } from '../../hooks/useSchools';
import {
  createSchool,
  deleteSchool,
  moveSchool,
  updateSchool,
} from '../../../services/firebase/schoolsService';
import type { School } from '../../../store/content/types/schools.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type SchoolFormState = {
  name: string;
  city: string;
};

const EMPTY_FORM: SchoolFormState = {
  name: '',
  city: '',
};

function ManageSchools() {
  const { schools, loading } = useSchools();

  const [addName, setAddName] = useState('');
  const [addCity, setAddCity] = useState('');
  const [adding, setAdding] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolFormState>(EMPTY_FORM);
  const [savingSchool, setSavingSchool] = useState(false);

  const { reorderingId, handleMove } = useAdminReorder(schools, moveSchool);

  const handleAddSchool = async () => {
    const name = addName.trim();
    if (!name) {
      appAlert(appAlertCopy.admin.schoolNameNeeded, appAlertCopy.admin.schoolNameRequired);
      return;
    }

    setAdding(true);
    try {
      await createSchool({ name, city: addCity });
      setAddName('');
      setAddCity('');
    } catch (error) {
      appAlert(appAlertCopy.admin.addFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  const openEditEditor = (school: School) => {
    setEditingSchoolId(school.id);
    setSchoolForm({
      name: school.name,
      city: school.city,
    });
    setEditorVisible(true);
  };

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingSchoolId(null);
    setSchoolForm(EMPTY_FORM);
  };

  const handleSaveSchool = async () => {
    if (!schoolForm.name.trim()) {
      appAlert(appAlertCopy.admin.schoolNameNeeded, appAlertCopy.admin.schoolNameRequired);
      return;
    }

    if (!editingSchoolId) {
      return;
    }

    setSavingSchool(true);
    try {
      await updateSchool(editingSchoolId, {
        name: schoolForm.name,
        city: schoolForm.city,
      });
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingSchool(false);
    }
  };

  const confirmDeleteSchool = (school: School) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('school'),
      appAlertCopy.admin.deleteConfirm('school', school.name),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchool(school.id);
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
    <>
      <Text style={adminStyles.blockTitle}>Add a school</Text>
      <Text style={adminStyles.sectionHint}>
        New schools appear in the list below. Use reorder arrows to change display
        order.
      </Text>
      <AdminSectionCard
        saving={adding}
        saveLabel="Add school"
        onSave={handleAddSchool}>
        <AdminFormField
          label="School name"
          value={addName}
          onChangeText={setAddName}
          placeholder="e.g. Riverside High School"
          autoCapitalize="words"
        />
        <AdminFormField
          label="City (optional)"
          value={addCity}
          onChangeText={setAddCity}
          placeholder="e.g. Austin, TX"
          autoCapitalize="words"
        />
      </AdminSectionCard>
      <Text style={adminStyles.blockTitle}>Schools</Text>
    </>
  );

  const renderSchool = useCallback(
    ({ item: school, index }: { item: School; index: number }) => (
      <AdminListRow
        title={school.name}
        subtitle={school.city.trim() || undefined}
        isPublished
        index={index}
        itemCount={schools.length}
        reordering={reorderingId === school.id}
        onMoveUp={() => handleMove(school.id, 'up')}
        onMoveDown={() => handleMove(school.id, 'down')}
        onEdit={() => openEditEditor(school)}
        onDelete={() => confirmDeleteSchool(school)}
      />
    ),
    [handleMove, schools.length, reorderingId],
  );

  const keyExtractor = useCallback((item: School) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Add Schools"
        subtitle="Register partner schools for the Evolve platform"
        data={schools}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderSchool}
        listHeader={listHeader}
        emptyMessage="No schools yet. Add one using the form above."
      />

      <AdminEntityForm
        visible={editorVisible}
        title="Edit school"
        saveLabel="Save school"
        saving={savingSchool}
        onClose={closeEditor}
        onSave={handleSaveSchool}>
        <AdminFormField
          label="School name"
          value={schoolForm.name}
          onChangeText={name => setSchoolForm(prev => ({ ...prev, name }))}
          placeholder="School name"
          autoCapitalize="words"
        />
        <AdminFormField
          label="City (optional)"
          value={schoolForm.city}
          onChangeText={city => setSchoolForm(prev => ({ ...prev, city }))}
          placeholder="City"
          autoCapitalize="words"
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageSchools;
