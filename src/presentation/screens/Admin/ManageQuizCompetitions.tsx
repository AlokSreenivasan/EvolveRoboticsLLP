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
import { colors, glassBorder, spacing } from '../../../constants/theme';
import { useQuizCompetitions } from '../../hooks/useQuizCompetitions';
import { useSchools } from '../../hooks/useSchools';
import { useAdminSchoolAudienceForm } from '../../hooks/admin/useAdminSchoolAudienceForm';
import { useAdminReorder } from '../../hooks/admin/useAdminReorder';
import {
  buildContentVisibilityPayload,
  formatContentVisibilitySummary,
  validateContentVisibility,
} from '../../../utils/admin/contentVisibility';
import {
  createQuizCompetition,
  deleteQuizCompetition,
  moveQuizCompetition,
  updateQuizCompetition,
} from '../../../services/firebase/quizCompetitionsService';
import type { QuizCompetition } from '../../../store/content/types/quizCompetitions.types';
import type { ExamQuestion } from '../../../store/content/types/exams.types';
import type { CourseTrack } from '../../../store/content/types/courses.types';
import { toAdminWriteErrorMessage } from '../../../utils/admin/adminWriteErrorMessage';
import { appAlert, appAlertButtons, appAlertCopy } from '../../../utils/alert/appAlert';

