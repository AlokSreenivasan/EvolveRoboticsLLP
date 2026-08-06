import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  InteractionManager,
  Keyboard,
  Text,
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
import AdminPdfPicker from '../../../components/Admin/AdminPdfPicker';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import { adminStyles } from '../../../components/Admin/adminStyles';
import TactileButton from '../../../components/ui/TactileButton';
import { colors } from '../../../constants/theme';
import { useCourses } from '../../hooks/useCourses';
import { useSchools } from '../../hooks/useSchools';
import { useAdminImagePicker } from '../../hooks/admin/useAdminImagePicker';
import { useAdminPdfPicker } from '../../hooks/admin/useAdminPdfPicker';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { FIRESTORE_COLLECTIONS } from '../../../services/firebase/constants';
import {
  createCourse,
  deleteCourse,
  moveCourse,
  updateCourse,
} from '../../../services/firebase/coursesService';
import {
  deleteCourseSyllabusPdfByUrlSafe,
  deleteCourseThumbnailByUrlSafe,
  uploadCourseSyllabusPdf,
  uploadCourseThumbnail,
} from '../../../services/firebase/storageService';
import type {
  Course,
  CourseTrack,
} from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';
import {
  buildContentVisibilityPayload,
  validateContentVisibility,
  validateContentVisibilityTrack,
} from '../../../utils/admin/contentVisibility';

