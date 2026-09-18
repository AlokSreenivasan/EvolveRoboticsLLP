import { SUPPORT_EMAIL, SUPPORT_PHONE } from '../config/support';

/** Public app privacy policy (Play Data Safety and store listing). */
export const APP_PRIVACY_POLICY_URL =
  'https://evolve-robotics-llp-fad1e.web.app/privacy-policy';

export const TERMS_AND_CONDITIONS_URL =
  'https://www.evolveroboticsindia.com/terms-and-conditions';

export const PRIVACY_POLICY_EFFECTIVE_DATE = '12 September 2026';

export const PRIVACY_POLICY_OPERATOR = 'Evolve Robotics LLP';

export type PrivacyPolicySection = {
  title: string;
  paragraphs: string[];
};

export const PRIVACY_POLICY_INTRO = `This privacy policy applies to the Evolve mobile app (Android and iOS), not the company marketing website. ${PRIVACY_POLICY_OPERATOR} (“we”, “us”) operates the app. Contact: ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}.`;

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
  {
    title: 'Who this policy covers',
    paragraphs: [
      'This policy describes how we collect, use, store, and share personal information when you use the Evolve app as a learner, parent or guardian completing the under-13 consent step, or an administrator. If you do not agree with this policy, do not create an account or use the app.',
    ],
  },
  {
    title: 'What this app collects',
    paragraphs: [
      'Account and authentication: Firebase Authentication user ID, email address, and sign-in credentials. You can create an email/password account or sign in with Google. We store email verification status and, for Google sign-in, the Google account identifier needed to authenticate you.',
      'Profile: full name, phone number, school, grade, learner track (kids or professionals), date of birth (DD/MM/YYYY), and parental-consent timestamp when a guardian completes the under-13 gate. Profiles are stored in Cloud Firestore at users/{your user id}.',
      'Photos: an optional profile photo you choose from the device. Photos are uploaded to Firebase Storage (profileImages/{your user id}) and the download URL is saved on your profile.',
      'Class forum: if you post in your school/grade channel, we store the message text, your user id, display name, and role. Classmates in that channel and administrators can see those posts. If you report a message, we store the report, reporter name, and a copy of the reported text so we can review it.',
      'Push notifications (FCM): if you allow notifications, we collect a Firebase Cloud Messaging device token and platform (Android or iOS) and store it under users/{your user id}/fcmTokens. You can turn push off in Notification Preferences, which removes the device token.',
      'Crash and diagnostics (Crashlytics): the app uses Firebase Crashlytics to record crash stack traces, app version, device model, and OS version so we can fix failures. Crash reports may be associated with your Firebase user ID.',
      'App activity needed to run the product: exam and quiz attempts, learning progress, notification preferences, in-app notifications, and similar course activity stored in Firestore and linked to your account.',
      'Local device storage: session and preference caches (for example onboarding status, a profile snapshot, and notification settings) on the device. These are cleared when you sign out or delete your account.',
    ],
  },
  {
    title: 'What we do not collect',
    paragraphs: [
      'We do not collect precise location, contacts, payment card numbers, or advertising identifiers. We do not run a separate advertising or cross-app tracking SDK. We do not sell personal information.',
    ],
  },
  {
    title: 'Why we collect it',
    paragraphs: [
      'We use this data only for app functionality: signing you in, showing your profile, delivering courses, videos, exams, and quizzes, enabling the class forum, sending the notifications you enable, letting authorised staff administer schools and accounts, and diagnosing crashes.',
      'Legal bases we rely on (where applicable) include providing the service you request, our legitimate interest in securing and operating the app, and consent — including parental consent for learners under 13.',
    ],
  },
  {
    title: 'Who can see your information',
    paragraphs: [
      'You can see and edit your own profile in Personal details (school and grade cannot be changed after they are saved). Class forum posts are visible to other signed-in learners in the same school and grade channel, and to administrators.',
      'Authorised Evolve administrators can look up learner names, emails, phone numbers, school, grade, track, and role in order to run the learning programme (for example assigning access or answering support requests). They do not use this data for advertising.',
    ],
  },
  {
    title: 'Who we share it with',
    paragraphs: [
      'Google Firebase (Authentication, Firestore, Storage, Cloud Functions, Cloud Messaging, Crashlytics, and App Check) processes this data on our behalf to run the app. Google Sign-In receives your Google account interaction when you choose that sign-in method.',
      'Course video lessons are delivered through YouTube. When you play a lesson, YouTube may collect device and playback information under Google’s own privacy policy. We do not send your Evolve profile to YouTube.',
      'We do not share your profile, photos, forum messages, or FCM tokens with unrelated third-party advertisers.',
      'We may disclose information if required by law, to protect the safety of a child or other user, or to enforce our terms.',
    ],
  },
  {
    title: 'International processing',
    paragraphs: [
      'Evolve Robotics LLP is based in India. Google Firebase and YouTube may process data on servers outside India, including in the United States. By using the app you understand that your information may be transferred to and stored in those locations, subject to the safeguards those providers apply.',
    ],
  },
  {
    title: 'Account deletion',
    paragraphs: [
      'You can delete your account in the app: Settings → Privacy Settings → Delete Account. Email/password accounts must confirm with the current password.',
      'Deletion removes your Firebase Authentication user, Firestore profile and associated user data (including FCM tokens and learning activity we store for your user id), profile photos in Storage, and local session caches. This cannot be undone.',
      'Class forum messages you already posted may remain in the channel so the class conversation still makes sense, or they may be removed or anonymised as part of our deletion process. Crash logs already sent to Crashlytics are retained according to Firebase defaults.',
      'If a server-side cleanup step is temporarily unavailable, remaining user subcollections are removed by our account-deletion process once the Authentication user is deleted.',
      'You can also email ' +
        SUPPORT_EMAIL +
        ' to request deletion if you cannot use the in-app control.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'The app includes a kids learning track. We collect date of birth to apply an age gate. Learners under 13 need a parent or guardian to complete in-app parental consent before the profile is treated as complete.',
      'We do not use children’s data for advertising, profiling for ads, or sale. We ask only for information needed to run the learning account (including school and grade for the kids track). Parents or guardians can contact us at ' +
        SUPPORT_EMAIL +
        ' to review, correct, or request deletion of a child’s account.',
    ],
  },
  {
    title: 'Security and retention',
    paragraphs: [
      'Access to account data requires a signed-in Firebase session. Network calls to our backend use Firebase App Check where configured. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      'We keep account and profile data until you delete the account or we are required to retain a limited record (for example to complete a deletion request, resolve a forum report, or meet a legal obligation). Crash logs are retained according to Firebase Crashlytics defaults.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      'You can edit profile details and photos in Personal details, change notification preferences, sign out, or delete your account. You may also request access, correction, or deletion by emailing ' +
        SUPPORT_EMAIL +
        '. We may need to verify that the request comes from the account holder or a parent/guardian.',
    ],
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      'We may update this policy when the app’s data practices change. The effective date at the top of this page will change when we do. Continued use of the app after an update means you accept the revised policy. Material changes will be reflected in the in-app Privacy Policy screen and on this public page.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      `${PRIVACY_POLICY_OPERATOR}. Email: ${SUPPORT_EMAIL}. Phone: ${SUPPORT_PHONE}.`,
    ],
  },
];
