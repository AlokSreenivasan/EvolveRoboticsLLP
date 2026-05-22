import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import {
  DEFAULT_DISPLAY_NAME,
  DEFAULT_PROFILE_AVATAR_URI,
} from '../../constants/profileDefaults';
import type { Profile } from '../../domain/Profile/models/Profile';
import type { UserProfile } from '../../store/user/types';

export function buildFallbackUserProfile(
  user: FirebaseAuthTypes.User,
): UserProfile {
  return {
    uid: user.uid,
    fullName: user.displayName?.trim() ?? '',
    email: user.email?.trim() ?? '',
    phoneNumber: '',
    profileImage: null,
    createdAt: null,
    updatedAt: null,
  };
}

export function resolveDisplayName(
  profile: UserProfile | null,
  authUser: FirebaseAuthTypes.User | null,
): string {
  const fromProfile = profile?.fullName?.trim();
  if (fromProfile) {
    return fromProfile;
  }
  const fromAuth = authUser?.displayName?.trim();
  if (fromAuth) {
    return fromAuth;
  }
  return DEFAULT_DISPLAY_NAME;
}

export function resolveAvatarUri(
  profile: UserProfile | null,
): string {
  const remote = profile?.profileImage?.trim();
  if (remote) {
    return remote;
  }
  return DEFAULT_PROFILE_AVATAR_URI;
}

export function hasRemoteProfileImage(profile: UserProfile | null): boolean {
  return Boolean(profile?.profileImage?.trim());
}

export function userProfileToFormProfile(profile: UserProfile | null): Profile {
  if (!profile) {
    return {
      fullName: '',
      contactNumber: '',
      photoUri: null,
    };
  }

  return {
    fullName: profile.fullName,
    contactNumber: profile.phoneNumber,
    photoUri: profile.profileImage,
  };
}

/** Prefer profiles with more registration fields populated (avoids fallback overwriting signup data). */
export function isRicherUserProfile(
  candidate: UserProfile | null | undefined,
  baseline: UserProfile | null | undefined,
): boolean {
  if (!candidate) {
    return false;
  }
  if (!baseline || candidate.uid !== baseline.uid) {
    return true;
  }

  const score = (profile: UserProfile) =>
    (profile.fullName?.trim() ? 1 : 0) +
    (profile.phoneNumber?.trim() ? 1 : 0) +
    (profile.profileImage?.trim() ? 1 : 0);

  return score(candidate) > score(baseline);
}

export function isLocalImageUri(uri: string | null | undefined): boolean {
  if (!uri?.trim()) {
    return false;
  }
  const value = uri.trim().toLowerCase();
  return (
    value.startsWith('file://') ||
    value.startsWith('content://') ||
    value.startsWith('ph://')
  );
}
