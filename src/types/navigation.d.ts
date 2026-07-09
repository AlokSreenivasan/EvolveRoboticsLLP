import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import type { ContinueLearningPlaylist } from '../store/content/types/continueLearningPlaylists.types';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageContinueLearningPlaylists: undefined;
  ManageImportantUpdates: undefined;
  ManageUpcomingEvents: undefined;
  ManageResources: undefined;
  ManageAssignments: undefined;
  ManageExams: undefined;
  ManageQuizCompetitions: undefined;
  ManageCourses: undefined;
  ManageUsers: undefined;
  AdminNotifications: undefined;
  ManageSchools: undefined;
  ManageChatKeywords: undefined;
};

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  About: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  NotificationPreferences: undefined;
  Support: undefined;
  Profile: { requireCompletion?: boolean } | undefined;
  /** Course playlist — lesson list only. */
  CoursePlaylist: { playlist: ContinueLearningPlaylist };
  /** In-app lesson player. */
  CourseVideo: {
    playlist: ContinueLearningPlaylist;
    videoId: string;
    videoTitle: string;
    videoIndex: number;
  };
  /** Course catalog — optional `track` filters kids vs professionals. */
  Courses: { track?: 'kids' | 'professionals' } | undefined;
  /** Full list of continue-learning course video cards from home. */
  ContinueLearningList: undefined;
  /** Full list of in-app announcements from home. */
  NotificationsList: undefined;
  /** PDF study notes from Quick Access → Resources. */
  Resources: undefined;
  /** PDF assignments from Quick Access → Assignments. */
  Assignments: undefined;
  /** Timed exams from Quick Access → Exams. */
  Exams: undefined;
  /** Quiz competitions from Quick Access → Quiz Competition. */
  QuizCompetitions: undefined;
  /** Single quiz attempt screen. */
  QuizAttempt: { quizId: string };
  /** Exam attempt screen for users. */
  ExamAttempt: { examId: string };
  /** User's submitted exam attempts / results. */
  ExamAttempts: undefined;
  ResourcePdfViewer: { title: string; pdfUrl: string };
  /** Registered only for admin users after role resolves. */
  AdminStack: undefined;
  /** Fallback when a non-admin attempts restricted navigation. */
  Unauthorized: undefined;
  /** AI chat assistant — opened from the home screen floating button. */
  ChatbotScreen: undefined;
};

// Navigation prop for a specific screen
export type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Login'
>;

export type AboutScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'About'
>;

// Route prop if you need to read route.params
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
