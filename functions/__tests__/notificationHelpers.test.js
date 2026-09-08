const {
  ANDROID_CHANNEL_DEFAULT,
  ANDROID_CHANNEL_SILENT,
  DEFAULT_NOTIFICATION_PREFERENCES,
  FORUM_NOTIFICATION_CATEGORY,
  FORUM_NOTIFICATION_TYPE,
  normalizeAudience,
  normalizeContentTrack,
  normalizeSchoolIds,
  normalizeSchoolGradeIds,
  userMatchesSchoolGradeTarget,
  userMatchesTrackTarget,
  normalizeNotificationCategory,
  resolveUserPreferences,
  isCategoryEnabledForUser,
  collectEligibleTokens,
  buildMulticastMessage,
  buildForumMessagePreview,
  buildForumNotificationCopy,
  buildForumMulticastMessage,
  sendMulticastBatches,
} = require('../notificationHelpers');

function tokenDoc(userId, token) {
  return {
    ref: { parent: { parent: { id: userId } } },
    data: () => ({ token }),
  };
}

describe('normalizeAudience', () => {
  it('defaults to all unless explicitly schools', () => {
    expect(normalizeAudience({ audience: 'schools' })).toBe('schools');
    expect(normalizeAudience({ audience: 'everyone' })).toBe('all');
    expect(normalizeAudience(undefined)).toBe('all');
  });
});

describe('normalizeSchoolIds', () => {
  it('trims, deduplicates, and drops invalid entries', () => {
    expect(
      normalizeSchoolIds({ schoolIds: [' s1 ', 's1', '', 42, 's2'] }),
    ).toEqual(['s1', 's2']);
  });

  it('returns empty for missing or non-array values', () => {
    expect(normalizeSchoolIds({})).toEqual([]);
    expect(normalizeSchoolIds({ schoolIds: 's1' })).toEqual([]);
  });
});

describe('normalizeSchoolGradeIds', () => {
  it('keeps only grades for targeted schools', () => {
    const result = normalizeSchoolGradeIds(
      {
        schoolGradeIds: {
          s1: [' g1 ', 'g1', 'g2'],
          s2: ['g3'],
          s3: [],
        },
      },
      ['s1', 's3'],
    );
    expect(result).toEqual({ s1: ['g1', 'g2'] });
  });

  it('returns empty for invalid shapes', () => {
    expect(normalizeSchoolGradeIds({ schoolGradeIds: ['g1'] }, ['s1'])).toEqual({});
    expect(normalizeSchoolGradeIds({}, ['s1'])).toEqual({});
  });
});

describe('userMatchesSchoolGradeTarget', () => {
  it('requires a school id on the user', () => {
    expect(userMatchesSchoolGradeTarget({}, {})).toBe(false);
    expect(userMatchesSchoolGradeTarget({ schoolId: '  ' }, {})).toBe(false);
  });

  it('matches any grade when no grades are restricted for the school', () => {
    expect(userMatchesSchoolGradeTarget({ schoolId: 's1' }, {})).toBe(true);
    expect(userMatchesSchoolGradeTarget({ schoolId: 's1' }, { s1: [] })).toBe(true);
  });

  it('enforces grade restrictions when present', () => {
    const target = { s1: ['g1', 'g2'] };
    expect(
      userMatchesSchoolGradeTarget({ schoolId: 's1', grade: 'g1' }, target),
    ).toBe(true);
    expect(
      userMatchesSchoolGradeTarget({ schoolId: 's1', grade: 'g9' }, target),
    ).toBe(false);
    expect(userMatchesSchoolGradeTarget({ schoolId: 's1' }, target)).toBe(false);
  });
});

