import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react-native';

import AdminEntityForm from '../../../components/Admin/AdminEntityForm';
import BackButton from '../../../components/BackButton';
import AdminFormField from '../../../components/Admin/AdminFormField';
import AdminIconButton from '../../../components/Admin/AdminIconButton';
import AdminListLayout from '../../../components/Admin/AdminListLayout';
import AdminListRow from '../../../components/Admin/AdminListRow';
import AdminListSectionHeader from '../../../components/Admin/AdminListSectionHeader';
import AdminPublishedSwitch from '../../../components/Admin/AdminPublishedSwitch';
import AdminContentVisibilityFields from '../../../components/Admin/AdminContentVisibilityFields';
import { adminStyles } from '../../../components/Admin/adminStyles';
import TactileButton from '../../../components/ui/TactileButton';
import {
  buttonVariants,
  colors,
  glassBorder,
  spacing,
} from '../../../constants/theme';
import { useExams } from '../../hooks/useExams';
import { useSchools } from '../../hooks/useSchools';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
  validateContentVisibilityTrack,
} from '../../../utils/admin/contentVisibility';
import {
  createExam,
  deleteExam,
  moveExam,
  updateExam,
} from '../../../services/firebase/examsService';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import type { Exam, ExamQuestion } from '../../../store/content/types/exams.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type ExamFormState = {
  title: string;
  description: string;
  timerMinutes: string;
  track: CourseTrack | null;
  isPublished: boolean;
  questions: ExamQuestion[];
};

type QuestionDraft = {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctChoiceIndex: number;
};

type ExamFieldErrors = {
  title?: boolean;
  timerMinutes?: boolean;
  questions?: boolean;
  track?: boolean;
  audience?: boolean;
};

type QuestionFieldErrors = {
  prompt?: boolean;
  choices?: [boolean, boolean, boolean, boolean];
};

const EMPTY_EXAM_FORM: ExamFormState = {
  title: '',
  description: '',
  timerMinutes: '0',
  track: null,
  isPublished: true,
  questions: [],
};

const EMPTY_QUESTION_DRAFT: QuestionDraft = {
  id: '',
  prompt: '',
  choices: ['', '', '', ''],
  correctChoiceIndex: 0,
};

const EMPTY_EXAM_FIELD_ERRORS: ExamFieldErrors = {};
const EMPTY_QUESTION_FIELD_ERRORS: QuestionFieldErrors = {};

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function toTimerSeconds(timerMinutes: string): number {
  const parsed = Number(timerMinutes);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.trunc(parsed)) * 60;
}

function toTimerMinutes(timerSeconds: number): string {
  const minutes =
    typeof timerSeconds === 'number' && Number.isFinite(timerSeconds)
      ? Math.max(0, Math.trunc(timerSeconds / 60))
      : 0;
  return String(minutes);
}

function fromQuestion(question: ExamQuestion): QuestionDraft {
  return {
    id: question.id,
    prompt: question.prompt ?? '',
    choices: [
      question.choices?.[0]?.text ?? '',
      question.choices?.[1]?.text ?? '',
      question.choices?.[2]?.text ?? '',
      question.choices?.[3]?.text ?? '',
    ],
    correctChoiceIndex:
      typeof question.correctChoiceIndex === 'number' &&
      question.correctChoiceIndex >= 0 &&
      question.correctChoiceIndex <= 3
        ? question.correctChoiceIndex
        : 0,
  };
}

function toQuestion(draft: QuestionDraft): ExamQuestion {
  return {
    id: draft.id,
    prompt: draft.prompt.trim(),
    choices: [
      { id: `${draft.id}_a`, text: draft.choices[0].trim() },
      { id: `${draft.id}_b`, text: draft.choices[1].trim() },
      { id: `${draft.id}_c`, text: draft.choices[2].trim() },
      { id: `${draft.id}_d`, text: draft.choices[3].trim() },
    ],
    correctChoiceIndex: draft.correctChoiceIndex,
  };
}

