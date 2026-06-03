import { colors } from './theme';

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

/** Hidden from home quick access until those flows ship. */
export const QUICK_ACCESS_HIDDEN_IDS = new Set(['live', 'more']);

export const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
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

