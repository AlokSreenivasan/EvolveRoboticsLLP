import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  InteractionManager,
  Keyboard,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ImagePlus } from 'lucide-react-native';
import {
  collection,
  db,
  doc,
} from '../../../services/firebase/firestoreClient';

import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminSectionCard from '../../../components/Admin/AdminSectionCard';
import { adminStyles } from '../../../components/Admin/adminStyles';
import { colors } from '../../../constants/theme';
import { useProjects } from '../../hooks/useProjects';
import { useSchools } from '../../hooks/useSchools';
import { useAdminImagePicker } from '../../hooks/admin/useAdminImagePicker';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';
import { useAdminSectionDefaults } from '../../hooks/admin/useAdminSectionDefaults';
import { FIRESTORE_COLLECTIONS } from '../../../services/firebase/constants';
import {
  createProject,
  deleteProject,
  ensureProjectsSectionDefaults,
  moveProject,
  updateProject,
  updateProjectsSection,
} from '../../../services/firebase/projectsService';
import {
  deleteProjectImageByUrlSafe,
  uploadProjectImage,
} from '../../../services/firebase/storageService';
import type { Project } from '../../../store/content/types/projects.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type ProjectFormState = {
  title: string;
  subtitle: string;
  description: string;
  track: CourseTrack | null;
  isPublished: boolean;
};

const EMPTY_PROJECT_FORM: ProjectFormState = {
  title: '',
  subtitle: '',
  description: '',
  track: null,
  isPublished: true,
};