type QuizFormState = {
  title: string;
  description: string;
  timerMinutes: string;
  xpValue: string;
  allowRetry: boolean;
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

const EMPTY_QUIZ_FORM: QuizFormState = {
  title: '',
  description: '',
  timerMinutes: '0',
  xpValue: '20',
  allowRetry: false,
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

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function toXpValue(xpValue: string): number {
  const parsed = Number(xpValue);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.trunc(parsed));
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

function ManageQuizCompetitions() {
  const { quizzes, loading } = useQuizCompetitions({ includeUnpublished: true });
  const { schools, loading: schoolsLoading, error: schoolsError } = useSchools();
  const audienceForm = useAdminSchoolAudienceForm();
  const { resetAudience } = audienceForm;
  const { reorderingId, handleMove } = useAdminReorder(quizzes, moveQuizCompetition);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM);
  const [saving, setSaving] = useState(false);

  const [questionEditorVisible, setQuestionEditorVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] =
    useState<QuestionDraft>(EMPTY_QUESTION_DRAFT);

  const questionCountLabel = useMemo(() => {
    const count = form.questions.length;
    return count === 1 ? '1 question' : `${count} questions`;
  }, [form.questions.length]);

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_QUIZ_FORM);
    audienceForm.resetAudience();
    setEditorVisible(true);
  };

  const openEditEditor = useCallback(
    (quiz: QuizCompetition) => {
      setEditingId(quiz.id);
      setForm({
        title: quiz.title,
        description: quiz.description,
        timerMinutes: toTimerMinutes(quiz.timerSeconds),
        xpValue: String(quiz.xpValue),
        allowRetry: quiz.allowRetry,
        track: quiz.track,
        isPublished: quiz.isPublished,
        questions: quiz.questions ?? [],
      });
      resetAudience({
        audience: quiz.audience,
        schoolIds: quiz.schoolIds,
        schoolGradeIds: quiz.schoolGradeIds,
      });
      setEditorVisible(true);
    },
    [resetAudience],
  );

  const closeEditor = () => {
    setEditorVisible(false);
    setEditingId(null);
    setForm(EMPTY_QUIZ_FORM);
    audienceForm.resetAudience();
    closeQuestionEditor();
  };

  const openCreateQuestionEditor = () => {
    const id = newId('q');
    setEditingQuestionId(null);
    setQuestionDraft({ ...EMPTY_QUESTION_DRAFT, id });
    setQuestionEditorVisible(true);
  };

  const openEditQuestionEditor = (question: ExamQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionDraft(fromQuestion(question));
    setQuestionEditorVisible(true);
  };

  const closeQuestionEditor = () => {
    setQuestionEditorVisible(false);
    setEditingQuestionId(null);
    setQuestionDraft(EMPTY_QUESTION_DRAFT);
  };

  const upsertQuestion = () => {
    if (!questionDraft.prompt.trim()) {
      appAlert(
        appAlertCopy.admin.questionRequiredTitle,
        appAlertCopy.admin.questionRequired,
      );
      return;
    }

    const missingChoiceIndex = questionDraft.choices.findIndex(
      choice => !choice.trim(),
    );
    if (missingChoiceIndex >= 0) {
      appAlert(
        appAlertCopy.admin.choicesRequiredTitle,
        appAlertCopy.admin.allChoicesRequired(4, 'options'),
      );
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
    closeQuestionEditor();
  };

  const confirmDeleteQuestion = (question: ExamQuestion) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('question'),
      appAlertCopy.admin.deleteQuestionConfirm('quiz'),
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

  const validateQuiz = (): string | null => {
    if (!form.title.trim()) {
      return 'Enter a quiz title.';
    }

    const timerSeconds = toTimerSeconds(form.timerMinutes);
    if (timerSeconds <= 0) {
      return 'Enter a timer (minutes) greater than 0.';
    }

    const xpValue = toXpValue(form.xpValue);
    if (xpValue <= 0) {
      return 'Enter an XP value greater than 0.';
    }

    if (form.questions.length === 0) {
      return 'Add at least 1 question.';
    }

    return null;
  };

  const handleSaveQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      appAlert(appAlertCopy.admin.cannotSaveTitle('quiz'), validationError);
      return;
    }

    const visibilityError = validateContentVisibility(
      form.track,
      audienceForm.validate,
    );
    if (visibilityError) {
      appAlert(appAlertCopy.admin.visibilityRequiredTitle, visibilityError);
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
      xpValue: toXpValue(form.xpValue),
      allowRetry: form.allowRetry,
      questions: form.questions,
      isPublished: form.isPublished,
      ...visibilityPayload,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateQuizCompetition(editingId, payload);
      } else {
        await createQuizCompetition(payload);
      }
      closeEditor();
    } catch (error) {
      appAlert(appAlertCopy.admin.saveFailedTitle, toAdminWriteErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteQuiz = (quiz: QuizCompetition) => {
    appAlert(
      appAlertCopy.admin.deleteTitle('quiz'),
      appAlertCopy.admin.deleteConfirm('quiz', quiz.title),
      [
        { text: appAlertButtons.cancel, style: 'cancel' },
        {
          text: appAlertButtons.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuizCompetition(quiz.id);
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
      <Text style={adminStyles.blockTitle}>Quiz competition</Text>
      <Text style={styles.hintText}>
        Create timed quizzes with multiple questions. Mark one correct option per
        question and set visibility the same way as Lessons.
      </Text>
      <AdminListSectionHeader title="All quizzes" onAdd={openCreateEditor} />
    </>
  );

  const renderQuiz = useCallback(
    ({ item: quiz, index }: { item: QuizCompetition; index: number }) => (
      <AdminListRow
        title={quiz.title}
        subtitle={`${quiz.questions?.length ?? 0} questions • ${toTimerMinutes(
          quiz.timerSeconds,
        )} min • ${quiz.xpValue} XP${quiz.allowRetry ? ' • Retry on' : ''}`}
        statusLine={`${
          quiz.questions?.length ? 'Ready to publish' : 'Add questions'
        } · ${formatContentVisibilitySummary(quiz.track, quiz, schools)}`}
        isPublished={quiz.isPublished}
        index={index}
        itemCount={quizzes.length}
        reordering={reorderingId === quiz.id}
        onMoveUp={() => handleMove(quiz.id, 'up')}
        onMoveDown={() => handleMove(quiz.id, 'down')}
        onEdit={() => openEditEditor(quiz)}
        onDelete={() => confirmDeleteQuiz(quiz)}
      />
    ),
    [handleMove, openEditEditor, quizzes.length, reorderingId, schools],
  );

  const keyExtractor = useCallback((item: QuizCompetition) => item.id, []);

  return (
    <>
      <AdminListLayout
        title="Quiz competition"
        subtitle="Create, edit, and publish competition quizzes"
        data={quizzes}
        loading={loading}
        reorderingId={reorderingId}
        keyExtractor={keyExtractor}
        renderItem={renderQuiz}
        listHeader={listHeader}
        emptyMessage="No quizzes yet. Create your first competition quiz."
      />

      <AdminEntityForm
        visible={editorVisible}
        title={
          questionEditorVisible
            ? editingQuestionId
              ? 'Edit question'
              : 'New question'
            : editingId
              ? 'Edit quiz'
              : 'New quiz'
        }
        saveLabel={
          questionEditorVisible
            ? editingQuestionId
              ? 'Save question'
              : 'Add question'
            : 'Save quiz'
        }
        saving={questionEditorVisible ? false : saving}
        onClose={closeEditor}
        onSave={questionEditorVisible ? upsertQuestion : handleSaveQuiz}>
        {questionEditorVisible ? (
          <>
            <BackButton
              label="← Back to quiz"
              onPress={closeQuestionEditor}
              withSpacingBelow
            />

            <AdminFormField
              label="Question"
              value={questionDraft.prompt}
              onChangeText={prompt =>
                setQuestionDraft(prev => ({ ...prev, prompt }))
              }
              placeholder="Which sensor detects distance using sound waves?"
              multiline
            />

            <Text style={styles.correctHeading}>Options (tap to mark correct)</Text>
            <View style={styles.choiceList}>
              {questionDraft.choices.map((choice, idx) => {
                const selected = questionDraft.correctChoiceIndex === idx;
                const Icon = selected ? CheckCircle2 : Circle;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.choiceRow,
                      selected && styles.choiceRowSelected,
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
                        label={`Option ${String.fromCharCode(65 + idx)}`}
                        value={choice}
                        onChangeText={text =>
                          setQuestionDraft(prev => {
                            const next = [
                              ...prev.choices,
                            ] as QuestionDraft['choices'];
                            next[idx] = text;
                            return { ...prev, choices: next };
                          })
                        }
                        placeholder={idx === 0 ? 'Ultrasonic sensor' : undefined}
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
              label="Quiz title"
              value={form.title}
              onChangeText={title => setForm(prev => ({ ...prev, title }))}
              placeholder="Robotics basics — round 1"
            />
            <AdminFormField
              label="Description (optional)"
              value={form.description}
              onChangeText={description =>
                setForm(prev => ({ ...prev, description }))
              }
              placeholder="Shown before the quiz starts"
              multiline
            />
            <AdminFormField
              label="Timer (minutes)"
              value={form.timerMinutes}
              onChangeText={timerMinutes =>
                setForm(prev => ({ ...prev, timerMinutes }))
              }
              placeholder="15"
              keyboardType="number-pad"
            />
            <AdminFormField
              label="XP reward"
              value={form.xpValue}
              onChangeText={xpValue => setForm(prev => ({ ...prev, xpValue }))}
              placeholder="20"
              keyboardType="number-pad"
            />
            <AdminPublishedSwitch
              label="Allow retry after completion"
              value={form.allowRetry}
              onValueChange={allowRetry =>
                setForm(prev => ({ ...prev, allowRetry }))
              }
            />

            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>Questions</Text>
              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={openCreateQuestionEditor}
                accessibilityRole="button"
                accessibilityLabel="Add question">
                <Plus size={16} color={colors.surface} strokeWidth={2.5} />
                <Text style={styles.addQuestionText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.questionsSubtitle}>{questionCountLabel}</Text>

            {form.questions.length === 0 ? (
              <Text style={styles.emptyQuestions}>No questions yet.</Text>
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
              trackHint="Required. Choose whether this quiz is visible to kids or professionals."
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
  questionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.buttonRadius,
  },
  addQuestionText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  questionsSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  emptyQuestions: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
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
  choiceIcon: {
    paddingTop: 22,
    paddingLeft: 2,
  },
  choiceField: {
    flex: 1,
  },
});

export default ManageQuizCompetitions;
