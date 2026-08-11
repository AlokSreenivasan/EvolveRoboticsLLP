import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessagesSquare, Plus, School } from 'lucide-react-native';

import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import CardShadowShell from '../../../components/ui/CardShadowShell';
import { getGradeLabel, resolveGradeOptionsForSchool } from '../../../constants/gradeOptions';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import {
  cardShadowLight,
  colors,
  glassBorder,
  spacing,
} from '../../../constants/theme';
import { ensureClassForumChannel } from '../../../services/firebase/classForumService';
import type { ClassForumChannel } from '../../../store/content/types/classForum.types';
import type { School as SchoolType } from '../../../store/content/types/schools.types';
import type { LoginScreenNavigationProp } from '../../../types/navigation';
import { appAlert } from '../../../utils/alert/appAlert';
import { getErrorMessage } from '../../../utils/firebase';
import { canBrowseAllClassForumChannels } from '../../../utils/forum/classForumPermissions';
import { useAuth } from '../../context/AuthContext';
import { useClassForumChannels } from '../../hooks/useClassForumChannels';
import { useSchools } from '../../hooks/useSchools';
import { useUserRole } from '../../hooks/useUserRole';

function formatPreviewTime(channel: ClassForumChannel): string {
  const stamp = channel.lastMessageAt ?? channel.updatedAt;
  if (!stamp) {
    return '';
  }
  try {
    return stamp.toDate().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ChannelListSeparator() {
  return <View style={styles.separator} />;
}

function ChatForumScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { profile } = useAuth();
  const { role } = useUserRole();
  const isFacilitator = canBrowseAllClassForumChannels(role);
  const { schools, loading: schoolsLoading } = useSchools();
  const { channels, loading, error } = useClassForumChannels(isFacilitator);

  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const studentOpenAttempted = useRef(false);

  const studentSchool = useMemo(
    () => schools.find(school => school.id === profile?.schoolId) ?? null,
    [profile?.schoolId, schools],
  );

  const selectedSchool = useMemo(
    () => schools.find(school => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId],
  );

  const gradeOptions = useMemo(
    () => resolveGradeOptionsForSchool(selectedSchool),
    [selectedSchool],
  );

  const openChannel = useCallback(
    async (
      input: {
        schoolId: string;
        grade: string;
        schoolName: string;
        gradeLabel: string;
      },
      options?: { replace?: boolean },
    ) => {
      setOpening(true);
      setOpenError(null);
      try {
        const channel = await ensureClassForumChannel(input);
        const params = {
          channelId: channel.id,
          title: channel.title,
        };
        if (options?.replace) {
          navigation.replace('ChatForumChannel', params);
        } else {
          navigation.navigate('ChatForumChannel', params);
        }
      } catch (err) {
        const message = getErrorMessage(err);
        setOpenError(message);
        appAlert('Couldn’t open forum', message);
        throw err;
      } finally {
        setOpening(false);
      }
    },
    [navigation],
  );

  const openStudentChannel = useCallback(() => {
    const schoolId = profile?.schoolId?.trim();
    const grade = profile?.grade?.trim();
    if (!schoolId || !grade) {
      return;
    }
    studentOpenAttempted.current = true;
    const schoolName = studentSchool?.name ?? 'Your school';
    const gradeLabel = getGradeLabel(grade, schools) ?? grade;
    openChannel(
      {
        schoolId,
        grade,
        schoolName,
        gradeLabel,
      },
      { replace: true },
    ).catch(() => {
      studentOpenAttempted.current = false;
    });
  }, [
    openChannel,
    profile?.grade,
    profile?.schoolId,
    schools,
    studentSchool?.name,
  ]);

  useEffect(() => {
    if (isFacilitator || studentOpenAttempted.current || schoolsLoading) {
      return;
    }
    if (!profile?.schoolId?.trim() || !profile?.grade?.trim()) {
      return;
    }
    openStudentChannel();
  }, [
    isFacilitator,
    openStudentChannel,
    profile?.grade,
    profile?.schoolId,
    schoolsLoading,
  ]);

  const handleOpenExisting = useCallback(
    (channel: ClassForumChannel) => {
      navigation.navigate('ChatForumChannel', {
        channelId: channel.id,
        title: channel.title,
      });
    },
    [navigation],
  );

  const handleConfirmPicker = useCallback(() => {
    if (!selectedSchool || !selectedGrade) {
      appAlert('Pick a class', 'Choose a school and grade to open the forum.');
      return;
    }
    const gradeLabel =
      getGradeLabel(selectedGrade, schools) ?? selectedGrade;
    setPickerOpen(false);
    openChannel({
      schoolId: selectedSchool.id,
      grade: selectedGrade,
      schoolName: selectedSchool.name,
      gradeLabel,
    }).catch(() => undefined);
  }, [openChannel, schools, selectedGrade, selectedSchool]);

  const renderChannel = useCallback(
    ({ item }: { item: ClassForumChannel }) => (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleOpenExisting(item)}
        accessibilityRole="button"
        accessibilityLabel={item.title}>
        <CardShadowShell
          elevation="light"
          borderRadius={18}
          innerStyle={styles.channelCard}>
          <View style={styles.channelTop}>
            <View style={styles.channelIcon}>
              <School size={18} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.channelText}>
              <Text style={styles.channelTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.channelPreview} numberOfLines={2}>
                {item.lastMessagePreview || 'No messages yet'}
              </Text>
            </View>
          </View>
          <View style={styles.channelMeta}>
            <Text style={styles.metaText}>
              {item.isLocked ? 'Locked' : `${item.messageCount} messages`}
            </Text>
            <Text style={styles.metaText}>{formatPreviewTime(item)}</Text>
          </View>
        </CardShadowShell>
      </TouchableOpacity>
    ),
    [handleOpenExisting],
  );

  if (!isFacilitator) {
    const missingClass = !profile?.schoolId?.trim() || !profile?.grade?.trim();

    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Chat Forum" subtitle="Your class discussion" />
        {missingClass ? (
          <ScreenStateCard
            variant="empty"
            title="Complete your profile"
            message="Add your school and grade in Profile to join your class forum."
            Icon={MessagesSquare}
          />
        ) : openError ? (
          <View style={styles.center}>
            <ScreenStateCard
              variant="error"
              title="Could not open forum"
              message={openError}
              Icon={MessagesSquare}
            />
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={openStudentChannel}
              accessibilityRole="button"
              accessibilityLabel="Try again">
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.openingText}>Opening your class forum…</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Chat Forum"
        subtitle="Facilitator · all schools"
        rightSlot={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open a class forum">
            <Plus size={20} color={colors.primary} strokeWidth={2.4} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={loading || error ? [] : channels}
        keyExtractor={item => item.id}
        renderItem={renderChannel}
        ItemSeparatorComponent={ChannelListSeparator}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.hint}>
            Open any school and grade. Students only see their own class.
          </Text>
        }
        ListEmptyComponent={
          loading ? (
            <ScreenStateCard variant="loading" />
          ) : error ? (
            <ScreenStateCard
              variant="error"
              title="Could not load forums"
              message={error}
              Icon={MessagesSquare}
            />
          ) : (
            <ScreenStateCard
              variant="empty"
              title="No class forums yet"
              message="Tap + to open a school and grade forum for students."
              Icon={MessagesSquare}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        {...VERTICAL_LIST_PERF}
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          style={styles.modalScrim}
          onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Open class forum</Text>
            <Text style={styles.modalSubtitle}>
              Choose any school and grade (global facilitator access).
            </Text>

            <Text style={styles.sectionLabel}>School</Text>
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}>
              {schools.map((school: SchoolType) => {
                const active = school.id === selectedSchoolId;
                return (
                  <TouchableOpacity
                    key={school.id}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      setSelectedSchoolId(school.id);
                      setSelectedGrade(null);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}>
                      {school.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedSchool ? (
              <>
                <Text style={styles.sectionLabel}>Grade</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gradeRow}>
                  {gradeOptions.map(option => {
                    const active = option.value === selectedGrade;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.gradeChip,
                          active && styles.gradeChipActive,
                        ]}
                        onPress={() => setSelectedGrade(option.value)}>
                        <Text
                          style={[
                            styles.gradeChipText,
                            active && styles.gradeChipTextActive,
                          ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setPickerOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!selectedSchoolId || !selectedGrade || opening) &&
                    styles.primaryBtnDisabled,
                ]}
                disabled={!selectedSchoolId || !selectedGrade || opening}
                onPress={handleConfirmPicker}>
                <Text style={styles.primaryBtnText}>
                  {opening ? 'Opening…' : 'Open forum'}
                </Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>

      {opening ? (
        <View style={styles.openingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenHorizontal,
  },
  openingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 28,
    flexGrow: 1,
  },
  hint: {
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  separator: {
    height: 12,
  },
  channelCard: {
    padding: 14,
  },
  channelTop: {
    flexDirection: 'row',
    gap: 12,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelText: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  channelPreview: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  channelMeta: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '88%',
    ...glassBorder,
    ...cardShadowLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pickerScroll: {
    maxHeight: 180,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: colors.background,
  },
  optionActive: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primaryDark,
  },
  gradeRow: {
    gap: 8,
    paddingBottom: 4,
  },
  gradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gradeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gradeChipTextActive: {
    color: colors.surface,
  },
  modalActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  openingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,249,251,0.45)',
  },
});

export default ChatForumScreen;
