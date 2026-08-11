import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import type { ContinueLearningPlaylist } from '../store/content/types/continueLearningPlaylists.types';
import type { Course } from '../store/content/types/courses.types';
import type { Project } from '../store/content/types/projects.types';

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
  ManageRoles: undefined;
  ManageUsers: undefined;
  AdminNotifications: undefined;
  ManageSchools: undefined;
  ManageChatKeywords: undefined;
  ManageProjects: undefined;
};

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  About: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  /** To Do hub — Learn and Project tabs. */
  ToDo: { tab?: 'learn' | 'project' } | undefined;
  /** Published projects from To Do → Projects. */
  Projects: undefined;
  /** Full project requirements from Projects list. */
  ProjectDetail: { project: Project };
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
  /** Full course details from the catalog. */
  CourseDetail: { course: Course };
  /** Full list of lesson playlists from Home and To Do. */
  ContinueLearningList: undefined;
  /** Full list of in-app announcements from home. */
  NotificationsList: undefined;
  /** Full list of Important Updates notices from home. */
  ImportantUpdatesList: undefined;
  /** Full list of Upcoming Events from home. */
  UpcomingEventsList: undefined;
  /** PDF study notes from Quick Access → Resources. */
  Resources: undefined;
  /** PDF assignments from Quick Access → Assignments. */
  Assignments: undefined;
  /** Timed exams from Quick Access → Exams. */
  Exams: undefined;
  /** Class forum hub — students auto-enter their school+grade; admins browse all. */
  ChatForum: undefined;
  /** Live class forum channel thread. */
  ChatForumChannel: { channelId: string; title?: string };
  /** Quiz competitions from Quick Access → Quiz Competition. */
  QuizCompetitions: undefined;
  /** Single quiz attempt screen. */
  QuizAttempt: { quizId: string; startRetry?: boolean };
  /** Exam attempt screen for users. */
  ExamAttempt: { examId: string };
  /** User's submitted exam attempts / results. */
  ExamAttempts: undefined;
  ResourcePdfViewer: {
    title: string;
    pdfUrl: string;
    /** Defaults to true. Set false for assignment PDFs. */
    showOpenInBrowser?: boolean;
  };
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
