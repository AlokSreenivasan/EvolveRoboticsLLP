import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Megaphone } from 'lucide-react-native';

import ImportantUpdatesCard from '../../../components/Home/ImportantUpdatesCard';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenStateCard from '../../../components/ui/ScreenStateCard';
import SurfaceCard from '../../../components/ui/SurfaceCard';
import { VERTICAL_LIST_PERF } from '../../../constants/listPerformance';
import { colors, spacing, typography } from '../../../constants/theme';
import type { ImportantUpdateNotice } from '../../../store/content/types/importantUpdates.types';
import {
  useHomeFeedFocus,
  useHomeFeedRefresh,
} from '../../context/HomeFeedContext';
import { useImportantUpdates } from '../../hooks/useImportantUpdates';

function ImportantUpdatesListScreen() {
  useHomeFeedFocus();
  const { section, displayNotices, loading, error } = useImportantUpdates();
  const { refresh, refreshing } = useHomeFeedRefresh();

  const renderItem = useCallback(
    ({ item }: { item: ImportantUpdateNotice }) => (
      <ImportantUpdatesCard notice={item} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: ImportantUpdateNotice) => item.id,
    [],
  );

  const listEmpty = useCallback(() => {
    if (loading) {
      return <ScreenStateCard variant="loading" />;
    }
    if (error) {
      return (
        <ScreenStateCard
          variant="error"
          title="Could not load updates"
          message="Pull down to refresh, or try again in a moment."
          Icon={Megaphone}
        />
      );
    }
    return (
      <ScreenStateCard
        variant="empty"
        title="No updates right now"
        message="When admins post announcements, they’ll show up here."
        Icon={Megaphone}
      />
    );
  }, [error, loading]);

  const countLabel =
    !loading && !error && displayNotices.length > 0
      ? `${displayNotices.length} update${displayNotices.length === 1 ? '' : 's'}`
      : null;

  const headerSubtitle =
    section.sectionSubtitle?.trim() ||
    'Announcements and notices from your learning team.';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={section.sectionTitle} subtitle={headerSubtitle} />

      <FlatList
        data={loading || error ? [] : displayNotices}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          !loading && !error ? (
            <>
              {countLabel ? (
                <Text style={styles.countBadge}>{countLabel}</Text>
              ) : null}
              <SurfaceCard tinted elevation="default" style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <Megaphone
                    size={22}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>Important notices</Text>
                  <Text style={styles.infoDescription}>
                    Posted by your learning team for your track and school.
                  </Text>
                </View>
              </SurfaceCard>
            </>
          ) : null
        }
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        {...VERTICAL_LIST_PERF}
      />
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  countBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: spacing.iconTileRadius,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    ...typography.cardTitle,
    fontSize: 15,
    marginBottom: 4,
  },
  infoDescription: {
    ...typography.bodySecondary,
    lineHeight: 19,
  },
  separator: {
    height: 14,
  },
});

export default ImportantUpdatesListScreen;
