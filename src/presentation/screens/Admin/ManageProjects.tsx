import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  InteractionManager,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FileUp, ImagePlus, X } from 'lucide-react-native';
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
import { adminStyles } from '../../../components/Admin/adminStyles';
import TactileButton from '../../../components/ui/TactileButton';
import { colors } from '../../../constants/theme';
import { useProjects } from '../../hooks/useProjects';
import { useSchools } from '../../hooks/useSchools';
import { useAdminMarkdownPicker } from '../../hooks/admin/useAdminMarkdownPicker';
import { useAdminProjectGalleryPicker } from '../../hooks/admin/useAdminProjectGalleryPicker';
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
  deleteProjectImagesByUrlsSafe,
  deleteProjectMarkdownByUrlSafe,
  uploadProjectImage,
  uploadProjectMarkdown,
} from '../../../services/firebase/storageService';
import type { Project } from '../../../store/content/types/projects.types';
import { PROJECT_MAX_IMAGES } from '../../../store/content/types/projects.types';
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
  const [sectionEditorVisible, setSectionEditorVisible] = useState(false);
  const [sectionFormError, setSectionFormError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [savingProject, setSavingProject] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [initialMarkdownUrl, setInitialMarkdownUrl] = useState('');

  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const gallery = useAdminProjectGalleryPicker();
  const markdownPicker = useAdminMarkdownPicker();
  const { resetAudience } = audienceForm;
  const { loadExistingImages, resetGallery } = gallery;
  const { loadExistingMarkdown, resetMarkdownState } = markdownPicker;
  const { reorderingId, handleMove } = useAdminReorder(projects, moveProject);

  useAdminSectionDefaults(ensureProjectsSectionDefaults);

  useEffect(() => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  }, [section]);

  const openSectionEditor = () => {
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
    setSectionFormError(null);
    setSectionEditorVisible(true);
  };

  const closeSectionEditor = () => {
    setSectionEditorVisible(false);
    setSectionFormError(null);
    setSectionTitle(section.sectionTitle);
    setSectionSubtitle(section.sectionSubtitle);
  };

  const openCreateEditor = () => {
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    audienceForm.resetAudience();
    resetGallery();
    resetMarkdownState();
    setInitialMarkdownUrl('');
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
      loadExistingImages(project.imageUris);
      loadExistingMarkdown(project.markdownUrl);
      setInitialMarkdownUrl(project.markdownUrl.trim());
      setEditorVisible(true);
    },
    [loadExistingImages, loadExistingMarkdown, resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    audienceForm.resetAudience();
    resetGallery();
    resetMarkdownState();
    setInitialMarkdownUrl('');
  };

  const handleSaveSection = async () => {
    const payload = {
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim(),
    };

    if (!payload.sectionTitle) {
      setSectionFormError(appAlertCopy.admin.screenTitleRequired('Projects'));
      return;
    }

    setSavingSection(true);
    setSectionFormError(null);
    try {
      await updateProjectsSection(payload);
      setSectionEditorVisible(false);
    } catch (error) {
      setSectionFormError(toAdminWriteErrorMessage(error));
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

    setSavingProject(true);
    try {
      const needsUpload =
        gallery.items.some(item => item.kind === 'local') ||
        Boolean(markdownPicker.pendingMarkdownUri);
      if (needsUpload) {
        setUploadingMedia(true);
      }

      const imageUris: string[] = [];
      for (let index = 0; index < gallery.items.length; index += 1) {
        const item = gallery.items[index];
        if (item.kind === 'remote') {
          imageUris.push(item.url);
        } else {
          imageUris.push(await uploadProjectImage(projectId, item.uri, index));
        }
      }

      let markdownUrl = markdownPicker.existingMarkdownUrl.trim();
      if (markdownPicker.pendingMarkdownUri) {
        markdownUrl = await uploadProjectMarkdown(
          projectId,
          markdownPicker.pendingMarkdownUri,
        );
      }

      if (
        initialMarkdownUrl &&
        initialMarkdownUrl !== markdownUrl
      ) {
        await deleteProjectMarkdownByUrlSafe(initialMarkdownUrl);
      }

      const visibilityPayload = buildContentVisibilityPayload(
        projectForm.track!,
        audienceForm.toPayload(),
      );
      const payload = {
        title: projectForm.title,
        subtitle: projectForm.subtitle,
        description: projectForm.description,
        imageUris,
        markdownUrl,
        isPublished: projectForm.isPublished,
        ...visibilityPayload,
      };

      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
      } else {
        await createProject(payload, { projectId });
      }

      await deleteProjectImagesByUrlsSafe(gallery.removedRemoteUrls);
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setUploadingMedia(false);
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
              await deleteProjectImagesByUrlsSafe(project.imageUris);
              if (project.imageUri && !project.imageUris.includes(project.imageUri)) {
                await deleteProjectImageByUrlSafe(project.imageUri);
              }
              await deleteProjectMarkdownByUrlSafe(project.markdownUrl);
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

  const formBusy = savingProject || uploadingMedia;
  const savingLabel = uploadingMedia ? 'Uploading media…' : 'Save project';

  const listHeader = (
    <AdminListSectionHeader
      title="Projects"
      onAdd={openCreateEditor}
      onSettingsPress={openSectionEditor}
      settingsAccessibilityLabel="Edit screen headings"
    />
  );

  const renderProject = useCallback(
    ({ item: project, index }: { item: Project; index: number }) => {
      const imageCount = project.imageUris.length;
      const imageLabel =
        imageCount === 0
          ? 'No images'
          : `${imageCount} image${imageCount === 1 ? '' : 's'}`;
      const markdownLabel = project.markdownUrl.trim()
        ? 'Markdown page'
        : 'No markdown';
      return (
        <AdminListRow
          title={project.title}
          subtitle={
            project.subtitle
              ? `${project.subtitle} · ${imageLabel} · ${markdownLabel} · ${formatContentVisibilitySummary(project.track, project, schools)}`
              : `${imageLabel} · ${markdownLabel} · ${formatContentVisibilitySummary(project.track, project, schools)}`
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
      );
    },
    [handleMove, openEditEditor, projects.length, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Projects"
        data={projects}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderProject}
        listHeader={listHeader}
        emptyMessage="No projects yet. Add one for students to see in To Do."
      />

      <AdminEntityForm
        visible={sectionEditorVisible}
        title="Screen headings"
        saveLabel="Save headings"
        saving={savingSection}
        error={sectionFormError}
        onClose={closeSectionEditor}
        onSave={handleSaveSection}>
        <AdminFormField
          label="Screen title"
          value={sectionTitle}
          onChangeText={value => {
            setSectionFormError(null);
            setSectionTitle(value);
          }}
          placeholder="Projects"
        />
        <AdminFormField
          label="Screen subtitle"
          value={sectionSubtitle}
          onChangeText={setSectionSubtitle}
          placeholder="Hands-on builds and guided project work"
        />
      </AdminEntityForm>

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
          placeholder="Short summary (optional)"
          multiline
        />

        <Text style={adminStyles.fieldLabel}>
          Project images (up to {PROJECT_MAX_IMAGES})
        </Text>
        <TactileButton
          variant="ghost"
          style={adminStyles.pickImageButton}
          onPress={gallery.handlePickImages}
          disabled={formBusy || !gallery.canAddMore}
          accessibilityLabel="Choose project images from gallery">
          <ImagePlus size={18} color={colors.primary} strokeWidth={2} />
          <Text style={adminStyles.pickImageText}>
            {gallery.canAddMore
              ? 'Add from gallery'
              : `Maximum ${PROJECT_MAX_IMAGES} images`}
          </Text>
        </TactileButton>
        <Text style={adminStyles.pdfHint}>{gallery.statusLabel}</Text>
        {gallery.items.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={adminStyles.galleryScroll}
            contentContainerStyle={adminStyles.galleryScrollContent}>
            {gallery.items.map(item => {
              const uri = item.kind === 'remote' ? item.url : item.uri;
              return (
                <View key={item.id} style={adminStyles.galleryThumbWrap}>
                  <Image
                    source={{ uri }}
                    style={adminStyles.galleryThumb}
                  />
                  <TouchableOpacity
                    style={adminStyles.galleryRemoveButton}
                    onPress={() => gallery.removeImage(item.id)}
                    disabled={formBusy}
                    accessibilityRole="button"
                    accessibilityLabel="Remove image">
                    <X size={14} color="#fff" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ) : null}

        <Text style={adminStyles.fieldLabel}>Markdown page (optional)</Text>
        <TactileButton
          variant="ghost"
          style={adminStyles.pdfPicker}
          onPress={markdownPicker.handlePickMarkdown}
          disabled={formBusy || markdownPicker.pickingMarkdown}
          accessibilityLabel="Choose Markdown file">
          <FileUp size={20} color={colors.primary} strokeWidth={2} />
          <Text style={adminStyles.pdfPickerText}>
            {markdownPicker.pickingMarkdown
              ? 'Opening files…'
              : 'Attach .md file'}
          </Text>
        </TactileButton>
        <Text style={adminStyles.pdfHint}>{markdownPicker.markdownStatusLabel}</Text>
        {markdownPicker.hasMarkdown ? (
          <TouchableOpacity
            onPress={markdownPicker.clearMarkdown}
            disabled={formBusy}
            accessibilityRole="button"
            accessibilityLabel="Remove Markdown file">
            <Text style={adminStyles.galleryClearText}>Remove Markdown</Text>
          </TouchableOpacity>
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
