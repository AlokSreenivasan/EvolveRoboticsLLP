import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ResourceNoteCard from '../../../components/Resources/ResourceNoteCard';
import { colors, spacing } from '../../../constants/theme';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { useResources } from '../../hooks/useResources';

function ResourcesScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { section, notes, loading, error } = useResources();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          ← Back
        </Text>
        <Text style={styles.title}>{section.sectionTitle}</Text>
        {section.sectionSubtitle?.trim() ? (
          <Text style={styles.subtitle}>{section.sectionSubtitle.trim()}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Could not load resources</Text>
            <Text style={styles.messageText}>
              Go back and try again in a moment.
            </Text>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No notes yet</Text>
            <Text style={styles.messageText}>
              Study notes will appear here once your instructors publish them.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notes.map((note, index) => (
              <ResourceNoteCard
                key={note.id}
                note={note}
                accentIndex={index}
                onPress={() =>
                  navigation.navigate('ResourcePdfViewer', {
                    title: note.title,
                    pdfUrl: note.pdfUrl,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    fontSize: 16,
    color: colors.link,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 40,
  },
  list: {
    width: '100%',
  },
  messageCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResourcesScreen;
