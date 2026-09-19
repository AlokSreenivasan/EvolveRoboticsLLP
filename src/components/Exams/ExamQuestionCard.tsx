import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';

import {
  cardShadow,
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
  typography,
} from '../../constants/theme';
import type { ExamQuestion } from '../../store/content/types/exams.types';

type ExamQuestionCardProps = {
  question: ExamQuestion;
  index: number;
  selectedChoiceIndex?: number;
  onSelectChoice: (choiceIndex: number) => void;
  accentColor?: string;
};

function ExamQuestionCard({
  question,
  index,
  selectedChoiceIndex,
  onSelectChoice,
  accentColor = colors.primary,
}: ExamQuestionCardProps) {
  const prompt = question.prompt?.trim() ?? '';
  const promptImage = question.imageUrl?.trim() ?? '';

  return (
    <View style={styles.questionCard}>
      <Text style={[styles.questionIndex, { color: accentColor }]}>
        Question {index + 1}
      </Text>
      {prompt ? <Text style={styles.questionPrompt}>{prompt}</Text> : null}
      {promptImage ? (
        <Image
          source={{ uri: promptImage }}
          style={styles.questionImage}
          resizeMode="contain"
          accessibilityLabel={`Question ${index + 1} image`}
        />
      ) : null}
      <View style={styles.choices}>
        {question.choices.map((choice, choiceIndex) => {
          const selected = selectedChoiceIndex === choiceIndex;
          const Icon = selected ? CheckCircle2 : Circle;
          const letter = String.fromCharCode(65 + choiceIndex);
          const choiceText = choice.text?.trim() ?? '';
          const choiceImage = choice.imageUrl?.trim() ?? '';

          return (
            <TouchableOpacity
              key={choice.id || `${question.id}_${choiceIndex}`}
              style={[styles.choiceRow, selected && styles.choiceRowSelected]}
              activeOpacity={0.85}
              onPress={() => onSelectChoice(choiceIndex)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select option ${letter}`}>
              <Icon
                size={18}
                color={selected ? colors.primary : colors.textMuted}
                strokeWidth={2.5}
              />
              <View style={styles.choiceBody}>
                <Text style={styles.choiceText}>
                  {choiceText ? `${letter}. ${choiceText}` : `${letter}.`}
                </Text>
                {choiceImage ? (
                  <Image
                    source={{ uri: choiceImage }}
                    style={styles.choiceImage}
                    resizeMode="contain"
                    accessibilityLabel={`Option ${letter} image`}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    padding: 16,
    borderRadius: spacing.cardRadiusLg,
    backgroundColor: colors.surface,
    marginBottom: 14,
    ...glassBorder,
    ...cardShadow,
  },
  questionIndex: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  questionPrompt: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 12,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: spacing.inputRadius,
    marginBottom: 14,
    backgroundColor: colors.primaryLight,
  },
  choices: {
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: spacing.inputRadius,
    backgroundColor: colors.background,
    ...glassBorder,
    ...cardShadowLight,
  },
  choiceRowSelected: {
    borderColor: colors.primaryMuted,
    backgroundColor: colors.primaryLight,
  },
  choiceBody: {
    flex: 1,
    gap: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  choiceImage: {
    width: '100%',
    height: 120,
    borderRadius: spacing.inputRadius,
    backgroundColor: colors.surface,
  },
});

export default ExamQuestionCard;