describe('normalizeContentTrack / userMatchesTrackTarget', () => {
  it('keeps kids and professionals and drops invalid values', () => {
    expect(normalizeContentTrack('kids')).toBe('kids');
    expect(normalizeContentTrack('professionals')).toBe('professionals');
    expect(normalizeContentTrack('other')).toBeNull();
    expect(normalizeContentTrack(undefined)).toBeNull();
  });

  it('matches everyone when the notification has no track', () => {
    expect(userMatchesTrackTarget({ track: 'kids' }, null)).toBe(true);
    expect(userMatchesTrackTarget({}, null)).toBe(true);
  });

  it('requires the user track to match the notification track', () => {
    expect(userMatchesTrackTarget({ track: 'kids' }, 'kids')).toBe(true);
    expect(userMatchesTrackTarget({ track: 'professionals' }, 'kids')).toBe(
      false,
    );
    expect(userMatchesTrackTarget({}, 'kids')).toBe(false);
    expect(userMatchesTrackTarget({ track: 'unknown' }, 'professionals')).toBe(
      false,
    );
  });
});

describe('normalizeNotificationCategory', () => {
  it('keeps known categories and falls back to general', () => {
    expect(normalizeNotificationCategory('course_updates')).toBe('course_updates');
    expect(normalizeNotificationCategory('class_forum_messages')).toBe(
      'class_forum_messages',
    );
    expect(normalizeNotificationCategory('unknown')).toBe('general');
    expect(normalizeNotificationCategory(undefined)).toBe('general');
  });
});

describe('resolveUserPreferences / isCategoryEnabledForUser', () => {
  it('merges stored preferences over defaults', () => {
    const prefs = resolveUserPreferences({ courseUpdates: false });
    expect(prefs.courseUpdates).toBe(false);
    expect(prefs.pushNotifications).toBe(true);
  });

  it('general category is always enabled', () => {
    expect(isCategoryEnabledForUser(DEFAULT_NOTIFICATION_PREFERENCES, 'general')).toBe(true);
    expect(isCategoryEnabledForUser(DEFAULT_NOTIFICATION_PREFERENCES, null)).toBe(true);
  });

  it('respects the per-category opt-out', () => {
    const prefs = resolveUserPreferences({ courseUpdates: false });
    expect(isCategoryEnabledForUser(prefs, 'course_updates')).toBe(false);
    expect(isCategoryEnabledForUser(prefs, 'security_alerts')).toBe(true);
  });

  it('respects class forum message opt-out', () => {
    const prefs = resolveUserPreferences({ classForumMessages: false });
    expect(isCategoryEnabledForUser(prefs, 'class_forum_messages')).toBe(false);
    expect(
      isCategoryEnabledForUser(DEFAULT_NOTIFICATION_PREFERENCES, 'class_forum_messages'),
    ).toBe(true);
  });

  it('defaults promotional offers and app updates to off', () => {
    const prefs = resolveUserPreferences(null);
    expect(isCategoryEnabledForUser(prefs, 'promotional_offers')).toBe(false);
    expect(isCategoryEnabledForUser(prefs, 'app_updates')).toBe(false);
  });
});

describe('collectEligibleTokens', () => {
  it('splits tokens by sound preference and deduplicates', () => {
    const snap = {
      docs: [
        tokenDoc('u1', 'token-a'),
        tokenDoc('u1', 'token-a'),
        tokenDoc('u2', 'token-b'),
      ],
    };
    const prefs = new Map([
      ['u2', resolveUserPreferences({ soundAndVibration: false })],
    ]);

    const { withSound, silent } = collectEligibleTokens(snap, prefs, 'general', null);
    expect(withSound).toEqual(['token-a']);
    expect(silent).toEqual(['token-b']);
  });

  it('skips users who disabled push notifications', () => {
    const snap = { docs: [tokenDoc('u1', 'token-a')] };
    const prefs = new Map([
      ['u1', resolveUserPreferences({ pushNotifications: false })],
    ]);

    const { withSound, silent } = collectEligibleTokens(snap, prefs, 'general', null);
    expect(withSound).toEqual([]);
    expect(silent).toEqual([]);
  });

  it('skips users who disabled the notification category', () => {
    const snap = { docs: [tokenDoc('u1', 'token-a')] };
    const prefs = new Map([
      ['u1', resolveUserPreferences({ courseUpdates: false })],
    ]);

    const result = collectEligibleTokens(snap, prefs, 'course_updates', null);
    expect(result.withSound).toEqual([]);
  });

  it('filters by allowed user ids when audience is restricted', () => {
    const snap = {
      docs: [tokenDoc('u1', 'token-a'), tokenDoc('u2', 'token-b')],
    };

    const result = collectEligibleTokens(snap, new Map(), 'general', new Set(['u2']));
    expect(result.withSound).toEqual(['token-b']);
  });

  it('ignores docs with missing user ids or empty tokens', () => {
    const snap = {
      docs: [
        { ref: { parent: { parent: null } }, data: () => ({ token: 'x' }) },
        tokenDoc('u1', ''),
        tokenDoc('u2', undefined),
      ],
    };

    const result = collectEligibleTokens(snap, new Map(), 'general', null);
    expect(result.withSound).toEqual([]);
    expect(result.silent).toEqual([]);
  });
});