type CourseFormState = {
  title: string;
  subtitle: string;
  durationLabel: string;
  description: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

type CourseFieldErrors = {
  title?: boolean;
  durationLabel?: boolean;
  track?: boolean;
  audience?: boolean;
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
  const { courses, loading, error } = useCourses({ includeUnpublished: true });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CourseFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [previousImageUri, setPreviousImageUri] = useState<string | null>(null);
  const formRef = useRef(form);
  const imagePicker = useAdminImagePicker();
  const pdfPicker = useAdminPdfPicker();
  const { resetAudience } = audienceForm;
  const { loadExistingImage } = imagePicker;
  const { loadExistingPdf } = pdfPicker;

  const { reorderingId, handleMove } = useAdminReorder(courses, moveCourse);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const clearCourseErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviousImageUri(null);
    clearCourseErrors();
    audienceForm.resetAudience();
    imagePicker.resetImageState();
    pdfPicker.resetPdfState();
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
      clearCourseErrors();
      loadExistingImage(course.imageUri);
      loadExistingPdf(course.syllabusPdfUrl);
      setPreviousImageUri(course.imageUri.trim() || null);
      resetAudience({
        audience: course.audience,
        schoolIds: course.schoolIds,
        schoolGradeIds: course.schoolGradeIds,
      });
      setEditorVisible(true);
    },
    [loadExistingImage, loadExistingPdf, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviousImageUri(null);
    clearCourseErrors();
    audienceForm.resetAudience();
    imagePicker.resetImageState();
    pdfPicker.resetPdfState();
  };

  const validateCourse = (
    current: CourseFormState,
  ): { message: string | null; fields: CourseFieldErrors } => {
    const fields: CourseFieldErrors = {};
    const messages: string[] = [];

    if (!current.title.trim()) {
      fields.title = true;
      messages.push(appAlertCopy.admin.titleRequired('course'));
    }

    if (!current.durationLabel.trim()) {
      fields.durationLabel = true;
      messages.push(appAlertCopy.admin.durationRequired);
    }

    const visibilityError = validateContentVisibility(
      current.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      if (validateContentVisibilityTrack(current.track)) {
        fields.track = true;
      } else {
        fields.audience = true;
      }
      messages.push(visibilityError);
    }

    return {
      message: messages[0] ?? null,
      fields,
    };
  };

  const performSave = async () => {
    const current = formRef.current;
    const { message: validationError, fields } = validateCourse(current);
    if (validationError) {
      setFieldErrors(fields);
      setFormError(validationError);
      return;
    }

    const title = current.title.trim();
    const durationLabel = current.durationLabel.trim();

    const visibilityPayload = buildContentVisibilityPayload(
      current.track!,
      audienceForm.toPayload(),
    );

    const courseId =
      editingId ??
      doc(collection(db, FIRESTORE_COLLECTIONS.courses)).id;

    let imageUri = imagePicker.remoteUri.trim();
    const pendingLocalThumbnail = imagePicker.pendingLocalUri();
    let syllabusPdfUrl = pdfPicker.existingPdfUrl.trim();
    const pendingSyllabusPdf = pdfPicker.pendingPdfUri;

    setSaving(true);
    clearCourseErrors();
    try {
      if (pendingLocalThumbnail) {
        setUploadingThumbnail(true);
        imageUri = await uploadCourseThumbnail(courseId, pendingLocalThumbnail);
      }

      if (pendingSyllabusPdf) {
        setUploadingSyllabus(true);
        syllabusPdfUrl = await uploadCourseSyllabusPdf(
          courseId,
          pendingSyllabusPdf,
        );
      }

      const payload = {
        title,
        subtitle: current.subtitle.trim(),
        imageUri,
        durationLabel,
        description: current.description.trim(),
        syllabusPdfUrl,
        isPublished: current.isPublished,
        ...visibilityPayload,
      };

      if (editingId) {
        await updateCourse(editingId, payload);
      } else {
        await createCourse(payload, { courseId });
      }

      const replacedThumbnail =
        previousImageUri &&
        previousImageUri !== imageUri &&
        previousImageUri.trim().length > 0;
      if (replacedThumbnail) {
        await deleteCourseThumbnailByUrlSafe(previousImageUri);
      }

      const previousSyllabusUrl = pdfPicker.existingPdfUrl.trim();
      const replacedSyllabus =
        pendingSyllabusPdf &&
        previousSyllabusUrl &&
        previousSyllabusUrl !== syllabusPdfUrl;
      if (replacedSyllabus) {
        await deleteCourseSyllabusPdfByUrlSafe(previousSyllabusUrl);
      }

      closeEditor();
    } catch (error) {
      setFormError(toAdminWriteErrorMessage(error));
    } finally {
      setUploadingThumbnail(false);
      setUploadingSyllabus(false);
      setSaving(false);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      performSave().catch(() => undefined);
    });
  };

  const confirmDelete = useCallback((course: Course) => {
    appAlert(appAlertCopy.admin.deleteTitle('course'), appAlertCopy.admin.deleteConfirm('course', course.title), [
      { text: appAlertButtons.cancel, style: 'cancel' },
      {
        text: appAlertButtons.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourseThumbnailByUrlSafe(course.imageUri);
            await deleteCourseSyllabusPdfByUrlSafe(course.syllabusPdfUrl);
            await deleteCourse(course.id);
          } catch (error) {
            appAlert(appAlertCopy.admin.deleteFailedTitle, toAdminWriteErrorMessage(error));
          }
        },
      },
    ]);
  }, []);

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
    [
      confirmDelete,
      courses.length,
      handleMove,
      openEditEditor,
      reorderingId,
      schools,
    ],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const formBusy = saving || uploadingThumbnail || uploadingSyllabus;
  const savingLabel = uploadingThumbnail
    ? 'Uploading thumbnail…'
    : uploadingSyllabus
      ? 'Uploading syllabus…'
      : 'Saving…';

  return (
    <>
      <AdminListLayout
        title="Manage Courses"
        data={courses}
        loading={loading}
        error={error}
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
        error={formError}
        onClose={closeEditor}
        onSave={handleSave}>
        <AdminFormField
          label="Title *"
          value={form.title}
          onChangeText={title => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, title: undefined }));
            setForm(prev => ({ ...prev, title }));
          }}
          placeholder="Introduction to Robotics"
          error={fieldErrors.title}
        />
        <AdminContentVisibilityFields
          track={form.track}
          onTrackChange={track => {
            setFormError(null);
            setFieldErrors(prev => ({
              ...prev,
              track: undefined,
              audience: undefined,
            }));
            setForm(prev => ({ ...prev, track }));
          }}
          onProfessionalsTrackSelected={() => audienceForm.resetAudience()}
          audience={audienceForm.audience}
          selectedSchoolIds={audienceForm.schoolIds}
          schoolGradeIds={audienceForm.schoolGradeIds}
          schools={schools}
          schoolsLoading={schoolsLoading}
          schoolsError={schoolsError}
          onAudienceChange={audience => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, audience: undefined }));
            audienceForm.setAudienceMode(audience);
          }}
          onToggleSchool={schoolId => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, audience: undefined }));
            audienceForm.toggleSchoolId(schoolId);
          }}
          onSchoolGradeModeChange={(schoolId, mode) => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, audience: undefined }));
            audienceForm.setSchoolGradeMode(schoolId, mode);
          }}
          onToggleSchoolGrade={(schoolId, gradeId) => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, audience: undefined }));
            audienceForm.toggleSchoolGrade(schoolId, gradeId);
          }}
          getSchoolGradeMode={audienceForm.getSchoolGradeMode}
          trackHint="Required. Choose whether this course is shown to kids or professionals."
          trackError={fieldErrors.track}
          audienceError={fieldErrors.audience}
        />
        <AdminFormField
          label="Subtitle (optional)"
          value={form.subtitle}
          onChangeText={subtitle => setForm(prev => ({ ...prev, subtitle }))}
          placeholder="Brief line shown on the course card"
          multiline
        />
        <AdminFormField
          label="Duration *"
          value={form.durationLabel}
          onChangeText={durationLabel => {
            setFormError(null);
            setFieldErrors(prev => ({ ...prev, durationLabel: undefined }));
            setForm(prev => ({ ...prev, durationLabel }));
          }}
          placeholder="2h 30m"
          error={fieldErrors.durationLabel}
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
        <AdminPdfPicker
          label="Syllabus PDF (optional)"
          statusLabel={
            pdfPicker.pdfStatusLabel === 'No PDF selected'
              ? 'No syllabus attached'
              : pdfPicker.pdfStatusLabel
          }
          picking={pdfPicker.pickingPdf}
          onPick={() => {
            pdfPicker.handlePickPdf().catch(() => {
              // Errors are surfaced by the picker hook.
            });
          }}
        />
        <Text style={adminStyles.fieldLabel}>Thumbnail</Text>
        <TactileButton
          variant="ghost"
          style={adminStyles.pickImageButton}
          onPress={imagePicker.handlePickImage}
          disabled={formBusy}
          accessibilityLabel="Choose thumbnail from gallery">
          <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={adminStyles.pickImageText}>Choose from gallery</Text>
        </TactileButton>
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
