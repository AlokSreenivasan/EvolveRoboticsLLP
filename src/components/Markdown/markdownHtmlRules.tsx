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

function renderHtmlContent(
  nodeKey: string,
  html: string,
  textStyle: object | undefined,
) {
  const images = extractHtmlImages(html);

  if (images.length > 0) {
    const centered = isHtmlCentered(html);
    const compact =
      images.length > 1 || images.some(image => isLikelyBadgeImage(image.src));

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

  const trimmed = html.trim();
  if (/^<br\s*\/?>$/i.test(trimmed)) {
    return (
      <Text key={nodeKey} style={textStyle}>
        {'\n'}
      </Text>
    );
  }

  if (/^<hr\s*\/?>$/i.test(trimmed)) {
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
 * Renders common GitHub README HTML (centered `<img>` banners/badges/GIFs)
 * that markdown-it emits as html_block / html_inline tokens.
 */
export const markdownHtmlRules: RenderRules = {
  html_block: (node, _children, _parent, styles) =>
    renderHtmlContent(node.key, node.content ?? '', styles?.text),
  html_inline: (node, _children, _parent, styles) =>
    renderHtmlContent(node.key, node.content ?? '', styles?.text),
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