describe('buildMulticastMessage', () => {
  it('builds a sound message with APNs payload and default channel', () => {
    const message = buildMulticastMessage(' Title ', ' Body ', ' n1 ', 'general', true);
    expect(message.notification).toEqual({ title: 'Title', body: 'Body' });
    expect(message.data).toEqual({
      notificationId: 'n1',
      type: 'live_notification',
      category: 'general',
    });
    expect(message.android.notification.channelId).toBe(ANDROID_CHANNEL_DEFAULT);
    expect(message.apns.payload.aps.sound).toBe('default');
  });

  it('builds a silent message without APNs sound', () => {
    const message = buildMulticastMessage('T', 'B', 'n1', 'general', false);
    expect(message.android.notification.channelId).toBe(ANDROID_CHANNEL_SILENT);
    expect(message.apns).toBeUndefined();
  });

  it('accepts a custom type and extra data fields', () => {
    const message = buildMulticastMessage('T', 'B', 'n1', 'class_forum_messages', true, {
      type: 'class_forum_message',
      data: { channelId: 'ch1', messageId: 'm1', empty: '' },
    });
    expect(message.data).toEqual({
      notificationId: 'n1',
      type: 'class_forum_message',
      category: 'class_forum_messages',
      channelId: 'ch1',
      messageId: 'm1',
    });
  });
});

describe('buildForumNotification helpers', () => {
  it('truncates long message previews', () => {
    const long = 'a'.repeat(130);
    expect(buildForumMessagePreview(long)).toHaveLength(120);
    expect(buildForumMessagePreview(long).endsWith('…')).toBe(true);
  });

  it('builds notification copy from sender and channel', () => {
    expect(
      buildForumNotificationCopy(' Ada ', ' Hello class ', ' School · Grade 6 '),
    ).toEqual({
      title: 'School · Grade 6',
      body: 'Ada: Hello class',
    });
  });

  it('builds a forum multicast payload', () => {
    const message = buildForumMulticastMessage(
      'Forum',
      'Ada: hi',
      'school__g6',
      'msg1',
      true,
    );
    expect(message.data).toEqual({
      notificationId: 'school__g6_msg1',
      type: FORUM_NOTIFICATION_TYPE,
      category: FORUM_NOTIFICATION_CATEGORY,
      channelId: 'school__g6',
      messageId: 'msg1',
    });
  });
});

describe('sendMulticastBatches', () => {
  it('chunks tokens by batch size and aggregates counts', async () => {
    const calls = [];
    const messaging = {
      sendEachForMulticast: jest.fn(async message => {
        calls.push(message.tokens);
        return { successCount: message.tokens.length, failureCount: 0 };
      }),
    };

    const tokens = ['t1', 't2', 't3', 't4', 't5'];
    const result = await sendMulticastBatches(messaging, tokens, { data: {} }, 2);

    expect(calls).toEqual([['t1', 't2'], ['t3', 't4'], ['t5']]);
    expect(result).toEqual({ successCount: 5, failureCount: 0 });
  });

  it('sends nothing for an empty token list', async () => {
    const messaging = { sendEachForMulticast: jest.fn() };
    const result = await sendMulticastBatches(messaging, [], {}, 500);
    expect(messaging.sendEachForMulticast).not.toHaveBeenCalled();
    expect(result).toEqual({ successCount: 0, failureCount: 0 });
  });
});
