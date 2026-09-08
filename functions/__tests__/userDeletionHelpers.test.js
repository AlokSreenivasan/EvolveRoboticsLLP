const {
  USER_SUBCOLLECTIONS,
  collectOrphanedUserIds,
  shouldRefuseOrphanPurge,
  deleteUserFirestoreData,
  purgeOrphanedUserProfiles,
} = require('../userDeletionHelpers');

describe('collectOrphanedUserIds', () => {
  it('returns Firestore uids that are missing from Auth', () => {
    expect(
      collectOrphanedUserIds(['a', 'b', 'c'], new Set(['a', 'c'])),
    ).toEqual(['b']);
  });

  it('accepts an array of Auth uids', () => {
    expect(collectOrphanedUserIds(['a', 'b'], ['a'])).toEqual(['b']);
  });
});

describe('shouldRefuseOrphanPurge', () => {
  it('refuses when Auth is empty but Firestore still has profiles', () => {
    expect(shouldRefuseOrphanPurge(3, 0)).toBe(true);
  });

  it('allows purge when Auth and Firestore are both empty', () => {
    expect(shouldRefuseOrphanPurge(0, 0)).toBe(false);
  });

  it('allows purge when Auth has users', () => {
    expect(shouldRefuseOrphanPurge(10, 8)).toBe(false);
  });
});

describe('deleteUserFirestoreData', () => {
  it('uses recursiveDelete when it succeeds', async () => {
    const userRef = { path: 'users/u1' };
    const db = {
      doc: jest.fn(() => userRef),
      recursiveDelete: jest.fn(async () => undefined),
    };

    await deleteUserFirestoreData(db, 'u1');

    expect(db.doc).toHaveBeenCalledWith('users/u1');
    expect(db.recursiveDelete).toHaveBeenCalledWith(userRef);
  });

  it('deletes known subcollections when recursiveDelete fails', async () => {
    const deletedPaths = [];
    const userRef = {
      collection: jest.fn(name => ({
        firestore: {
          batch: () => {
            const refs = [];
            return {
              delete: ref => refs.push(ref),
              commit: async () => {
                deletedPaths.push(...refs.map(ref => ref.path));
              },
            };
          },
        },
        limit: () => ({
          get: async () => ({ empty: true, size: 0, docs: [] }),
        }),
      })),
      delete: jest.fn(async () => {
        deletedPaths.push('users/u1');
      }),
    };
    const db = {
      doc: jest.fn(() => userRef),
      recursiveDelete: jest.fn(async () => {
        throw new Error('recursiveDelete unavailable');
      }),
    };

    await deleteUserFirestoreData(db, 'u1');

    USER_SUBCOLLECTIONS.forEach(name => {
      expect(userRef.collection).toHaveBeenCalledWith(name);
    });
    expect(userRef.delete).toHaveBeenCalled();
  });
});

describe('purgeOrphanedUserProfiles', () => {
  it('deletes Firestore profiles that have no Auth user', async () => {
    const recursiveDelete = jest.fn(async () => undefined);
    const db = {
      collection: () => ({
        select: () => ({
          get: async () => ({
            docs: [{ id: 'keep' }, { id: 'gone' }],
          }),
        }),
      }),
      doc: uidPath => ({ path: uidPath }),
      recursiveDelete,
    };
    const auth = {
      listUsers: async () => ({
        users: [{ uid: 'keep' }],
        pageToken: undefined,
      }),
    };

    const result = await purgeOrphanedUserProfiles(db, auth);

    expect(result).toEqual({ scanned: 2, purged: 1 });
    expect(recursiveDelete).toHaveBeenCalledWith({ path: 'users/gone' });
  });

  it('throws instead of wiping profiles when Auth listing is empty', async () => {
    const db = {
      collection: () => ({
        select: () => ({
          get: async () => ({
            docs: [{ id: 'keep' }],
          }),
        }),
      }),
      recursiveDelete: jest.fn(),
    };
    const auth = {
      listUsers: async () => ({ users: [], pageToken: undefined }),
    };

    await expect(purgeOrphanedUserProfiles(db, auth)).rejects.toThrow(
      /Refusing orphan purge/,
    );
    expect(db.recursiveDelete).not.toHaveBeenCalled();
  });
});
