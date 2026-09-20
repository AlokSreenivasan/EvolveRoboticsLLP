import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { RenderRules } from 'react-native-markdown-display';

import {
  extractHtmlImages,
  isHtmlCentered,
  isLikelyBadgeImage,
  stripHtmlTags,
} from './parseMarkdownHtml';

type HtmlImageProps = {
  src: string;
  alt: string;
  compact: boolean;
};

function HtmlImage({ src, alt, compact }: HtmlImageProps) {
  const [aspectRatio, setAspectRatio] = useState(compact ? 4 : 16 / 9);

  return (
    <Image
      source={{ uri: src }}
      accessible={Boolean(alt)}
      accessibilityLabel={alt || undefined}
      resizeMode="contain"
      onLoad={event => {
        const { width, height } = event.nativeEvent.source;
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      }}
      style={
        compact
          ? [styles.badgeImage, { aspectRatio }]
          : [styles.bannerImage, { aspectRatio }]
      }
    />
  );
}

function renderHtmlImages(
  nodeKey: string,
  html: string,
  inline: boolean,
) {
  const images = extractHtmlImages(html);
  if (images.length === 0) {
    return null;
  }

  const compact =
    images.length > 1 || images.some(image => isLikelyBadgeImage(image.src));

  if (inline) {
    return (
      <Text key={nodeKey}>
        {images.map((image, index) => (
          <HtmlImage
            key={`${nodeKey}-img-${index}`}
            src={image.src}
            alt={image.alt}
            compact={compact}
          />
        ))}
      </Text>
    );
  }

  const centered = isHtmlCentered(html);
  return (
    <View
      key={nodeKey}
      style={[
        styles.htmlBlock,
        centered && styles.centered,
        compact && styles.badgeRow,
      ]}>
      {images.map((image, index) => (
        <HtmlImage
          key={`${nodeKey}-img-${index}`}
          src={image.src}
          alt={image.alt}
          compact={compact}
        />
      ))}
    </View>
  );
}

function renderHtmlText(
  nodeKey: string,
  html: string,
  textStyle: object | undefined,
  inline: boolean,
) {
  const trimmed = html.trim();
  if (/^<br\s*\/?>$/i.test(trimmed)) {
    return (
      <Text key={nodeKey} style={textStyle}>
        {'\n'}
      </Text>
    );
  }

  if (/^<hr\s*\/?>$/i.test(trimmed)) {
    if (inline) {
      return (
        <Text key={nodeKey} style={textStyle}>
          {'\n'}
        </Text>
      );
    }
    return <View key={nodeKey} style={styles.hr} />;
  }

  const text = stripHtmlTags(html);
  if (!text) {
    return null;
  }

  return (
    <Text key={nodeKey} style={textStyle}>
      {text}
    </Text>
  );
}

/**
 * Native Markdown image — avoids react-native-fit-image, which throws when
 * the image style has width but no height (a Render Error on project pages).
 */
function renderMarkdownImage(
  node: { key: string; attributes?: Record<string, unknown> },
) {
  const rawSrc = node.attributes?.src;
  const src = typeof rawSrc === 'string' ? rawSrc.trim() : '';
  if (!src) {
    return null;
  }

  const rawAlt = node.attributes?.alt;
  const alt = typeof rawAlt === 'string' ? rawAlt : '';
  const compact = isLikelyBadgeImage(src);

  return (
    <HtmlImage key={node.key} src={src} alt={alt} compact={compact} />
  );
}

/**
 * Renders common GitHub README HTML (centered `<img>` banners/badges/GIFs)
 * that markdown-it emits as html_block / html_inline tokens.
 *
 * html_inline must not return a View — those tokens render inside Text.
 */
export const markdownHtmlRules: RenderRules = {
  html_block: (node, _children, _parent, styles) =>
    renderHtmlImages(node.key, node.content ?? '', false) ??
    renderHtmlText(node.key, node.content ?? '', styles?.text, false),
  html_inline: (node, _children, _parent, styles) =>
    renderHtmlImages(node.key, node.content ?? '', true) ??
    renderHtmlText(node.key, node.content ?? '', styles?.text, true),
  image: node => renderMarkdownImage(node),
};

const styles = StyleSheet.create({
  htmlBlock: {
    width: '100%',
    marginBottom: 14,
  },
  centered: {
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  bannerImage: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  badgeImage: {
    height: 28,
    marginVertical: 4,
    marginHorizontal: 2,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#d0d7de',
    marginVertical: 16,
    width: '100%',
  },
});
