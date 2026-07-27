import { Platform, StyleSheet } from 'react-native';

import { colors } from '../../constants/theme';

const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/**
 * GitHub-inspired markdown reading styles for native Views
 * (react-native-markdown-display). Tuned to Evolve theme tokens.
 */
export const markdownDocumentStyles = StyleSheet.create({
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 26,
  },

  heading1: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginTop: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heading2: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: 24,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heading3: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  heading4: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 6,
  },
  heading5: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  heading6: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 4,
  },

  hr: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },

  strong: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  em: {
    fontStyle: 'italic',
  },
  s: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },

  blockquote: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderLeftWidth: 4,
    marginVertical: 12,
    marginLeft: 0,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  paragraph: {
    marginTop: 0,
    marginBottom: 14,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },

  bullet_list: {
    marginBottom: 14,
  },
  ordered_list: {
    marginBottom: 14,
  },
  list_item: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bullet_list_icon: {
    color: colors.textPrimary,
    marginLeft: 4,
    marginRight: 10,
    lineHeight: 26,
  },
  ordered_list_icon: {
    color: colors.textPrimary,
    marginLeft: 4,
    marginRight: 10,
    lineHeight: 26,
  },
  bullet_list_content: {
    flex: 1,
  },
  ordered_list_content: {
    flex: 1,
  },

  code_inline: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 14,
    fontFamily: mono,
  },
  code_block: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: mono,
  },
  fence: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: mono,
  },

  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#f6f8fa',
  },
  tbody: {},
  th: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tr: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
  },

  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  blocklink: {
    flex: 1,
    borderColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  image: {
    width: '100%',
    minHeight: 160,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: colors.background,
  },

  text: {
    color: colors.textPrimary,
  },
  textgroup: {},
});
