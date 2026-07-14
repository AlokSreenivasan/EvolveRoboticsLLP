/** Evolve-themed alert copy — warm, learner-journey voice aligned with QuizAlertModal. */

export const appAlertButtons = {
  gotIt: 'Got it',
  continue: 'Continue',
  tryAgain: 'Try again',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  remove: 'Remove',
  logOut: 'Log out',
  reset: 'Reset',
  send: 'Send',
} as const;

export const appAlertCopy = {
  admin: {
    sectionTitleRequired:
      'Add a title for this Home section so learners know what they are viewing.',
    sectionSaved:
      'Section headings are updated. Learners will see the changes on Home right away.',
    screenTitleRequired: (screen: string) =>
      `Add a title for the ${screen} screen learners see in the app.`,
    screenHeadingsSaved: (screen: string) =>
      `${screen} screen headings are updated and ready for learners.`,
    titleRequired: (item: string) => `Every ${item} needs a title before you can save.`,
    headingRequired: (item: string) =>
      `Add a heading (title) for this ${item} so learners can find it easily.`,
    dateRequired: 'Pick an event date for the home card.',
    dateYearRequired: (maxYear: number) =>
      `Choose a valid year from today through ${maxYear}.`,
    invalidDate: (maxYear: number) =>
      `That date is not valid or falls after ${maxYear}.`,
    durationRequired: 'Add how long the course takes (for example, 2h 30m).',
    durationRequiredTitle: 'Duration needed',
    messageRequired:
      'Write the notification message learners will receive.',
    pdfRequired: (item: string) =>
      `Attach a PDF file for this ${item} before publishing.`,
    questionRequired: 'Enter the question prompt learners will answer.',
    allChoicesRequired: (count: number, label: string) =>
      `Fill in all ${count} ${label} before saving.`,
    playlistLinkRequired:
      'Paste a YouTube playlist URL that includes list= in the Playlist URL field.',
    playlistTitleRequired: 'Add a title so learners know what this playlist covers.',
    videoCountRequired:
      'Enter the total number of videos in this YouTube playlist (1–500).',
    trackVisibilityRequired:
      'Choose whether this playlist is visible to kids or professionals.',
    schoolVisibilityRequired: (detail: string) => detail,
    keywordRequired: 'Enter a label for this quick-reply option in chat.',
    schoolNameRequired: 'Enter a name for the partner school.',
    notificationDraftSaved: 'Notification saved as a draft for later.',
    notificationLiveSaved:
      'Notification is live — learners can see it in the app now.',
    cannotSendNotification:
      'Add a title and message before sending this notification live.',
    sendLiveConfirm: (
      title: string,
      category: string,
      audience: string,
    ) =>
      `Send push "${title}" (${category}) to learners at ${audience} who have this notification category enabled?`,
    liveNotificationSent: (delivered: number, total: number, failed: number) =>
      failed > 0
        ? `Delivered to ${delivered} of ${total} device(s). ${failed} could not be reached.`
        : `Delivered to ${delivered} learner device(s).`,
    resetQuizProgressConfirm: (label: string) =>
      `Clear all quiz competition progress for ${label}? They will start again from the first quiz.`,
    resetQuizProgressSuccess: (label: string) =>
      `Quiz progress for ${label} has been cleared. They can begin fresh.`,
    grantAdminConfirm: (label: string) =>
      `Grant admin access to ${label}? They will be able to open the admin dashboard and manage Resources, Assignments, Exams, and Quiz Competition.`,
    revokeAdminConfirm: (label: string) =>
      `Remove admin access from ${label}? They will become a regular user.`,
    roleUpdatedSuccess: (label: string, role: string) =>
      `${label} is now a ${role}.`,
    adminAccessRequired: (uid?: string | null) =>
      `Your account does not have admin access in Evolve.${uid ? `\n\nUID: ${uid}\n\nSet users/${uid}.role to "admin" or "superadmin" in Firebase Console, then sign out and back in.` : ''}`,
    superadminAccessRequired: (uid?: string | null) =>
      `Your account does not have superadmin access in Evolve.${uid ? `\n\nUID: ${uid}\n\nSet users/${uid}.role to "superadmin" in Firebase Console, then sign out and back in.` : ''}`,
    deleteConfirm: (item: string, name: string) =>
      `Remove "${name}" from Evolve? This cannot be undone.`,
    deleteQuestionConfirm: (context: 'quiz' | 'exam') =>
      `Remove this question from the ${context}?`,
    reorderFailed: 'We could not update the order. Please try again.',
    galleryOpenFailed: 'We could not open the photo gallery. Please try again.',
    fileOpenFailed: 'We could not open the file picker. Please try again.',
    thumbnail: (message: string) => message,
    image: (message: string) => message,
    saveFailedTitle: 'Could not save changes',
    deleteFailedTitle: 'Could not delete',
    addFailedTitle: 'Could not add',
    sendFailedTitle: 'Could not send',
    resetFailedTitle: 'Could not reset',
    reorderFailedTitle: 'Could not reorder',
    galleryOpenFailedTitle: 'Could not open gallery',
    fileOpenFailedTitle: 'Could not open file',
    savedTitle: 'All set',
    liveSentTitle: 'Notification sent',
    resetQuizProgressTitle: 'Quiz progress reset',
    roleUpdatedTitle: 'Role updated',
    deleteTitle: (item: string) => `Delete ${item}?`,
    resetQuizProgressConfirmTitle: 'Reset quiz progress?',
    changeRoleConfirmTitle: 'Change role?',
    sendLiveTitle: 'Send live notification?',
    cannotSaveTitle: (item: string) => `Cannot save ${item}`,
    cannotSendTitle: 'Cannot send',
    visibilityRequiredTitle: 'Visibility needed',
    sectionTitleRequiredTitle: 'Section title needed',
    titleNeeded: 'Title needed',
    questionRequiredTitle: 'Question needed',
    choicesRequiredTitle: 'Choices needed',
    dateRequiredTitle: 'Date needed',
    invalidDateTitle: 'Invalid date',
    screenTitleNeeded: 'Screen title needed',
    schoolNameNeeded: 'School name needed',
    keywordNeeded: 'Keyword needed',
    playlistLinkNeeded: 'Playlist link needed',
    videoCountNeeded: 'Video count needed',
    messageRequiredTitle: 'Message needed',
    adminAccessRequiredTitle: 'Admin access required',
    superadminAccessRequiredTitle: 'Superadmin access required',
    headingRequiredTitle: 'Heading needed',
    pdfRequiredTitle: 'PDF needed',
    schoolVisibilityRequiredTitle: 'School visibility needed',
    imageTitle: 'Image',
    thumbnailTitle: 'Thumbnail',
  },
  auth: {
    passwordEmpty:
      'Enter your password to continue your Evolve journey.',
    passwordEmptyTitle: 'Almost there',
    signInFailedTitle: 'Could not sign in',
    googleSignInFailedTitle: 'Google sign-in did not work',
    googleSignInFailedMessage:
      'We could not complete Google sign-in. Please try again.',
    signUpFailedTitle: 'Could not create account',
    signUpFailedMessage: 'Sign up did not complete. Please try again.',
    resetEmailSentTitle: 'Check your inbox',
    resetEmailSentMessage:
      'If an account exists for this email, you will receive a password reset link shortly. Check spam if you do not see it.',
    resetFailedTitle: 'Could not send reset email',
    resetFailedMessage: 'We could not send the reset link. Please try again.',
  },
  learner: {
    profileSaveFailedTitle: 'Profile not saved',
    profileSaveFailedMessage:
      'We could not sync your profile. Please try again.',
    profilePhotoTitle: 'Profile photo',
    passwordUpdatedTitle: 'Password updated',
    passwordUpdatedMessage:
      'Your account is secured with your new password.',
    passwordUpdateFailedTitle: 'Could not update password',
    logoutConfirmTitle: 'Log out of Evolve?',
    logoutConfirmMessage:
      'You will need to sign in again to keep learning.',
    logoutFailedTitle: 'Could not log out',
    logoutFailedMessage: 'Sign out did not complete. Please try again.',
    notificationSaveFailedTitle: 'Preferences not saved',
    notificationSaveFailedMessage:
      'We could not update your notification settings. Please try again.',
    resetPreferencesTitle: 'Reset to defaults?',
    resetPreferencesMessage:
      'All notification preferences will return to their original settings.',
    resetPreferencesFailedTitle: 'Could not reset',
    resetPreferencesFailedMessage:
      'We could not restore default preferences. Please try again.',
    accountDeletedTitle: 'Account deleted',
    accountDeletedMessage:
      'Your Evolve account and data have been permanently removed.',
    accountDeletionFailedTitle: 'Could not delete account',
    accountDeletionFailedMessage:
      'Account deletion did not complete. Please try again.',
    unavailableTitle: 'Not available right now',
    emailAppUnavailable:
      'Could not open your email app. Copy the address and email us directly.',
    phoneDialerUnavailable:
      'Could not open the phone dialer. Call us at the number shown on this screen.',
    examTimeUpTitle: "Time's up!",
    examSubmittedTitle: 'Exam submitted',
    examSubmitFailedTitle: 'Could not submit exam',
    examScoreMessage: (correct: number, total: number, percentage: number) =>
      `You scored ${correct}/${total} (${percentage}%). Keep building your skills.`,
  },
} as const;
