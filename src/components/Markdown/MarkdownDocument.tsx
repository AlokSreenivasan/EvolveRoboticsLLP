import React, { useMemo } from 'react';
import { Linking, StyleSheet, View, type ViewStyle } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

import { markdownHtmlRules } from './markdownHtmlRules';
import { markdownDocumentStyles } from './markdownDocumentStyles';
import { rewriteRelativeMarkdownImages } from './resolveMarkdownImageUrl';

type MarkdownDocumentProps = {
  content: string;
  /** Optional URL the markdown was loaded from (used to resolve relative images). */
  documentUrl?: string | null;
  style?: ViewStyle;
};

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
    const withoutBom = content.replace(/^\uFEFF/, '');
    return rewriteRelativeMarkdownImages(withoutBom, documentUrl);
  }, [content, documentUrl]);

  if (!body.trim()) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Markdown
        style={markdownDocumentStyles}
        markdownit={markdownIt}
        rules={markdownHtmlRules}
        onLinkPress={handleLinkPress}
        mergeStyle>
        {body}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default MarkdownDocument;
