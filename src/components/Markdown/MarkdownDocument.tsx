import React, { Component, useMemo, type ErrorInfo, type ReactNode } from 'react';
import { Linking, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

import { markdownHtmlRules } from './markdownHtmlRules';
import { markdownDocumentStyles } from './markdownDocumentStyles';
import { rewriteRelativeMarkdownImages } from './resolveMarkdownImageUrl';
import { colors } from '../../constants/theme';

type MarkdownDocumentProps = {
  content: string;
  /** Optional URL the markdown was loaded from (used to resolve relative images). */
  documentUrl?: string | null;
  style?: ViewStyle;
};

type MarkdownErrorBoundaryState = {
  hasError: boolean;
};

class MarkdownErrorBoundary extends Component<
  { children: ReactNode },
  MarkdownErrorBoundaryState
> {
  state: MarkdownErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MarkdownErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Keep the project screen mounted; markdown is optional content.
  }

  render() {
    if (this.state.hasError) {
      return (
        <Text style={styles.fallback}>
          This project page could not be displayed.
        </Text>
      );
    }
    return this.props.children;
  }
}

// html: true so GitHub README raw HTML (<img>, centered <p>) is tokenized
// instead of shown as literal text. Images are rendered via markdownHtmlRules.
const markdownIt = MarkdownIt({
  html: true,
  typographer: true,
  linkify: true,
}).enable(['table', 'strikethrough']);

function handleLinkPress(url: string): boolean {
  const trimmed = url?.trim();
  if (!trimmed) {
    return false;
  }

  Linking.openURL(trimmed).catch(() => {
    // Ignore failed opens (unsupported schemes, offline, etc.).
  });
  return false;
}

/**
 * Native Markdown reader with GitHub-like typography and spacing.
 */
function MarkdownDocument({
  content,
  documentUrl,
  style,
}: MarkdownDocumentProps) {
  const body = useMemo(() => {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const withoutBom = source.replace(/^\uFEFF/, '');
    return rewriteRelativeMarkdownImages(withoutBom, documentUrl);
  }, [content, documentUrl]);

  if (!body.trim()) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <MarkdownErrorBoundary key={`${documentUrl ?? ''}:${body.length}`}>
        <Markdown
          style={markdownDocumentStyles}
          markdownit={markdownIt}
          rules={markdownHtmlRules}
          onLinkPress={handleLinkPress}
          mergeStyle>
          {body}
        </Markdown>
      </MarkdownErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fallback: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default MarkdownDocument;
