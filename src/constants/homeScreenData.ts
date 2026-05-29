import { colors } from './theme';

export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  type: string;
  accentColor: string;
  backgroundColor: string;
  iconName: 'video' | 'flask' | 'message' | 'clipboard';
};

export type QuickAccessItem = {
  id: string;
  label: string;
  iconName:
    | 'graduation'
    | 'play'
    | 'clipboard'
    | 'file'
    | 'folder'
    | 'grid';
  iconColor: string;
  backgroundColor: string;
};

export const HERO_SLIDES = [
  {
    id: '1',
    headline: 'Explore. Learn.',
    highlight: 'Build. Innovate.',
    subtitle:
      'Advance your robotics skills with our expert-led courses.',
    cta: 'Browse Courses',
  },
  {
    id: '2',
    headline: 'Master the',
    highlight: 'Future of Tech.',
    subtitle: 'Hands-on labs and live sessions with industry mentors.',
    cta: 'Start Learning',
  },
  {
    id: '3',
    headline: 'Join Live',
    highlight: 'Robotics Labs.',
    subtitle: 'Build real projects with guided step-by-step workshops.',
    cta: 'View Schedule',
  },
  {
    id: '4',
    headline: 'Compete.',
    highlight: 'Collaborate. Win.',
    subtitle: 'Prepare for hackathons and school robotics competitions.',
    cta: 'Explore Events',
  },
];

export const TODAYS_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    time: '10:00 AM',
    title: 'Robotics Basics',
    type: 'Live Class',
    accentColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
    iconName: 'video',
  },
  {
    id: '2',
    time: '12:30 PM',
    title: 'Sensor Lab',
    type: 'Lab Session',
    accentColor: colors.primary,
    backgroundColor: colors.primaryLight,
    iconName: 'flask',
  },
  {
    id: '3',
    time: '3:00 PM',
    title: 'AI Discussion',
    type: 'Group Chat',
    accentColor: '#FF9800',
    backgroundColor: '#FFF8F0',
    iconName: 'message',
  },
  {
    id: '4',
    time: '5:00 PM',
    title: 'Assignment Review',
    type: 'Assignment',
    accentColor: '#9C27B0',
    backgroundColor: '#F9F0FC',
    iconName: 'clipboard',
  },
];

export const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    id: 'courses',
    label: 'Courses',
    iconName: 'graduation',
    iconColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  {
    id: 'live',
    label: 'Live Classes',
    iconName: 'play',
    iconColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  {
    id: 'assignments',
    label: 'Assignments',
    iconName: 'clipboard',
    iconColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  {
    id: 'exams',
    label: 'Exams',
    iconName: 'file',
    iconColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  {
    id: 'resources',
    label: 'Resources',
    iconName: 'folder',
    iconColor: colors.primaryDark,
    backgroundColor: colors.primaryLight,
  },
  {
    id: 'more',
    label: 'More',
    iconName: 'grid',
    iconColor: '#6B7280',
    backgroundColor: '#F3F4F6',
  },
];

