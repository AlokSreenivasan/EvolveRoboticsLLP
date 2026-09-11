import { SUPPORT_EMAIL } from '../config/support';

/** Public app privacy policy (Play Data Safety and store listing). */
export const APP_PRIVACY_POLICY_URL =
  'https://evolve-robotics-llp-fad1e.web.app/privacy-policy';

export const TERMS_AND_CONDITIONS_URL =
  'https://www.evolveroboticsindia.com/terms-and-conditions';

export const PRIVACY_POLICY_EFFECTIVE_DATE = '11 September 2026';

export const PRIVACY_POLICY_OPERATOR = 'Evolve Robotics LLP';

export type PrivacyPolicySection = {
  title: string;
  paragraphs: string[];
};

export const PRIVACY_POLICY_INTRO = `This privacy policy applies to the Evolve mobile app (Android and iOS), not the company marketing website. ${PRIVACY_POLICY_OPERATOR} (“we”) operates the app. Contact: ${SUPPORT_EMAIL}.`;

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
  {
    title: 'What this app collects',
    paragraphs: [
      'Account and authentication: Firebase Authentication user ID, email address, and sign-in credentials. You can create an email/password account or sign in with Google. We store email verification status and, for Google sign-in, the Google account identifier needed to authenticate you.',
      'Profile: full name, phone number, school, grade, learner track (kids or professionals), calendar birth year, and parental-consent timestamp when a guardian completes the under-13 gate. Profiles are stored in Cloud Firestore at users/{your user id}.',
      'Photos: an optional profile photo you choose from the device. Photos are uploaded to Firebase Storage (profileImages/{your user id}) and the download URL is saved on your profile.',
      'Push notifications (FCM): if you allow notifications, we collect a Firebase Cloud Messaging device token and platform (Android or iOS) and store it under users/{your user id}/fcmTokens. You can turn push off in Notification Preferences, which removes the device token.',
      'Crash and diagnostics (Crashlytics): the app uses Firebase Crashlytics to record crash stack traces, app version, device model, and OS version so we can fix failures. Crash reports may be associated with your Firebase user ID.',
      'App activity needed to run the product: exam and quiz attempts, learning progress, notification preferences, in-app notifications, and similar course activity stored in Firestore and linked to your account.',
      'Local device storage: session and preference caches (for example notification settings) on the device. These are cleared when you sign out or delete your account.',
    ],
  },
  {
    title: 'Why we collect it',
    paragraphs: [
      'We use this data only for app functionality: signing you in, showing your profile, delivering courses and assessments, sending the notifications you enable, and diagnosing crashes. We do not sell personal information and we do not use this data for independent advertising or cross-app tracking.',
    ],
  },
  {
    title: 'Who we share it with',
    paragraphs: [
      'Google Firebase (Authentication, Firestore, Storage, Cloud Functions, Cloud Messaging, Crashlytics, and App Check) processes this data on our behalf to run the app. Google Sign-In receives your Google account interaction when you choose that sign-in method.',
      'We do not share your profile, photos, or FCM tokens with unrelated third-party advertisers.',
    ],
  },
  {
    title: 'Account deletion',
    paragraphs: [
      'You can delete your account in the app: Settings → Privacy Settings → Delete Account. Email/password accounts must confirm with the current password.',
      'Deletion removes your Firebase Authentication user, Firestore profile and associated user data (including FCM tokens and learning activity we store for your user id), profile photos in Storage, and local session caches. This cannot be undone.',
      'If a server-side cleanup step is temporarily unavailable, remaining user subcollections are removed by our account-deletion process once the Authentication user is deleted.',
      'You can also email ' +
        SUPPORT_EMAIL +
        ' to request deletion if you cannot use the in-app control.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'The app includes a kids learning track. We collect birth year to apply an age gate. Learners under 13 need a parent or guardian to complete in-app parental consent before the profile is treated as complete. We do not use children’s data for advertising.',
    ],
  },
  {
    title: 'Security and retention',
    paragraphs: [
      'Access to account data requires a signed-in Firebase session. We keep account and profile data until you delete the account or we are required to retain a limited record (for example to complete a deletion request or meet a legal obligation). Crash logs are retained according to Firebase Crashlytics defaults.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      'You can edit profile details and photos in Personal details, change notification preferences, sign out, or delete your account. You can also contact us at ' +
        SUPPORT_EMAIL +
        ' about this policy.',
    ],
  },
];