function ManageProjects() {
  const { section, projects, loading } = useProjects({ includeUnpublished: true });

  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [savingProject, setSavingProject] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const imagePicker = useAdminImagePicker();
  const { resetAudience } = audienceForm;
  const { loadExistingImage } = imagePicker;
  const { reorderingId, handleMove } = useAdminReorder(projects, moveProject);

  useAdminSectionDefaults(ensureProjectsSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openCreateEditor = () => {
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    audienceForm.resetAudience();
    imagePicker.resetImageState();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (project: Project) => {
      setEditingProjectId(project.id);
      setProjectForm({
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        track: project.track,
        isPublished: project.isPublished,
      });
      resetAudience({
        audience: project.audience,
        schoolIds: project.schoolIds,
        schoolGradeIds: project.schoolGradeIds,
      });
      loadExistingImage(project.imageUri);
      setEditorVisible(true);
    },
    [loadExistingImage, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    audienceForm.resetAudience();
    imagePicker.resetImageState();
  };

  const handleSaveSection = async () => {
    const payload = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      appAlert(
        appAlertCopy.admin.screenTitleNeeded,
        appAlertCopy.admin.screenTitleRequired('Projects'),
      );
      return;
    }

    setSavingSection(true);
    try {
      await updateProjectsSection(payload);
      appAlert(
        appAlertCopy.admin.savedTitle,
        appAlertCopy.admin.screenHeadingsSaved('Projects'),
      );
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSavingSection(false);
    }
  };

  const performSaveProject = async () => {
    if (!projectForm.title.trim()) {
      appAlert(
        appAlertCopy.admin.titleNeeded,
        appAlertCopy.admin.titleRequired('project'),
      );
      return;
    }

    const visibilityError = validateContentVisibility(
      projectForm.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
      return;
    }

    const projectId =
      editingProjectId ??
      doc(collection(db, FIRESTORE_COLLECTIONS.projects)).id;

    let imageUri = imagePicker.remoteUri.trim();
    const pendingLocalImage = imagePicker.pendingLocalUri();

    setSavingProject(true);
    try {
      if (pendingLocalImage) {
        setUploadingImage(true);
        imageUri = await uploadProjectImage(projectId, pendingLocalImage);
      }

      const visibilityPayload = buildContentVisibilityPayload(
        projectForm.track!,
        audienceForm.toPayload(),
      );
      const payload = {
        title: projectForm.title,
        subtitle: projectForm.subtitle,
        description: projectForm.description,
        imageUri,
        isPublished: projectForm.isPublished,
        ...visibilityPayload,
      };

      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
      } else {
        await createProject(payload, { projectId });
      }
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setUploadingImage(false);
      setSavingProject(false);
    }
  };

  const handleSaveProject = () => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      performSaveProject().catch(() => undefined);
    });
  };

  const confirmDeleteProject = (project: Project) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('project'),
      appAlertCopy.admin.deleteConfirm('project', project.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProjectImageByUrlSafe(project.imageUri);
              await deleteProject(project.id);
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

  const formBusy = savingProject || uploadingImage;
  const savingLabel = uploadingImage ? 'Uploading image…' : 'Save project';

  const listHeader = (
    <>
      <Text style={adminStyles.blockTitle}>Screen headings</Text>
      <AdminSectionCard saving={savingSection} onSave={handleSaveSection}>
        <AdminFormField
          label="Screen title"
          value={sectionTitle}
          onChangeText={setSectionTitle}
          placeholder="Projects"
        />
        <AdminFormField
          label="Screen subtitle"
          value={sectionSubtitle}
          onChangeText={setSectionSubtitle}
          placeholder="Hands-on builds and guided project work"
        />
      </AdminSectionCard>
      <AdminListSectionHeader title="Projects" onAdd={openCreateEditor} />
    </>
  );

  const renderProject = useCallback(
    ({ item: project, index }: { item: Project; index: number }) => (
      <AdminListRow
        title={project.title}
        subtitle={
          project.subtitle
            ? `${project.subtitle} · ${project.imageUri.trim() ? 'Image attached' : 'No image'} · ${formatContentVisibilitySummary(project.track, project, schools)}`
            : `${project.imageUri.trim() ? 'Image attached' : 'No image'} · ${formatContentVisibilitySummary(project.track, project, schools)}`
        }
        isPublished={project.isPublished}
        index={index}
        itemCount={projects.length}
        reordering={reorderingId === project.id}
        onMoveUp={() => handleMove(project.id, 'up')}
        onMoveDown={() => handleMove(project.id, 'down')}
        onEdit={() => openEditEditor(project)}
        onDelete={() => confirmDeleteProject(project)}
      />
    ),
    [handleMove, openEditEditor, projects.length, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Projects"
        subtitle="Create and manage projects for the To Do screen"
        data={projects}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderProject}
        listHeader={listHeader}
        emptyMessage="No projects yet. Add one for students to see in To Do."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={editingProjectId ? 'Edit project' : 'New project'}
        saveLabel={savingLabel}
        saving={formBusy}
        onClose={closeEditor}
        onSave={handleSaveProject}>
        <AdminFormField
          label="Title"
          value={projectForm.title}
          onChangeText={title => setProjectForm(prev => ({ ...prev, title }))}
          placeholder="Line-following robot"
        />
        <AdminFormField
          label="Subtitle"
          value={projectForm.subtitle}
          onChangeText={subtitle =>
            setProjectForm(prev => ({ ...prev, subtitle }))
          }
          placeholder="Brief summary shown on the card"
        />
        <AdminFormField
          label="Description"
          value={projectForm.description}
          onChangeText={description =>
            setProjectForm(prev => ({ ...prev, description }))
          }
          placeholder="Additional details (optional)"
          multiline
        />
        <Text style={adminStyles.fieldLabel}>Cover image (optional)</Text>
        <TouchableOpacity
          style={adminStyles.pickImageButton}
          onPress={imagePicker.handlePickImage}
          disabled={formBusy}
          accessibilityRole="button"
          accessibilityLabel="Choose project image from gallery">
          <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={adminStyles.pickImageText}>Choose from gallery</Text>
        </TouchableOpacity>
        <AdminFormField
          label="Image URL (optional)"
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
          label="Published for students"
          value={projectForm.isPublished}
          onValueChange={isPublished =>
            setProjectForm(prev => ({ ...prev, isPublished }))
          }
        />
        <AdminContentVisibilityFields
          track={projectForm.track}
          onTrackChange={track => setProjectForm(prev => ({ ...prev, track }))}
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
          trackHint="Required. Choose whether this project is visible to kids or professionals."
        />
      </AdminEntityForm>
    </>
  );
}

export default ManageProjects;
