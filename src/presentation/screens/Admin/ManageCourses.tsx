import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  InteractionManager,
  Keyboard,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  db,
  doc,
} from '../../../services/firebase/firestoreClient';
import { ImagePlus } from 'lucide-react-native';

import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import AdminCourseListCard from '../../../components/Admin/AdminCourseListCard';
import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { colors } from '../../../constants/theme';
import { useCourses } from '../../hooks/useCourses';
import { useSchools } from '../../hooks/useSchools';
import { useAdminImagePicker } from '../../hooks/admin/useAdminImagePicker';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { FIRESTORE_COLLECTIONS } from '../../../services/firebase/constants';
import {
  createCourse,
  deleteCourse,
  moveCourse,
  updateCourse,
} from '../../../services/firebase/coursesService';
import { uploadCourseThumbnail } from '../../../services/firebase/storageService';
import type {
  Course,
  CourseTrack,
} from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  buildContentVisibilityPayload,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';

type CourseFormState = {
  title: string;
  subtitle: string;
  durationLabel: string;
  description: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_FORM: CourseFormState = {
  title: '',
  subtitle: '',
  durationLabel: '',
  description: '',
  track: null,
  isPublished: true,
};

function ManageCourses() {
  const { courses, loading } = useCourses({ includeUnpublished: true });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const formRef = useRef(form);
  const imagePicker = useAdminImagePicker();
  const { resetAudience } = audienceForm;
  const { loadExistingImage } = imagePicker;

  const { reorderingId, handleMove } = useAdminReorder(courses, moveCourse);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
    imagePicker.resetImageState();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (course: Course) => {
      setEditingId(course.id);
      setForm({
        title: course.title,
        subtitle: course.subtitle,
        durationLabel: course.durationLabel,
        description: course.description,
        track: course.track,
        isPublished: course.isPublished,
      });
      loadExistingImage(course.imageUri);
      resetAudience({
        audience: course.audience,
        schoolIds: course.schoolIds,
        schoolGradeIds: course.schoolGradeIds,
      });
      setEditorVisible(true);
    },
    [loadExistingImage, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    audienceForm.resetAudience();
    imagePicker.resetImageState();
  };

  const performSave = async () => {
    const current = formRef.current;
    const title = current.title.trim();

    if (!title) {
      appAlert(appAlertCopy.admin.titleNeeded, appAlertCopy.admin.titleRequired('course'));
      return;
    }

    const durationLabel = current.durationLabel.trim();
    if (!durationLabel) {
      appAlert(
        appAlertCopy.admin.durationRequiredTitle,
        appAlertCopy.admin.durationRequired,
      );
      return;
    }

    const visibilityError = validateContentVisibility(
      current.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
      return;
    }

    const visibilityPayload = buildContentVisibilityPayload(
      current.track!,
      audienceForm.toPayload(),
    );

    const courseId =
      editingId ??
      doc(collection(db, FIRESTORE_COLLECTIONS.courses)).id;

    let imageUri = imagePicker.remoteUri.trim();
    const pendingLocalThumbnail = imagePicker.pendingLocalUri();

    setSaving(true);
    try {
      if (pendingLocalThumbnail) {
        setUploadingThumbnail(true);
        imageUri = await uploadCourseThumbnail(courseId, pendingLocalThumbnail);
      }

      const payload = {
        title,
        subtitle: current.subtitle.trim(),
        imageUri,
        durationLabel,
        description: current.description.trim(),
        isPublished: current.isPublished,
        ...visibilityPayload,
      };

      if (editingId) {
        await updateCourse(editingId, payload);
      } else {
        await createCourse(payload, { courseId });
      }
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setUploadingThumbnail(false);
      setSaving(false);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      performSave().catch(() => undefined);
    });
  };

  const confirmDelete = (course: Course) => {
    appAlert(appAlertCopy.admin.deleteTitle('course'), appAlertCopy.admin.deleteConfirm('course', course.title), [
      { text: appAlertButtons.cancel, style: 'cancel' },
      {
        text: appAlertButtons.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourse(course.id);
          } catch (error) {
            appAlert(appAlertCopy.admin.deleteFailedTitle, toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  };

  const listHeader = (
    <AdminListSectionHeader title="All courses" onAdd={openCreateEditor} />
  );

  const renderCourse = useCallback(
    ({ item: course, index }: { item: Course; index: number }) => (
      <AdminCourseListCard
        course={course}
        schools={schools}
        accentIndex={index}
        index={index}
        itemCount={courses.length}
        reordering={reorderingId === course.id}
        onMoveUp={() => handleMove(course.id, 'up')}
        onMoveDown={() => handleMove(course.id, 'down')}
        onEdit={() => openEditEditor(course)}
        onDelete={() => confirmDelete(course)}
      />
    ),
    [courses.length, handleMove, openEditEditor, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const formBusy = saving || uploadingThumbnail;
  const savingLabel = uploadingThumbnail
    ? 'Uploading thumbnail…'
    : 'Saving…';

  return (
    <>
      <AdminListLayout
        title="Manage Courses"
        subtitle="Create courses shown in the Courses tab"
        data={courses}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderCourse}
        listHeader={listHeader}
        emptyMessage="No courses yet. Tap Add to create one."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingId ? 'Edit course' : 'New course'}
        saveLabel="Save course"
        savingLabel={savingLabel}
        saving={formBusy}
        onClose={closeEditor}
        onSave={handleSave}>
        <AdminFormField
          label="Title"
          value={form.title}
          onChangeText={title => setForm(prev => ({ ...prev, title }))}
          placeholder="Introduction to Robotics"
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
          trackHint="Required. Choose whether this course is shown to kids or professionals."
        />
        <AdminFormField
          label="Subtitle (optional)"
          value={form.subtitle}
          onChangeText={subtitle => setForm(prev => ({ ...prev, subtitle }))}
          placeholder="Brief line shown on the course card"
          multiline
        />
        <AdminFormField
          label="Duration"
          value={form.durationLabel}
          onChangeText={durationLabel =>
            setForm(prev => ({ ...prev, durationLabel }))
          }
          placeholder="2h 30m"
        />
        <AdminFormField
          label="Description (optional)"
          value={form.description}
          onChangeText={description =>
            setForm(prev => ({ ...prev, description }))
          }
          placeholder="What learners will cover in this course"
          multiline
        />
        <Text style={adminStyles.fieldLabel}>Thumbnail</Text>
        <TouchableOpacity
          style={adminStyles.pickImageButton}
          onPress={imagePicker.handlePickImage}
          disabled={formBusy}
          accessibilityRole="button"
          accessibilityLabel="Choose thumbnail from gallery">
          <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={adminStyles.pickImageText}>Choose from gallery</Text>
        </TouchableOpacity>
        <AdminFormField
          label="Thumbnail URL (optional)"
          value={imagePicker.remoteUri}
          onChangeText={uri => imagePicker.setRemoteUri(uri)}
          placeholder="https://..."
          autoCapitalize="none"
        />
        {imagePicker.previewUri ? (
          <Image
            source={{ uri: imagePicker.previewUri }}
            style={adminStyles.thumbnailPreview}
          />
        ) : null}
        <AdminPublishedSwitch
          label="Published for learners"
          value={form.isPublished}
          onValueChange={isPublished =>
            setForm(prev => ({ ...prev, isPublished }))
          }
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageCourses;