function ManageExams() {
  const { exams, loading } = useExams({ includeUnpublished: true });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { resetAudience } = audienceForm;
  const { reorderingId, handleMove } = useAdminReorder(exams, moveExam);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamFormState>(EMPTY_EXAM_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<ExamFieldErrors>(EMPTY_EXAM_FIELD_ERRORS);
  const [saving, setSaving] = useState(false);

  const [questionEditorVisible, setQuestionEditorVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] =
    useState<QuestionDraft>(EMPTY_QUESTION_DRAFT);
  const [questionFieldErrors, setQuestionFieldErrors] =
    useState<QuestionFieldErrors>(EMPTY_QUESTION_FIELD_ERRORS);

  const clearExamErrors = () => {
    setFormError(null);
    setFieldErrors(EMPTY_EXAM_FIELD_ERRORS);
  };

  const clearQuestionErrors = () => {
    setFormError(null);
    setQuestionFieldErrors(EMPTY_QUESTION_FIELD_ERRORS);
  };

  const questionCountLabel = useMemo(() => {
    const count = form.questions.length;
    return count === 1 ? '1 question' : `${count} questions`;
  }, [form.questions.length]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_EXAM_FORM);
    audienceForm.resetAudience();
    clearExamErrors();
    clearQuestionErrors();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (exam: Exam) => {
      setEditingId(exam.id);
      setForm({
        title: exam.title,
        description: exam.description,
        timerMinutes: toTimerMinutes(exam.timerSeconds),
        track: exam.track,
        isPublished: exam.isPublished,
        questions: exam.questions ?? [],
      });
      resetAudience({
        audience: exam.audience,
        schoolIds: exam.schoolIds,
        schoolGradeIds: exam.schoolGradeIds,
      });
      setFormError(null);
      setFieldErrors(EMPTY_EXAM_FIELD_ERRORS);
      setQuestionFieldErrors(EMPTY_QUESTION_FIELD_ERRORS);
      setEditorVisible(true);
    },
    [resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_EXAM_FORM);
    audienceForm.resetAudience();
    clearExamErrors();
    closeQuestionEditor();
  };

  const openCreateQuestionEditor = () => {
    const id = newId('q');
    setEditingQuestionId(null);
    setQuestionDraft({ ...EMPTY_QUESTION_DRAFT, id });
    clearQuestionErrors();
    clearExamErrors();
    setQuestionEditorVisible(true);
  };

  const openEditQuestionEditor = (question: ExamQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionDraft(fromQuestion(question));
    clearQuestionErrors();
    clearExamErrors();
    setQuestionEditorVisible(true);
  };

  const closeQuestionEditor = () => {
    setQuestionEditorVisible(false);
    setEditingQuestionId(null);
    setQuestionDraft(EMPTY_QUESTION_DRAFT);
    clearQuestionErrors();
  };

  const upsertQuestion = () => {
    const nextErrors: QuestionFieldErrors = {};
    const messages: string[] = [];

    if (!questionDraft.prompt.trim()) {
      nextErrors.prompt = true;
      messages.push(appAlertCopy.admin.questionRequired);
    }

    const choiceErrors: [boolean, boolean, boolean, boolean] = [
      !questionDraft.choices[0].trim(),
      !questionDraft.choices[1].trim(),
      !questionDraft.choices[2].trim(),
      !questionDraft.choices[3].trim(),
    ];
    if (choiceErrors.some(Boolean)) {
      nextErrors.choices = choiceErrors;
      messages.push(appAlertCopy.admin.allChoicesRequired(4, 'choices'));
    }

    if (messages.length > 0) {
      setQuestionFieldErrors(nextErrors);
      setFormError(messages[0] ?? 'Fill in the highlighted fields.');
      return;
    }

    const nextQuestion = toQuestion(questionDraft);
    setForm(prev => {
      const current = prev.questions ?? [];
      const index = current.findIndex(item => item.id === nextQuestion.id);
      if (index < 0) {
        return { ...prev, questions: [...current, nextQuestion] };
      }
      const updated = [...current];
      updated[index] = nextQuestion;
      return { ...prev, questions: updated };
    });
    setFieldErrors(prev => ({ ...prev, questions: undefined }));
    closeQuestionEditor();
  };

  const confirmDeleteQuestion = (question: ExamQuestion) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('question'),
      appAlertCopy.admin.deleteQuestionConfirm('exam'),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: () => {
            setForm(prev => ({
              ...prev,
              questions: (prev.questions ?? []).filter(q => q.id !== question.id),
            }));
          },
        },
      ],
    );
  };

  const validateExam = (): {
    message: string | null;
    fields: ExamFieldErrors;
  } => {
    const fields: ExamFieldErrors = {};
    const messages: string[] = [];

    if (!form.title.trim()) {
      fields.title = true;
      messages.push('Enter an exam title.');
    }

    const timerSeconds = toTimerSeconds(form.timerMinutes);
    if (timerSeconds <= 0) {
      fields.timerMinutes = true;
      messages.push('Enter a timer (minutes) greater than 0.');
    }

    if (form.questions.length === 0) {
      fields.questions = true;
      messages.push('Add at least 1 question.');
    }

    const visibilityError = validateContentVisibility(
      form.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      if (validateContentVisibilityTrack(form.track)) {
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

  const handleSaveExam = async () => {
    const { message: validationError, fields } = validateExam();
    if (validationError) {
      setFieldErrors(fields);
      setFormError(validationError);
      return;
    }

    const visibilityPayload = buildContentVisibilityPayload(
      form.track!,
      audienceForm.toPayload(),
    );
    const payload = {
      title: form.title,
      description: form.description,
      timerSeconds: toTimerSeconds(form.timerMinutes),
      questions: form.questions,
      isPublished: form.isPublished,
      ...visibilityPayload,
    };

    setSaving(true);
    clearExamErrors();
    try {
      if (editingId) {
        await updateExam(editingId, payload);
      } else {
        await createExam(payload);
      }
      closeEditor();
    } catch (error) {
      setFormError(toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteExam = (exam: Exam) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('exam'),
      appAlertCopy.admin.deleteConfirm('exam', exam.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExam(exam.id);
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
      <Text style={adminStyles.blockTitle}>Exams</Text>
      <Text style={styles.hintText}>
        Create timed exams with multiple-choice questions. Only published exams are
        visible to students.
      </Text>
      <AdminListSectionHeader title="All exams" onAdd={openCreateEditor} />
    </>
  );

  const renderExam = useCallback(
    ({ item: exam, index }: { item: Exam; index: number }) => (
      <AdminListRow
        title={exam.title}
        subtitle={`${exam.questions?.length ?? 0} questions • ${toTimerMinutes(
          exam.timerSeconds,
        )} min`}
        statusLine={`${
          !exam.questions?.length
            ? 'Add questions'
            : exam.isPublished
              ? 'Published'
              : 'Ready to publish'
        } · ${formatContentVisibilitySummary(exam.track, exam, schools)}`}
        isPublished={exam.isPublished}
        index={index}
        itemCount={exams.length}
        reordering={reorderingId === exam.id}
        onMoveUp={() => handleMove(exam.id, 'up')}
        onMoveDown={() => handleMove(exam.id, 'down')}
        onEdit={() => openEditEditor(exam)}
        onDelete={() => confirmDeleteExam(exam)}
      />
    ),
    [exams.length, handleMove, openEditEditor, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: Exam) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Exams"
        subtitle="Create, edit, and publish timed exams"
        data={exams}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderExam}
        listHeader={listHeader}
        emptyMessage="No exams yet. Create your first timed exam."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={
          questionEditorVisible
            ? editingQuestionId
              ? 'Edit question'
              : 'New question'
            : editingId
              ? 'Edit exam'
              : 'New exam'
        }
        saveLabel={
          questionEditorVisible
            ? editingQuestionId
              ? 'Save question'
              : 'Add question'
            : 'Save exam'
        }
        saving={questionEditorVisible ? false : saving}
        error={formError}
        onClose={closeEditor}
        onSave={questionEditorVisible ? upsertQuestion : handleSaveExam}>
        {questionEditorVisible ? (
          <>
            <BackButton
              label="← Back to exam"
              onPress={closeQuestionEditor}
              withSpacingBelow
            />

            <AdminFormField
              label="Question"
              value={questionDraft.prompt}
              onChangeText={prompt => {
                setQuestionDraft(prev => ({ ...prev, prompt }));
                setQuestionFieldErrors(prev => ({ ...prev, prompt: undefined }));
                setFormError(null);
              }}
              placeholder="What is the SI unit of force?"
              multiline
              error={questionFieldErrors.prompt}
            />

            <Text style={styles.correctHeading}>Choices (tap to mark correct)</Text>
            <View style={styles.choiceList}>
              {questionDraft.choices.map((choice, idx) => {
                const selected = questionDraft.correctChoiceIndex === idx;
                const Icon = selected ? CheckCircle2 : Circle;
                const choiceError = questionFieldErrors.choices?.[idx] === true;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.choiceRow,
                      selected && styles.choiceRowSelected,
                      choiceError && styles.choiceRowError,
                    ]}
                    activeOpacity={0.85}
                    onPress={() =>
                      setQuestionDraft(prev => ({
                        ...prev,
                        correctChoiceIndex: idx,
                      }))
                    }>
                    <View style={styles.choiceIcon}>
                      <Icon
                        size={18}
                        color={selected ? colors.primary : colors.textMuted}
                        strokeWidth={2.5}
                      />
                    </View>
                    <View style={styles.choiceField}>
                      <AdminFormField
                        label={`Choice ${String.fromCharCode(65 + idx)}`}
                        value={choice}
                        onChangeText={text => {
                          setQuestionDraft(prev => {
                            const next = [
                              ...prev.choices,
                            ] as QuestionDraft['choices'];
                            next[idx] = text;
                            return { ...prev, choices: next };
                          });
                          setQuestionFieldErrors(prev => {
                            if (!prev.choices) {
                              return prev;
                            }
                            const nextChoices = [...prev.choices] as [
                              boolean,
                              boolean,
                              boolean,
                              boolean,
                            ];
                            nextChoices[idx] = false;
                            return {
                              ...prev,
                              choices: nextChoices.some(Boolean)
                                ? nextChoices
                                : undefined,
                            };
                          });
                          setFormError(null);
                        }}
                        placeholder={idx === 0 ? 'Newton (N)' : undefined}
                        error={choiceError}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <AdminFormField
              label="Exam title"
              value={form.title}
              onChangeText={title => {
                setForm(prev => ({ ...prev, title }));
                setFieldErrors(prev => ({ ...prev, title: undefined }));
                setFormError(null);
              }}
              placeholder="Physics — Unit test 1"
              error={fieldErrors.title}
            />
            <AdminFormField
              label="Description (optional)"
              value={form.description}
              onChangeText={description =>
                setForm(prev => ({ ...prev, description }))
              }
              placeholder="Shown before the exam starts"
              multiline
            />
            <AdminFormField
              label="Timer (minutes)"
              value={form.timerMinutes}
              onChangeText={timerMinutes => {
                setForm(prev => ({ ...prev, timerMinutes }));
                setFieldErrors(prev => ({ ...prev, timerMinutes: undefined }));
                setFormError(null);
              }}
              placeholder="30"
              keyboardType="number-pad"
              error={fieldErrors.timerMinutes}
            />

            <View
              style={[
                styles.questionsHeader,
                fieldErrors.questions ? styles.questionsSectionError : null,
              ]}>
              <Text style={styles.questionsTitle}>Questions</Text>
              <TactileButton
                style={styles.addQuestionButton}
                onPress={openCreateQuestionEditor}
                accessibilityLabel="Add question">
                <Plus
                  size={16}
                  color={buttonVariants.primary.text}
                  strokeWidth={2.5}
                />
                <Text style={styles.addQuestionText}>Add</Text>
              </TactileButton>
            </View>
            <Text
              style={[
                styles.questionsSubtitle,
                fieldErrors.questions ? styles.questionsErrorHint : null,
              ]}>
              {fieldErrors.questions
                ? 'Add at least 1 question.'
                : questionCountLabel}
            </Text>

            {form.questions.length === 0 ? (
              <Text
                style={[
                  styles.emptyQuestions,
                  fieldErrors.questions ? styles.emptyQuestionsError : null,
                ]}>
                No questions yet.
              </Text>
            ) : (
              <View style={styles.questionList}>
                {form.questions.map((question, index) => (
                  <View key={question.id} style={styles.questionCard}>
                    <View style={styles.questionMeta}>
                      <Text style={styles.questionIndex}>Q{index + 1}</Text>
                      <Text style={styles.questionPrompt} numberOfLines={3}>
                        {question.prompt}
                      </Text>
                      <Text style={styles.questionStatus}>
                        Correct:{' '}
                        {String.fromCharCode(
                          65 + (question.correctChoiceIndex ?? 0),
                        )}
                      </Text>
                    </View>
                    <View style={styles.questionActions}>
                      <AdminIconButton
                        icon={Pencil}
                        onPress={() => openEditQuestionEditor(question)}
                      />
                      <AdminIconButton
                        icon={Trash2}
                        danger
                        onPress={() => confirmDeleteQuestion(question)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            <AdminPublishedSwitch
              label="Published for students"
              value={form.isPublished}
              onValueChange={isPublished =>
                setForm(prev => ({ ...prev, isPublished }))
              }
            />
            <AdminContentVisibilityFields
              track={form.track}
              onTrackChange={track => {
                setForm(prev => ({ ...prev, track }));
                setFieldErrors(prev => ({
                  ...prev,
                  track: undefined,
                  audience: undefined,
                }));
                setFormError(null);
              }}
              onProfessionalsTrackSelected={() => audienceForm.resetAudience()}
              audience={audienceForm.audience}
              selectedSchoolIds={audienceForm.schoolIds}
              schoolGradeIds={audienceForm.schoolGradeIds}
              schools={schools}
              schoolsLoading={schoolsLoading}
              schoolsError={schoolsError}
              onAudienceChange={next => {
                audienceForm.setAudienceMode(next);
                setFieldErrors(prev => ({ ...prev, audience: undefined }));
                setFormError(null);
              }}
              onToggleSchool={schoolId => {
                audienceForm.toggleSchoolId(schoolId);
                setFieldErrors(prev => ({ ...prev, audience: undefined }));
                setFormError(null);
              }}
              onSchoolGradeModeChange={(schoolId, mode) => {
                audienceForm.setSchoolGradeMode(schoolId, mode);
                setFieldErrors(prev => ({ ...prev, audience: undefined }));
                setFormError(null);
              }}
              onToggleSchoolGrade={(schoolId, gradeId) => {
                audienceForm.toggleSchoolGrade(schoolId, gradeId);
                setFieldErrors(prev => ({ ...prev, audience: undefined }));
                setFormError(null);
              }}
              getSchoolGradeMode={audienceForm.getSchoolGradeMode}
              trackHint="Required. Choose whether this exam is visible to kids or professionals."
              trackError={fieldErrors.track}
              audienceError={fieldErrors.audience}
            />
          </>
        )}
      </AdminEntityForm>
    </>
  );
}

const styles = StyleSheet.create({
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sectionGap,
  },
  questionsHeader: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionsSectionError: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addQuestionButton: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.buttonRadius,
  },
  addQuestionText: {
    color: buttonVariants.primary.text,
    fontWeight: '700',
    fontSize: 13,
  },
  questionsSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  questionsErrorHint: {
    color: colors.danger,
    fontWeight: '600',
  },
  emptyQuestions: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  emptyQuestionsError: {
    color: colors.danger,
    fontWeight: '600',
  },
  questionList: {
    gap: 10,
    marginBottom: 12,
  },
  questionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.inputRadius,
    padding: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    ...glassBorder,
  },
  questionMeta: {
    flex: 1,
  },
  questionIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  questionPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  questionStatus: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  correctHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  choiceList: {
    gap: 10,
  },
  choiceRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    ...glassBorder,
  },
  choiceRowSelected: {
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  choiceRowError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  choiceIcon: {
    paddingTop: 22,
    paddingLeft: 2,
  },
  choiceField: {
    flex: 1,
  },
});

export default ManageExams;

