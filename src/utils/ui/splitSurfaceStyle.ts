import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Layout props belong on the outer shadow shell so elevation hugs the rounded
 * surface. Content props (padding, border, background) belong on the inner fill.
 */
const SHELL_STYLE_KEYS = new Set([
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'alignSelf',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'zIndex',
]);

export function splitSurfaceStyle(style: StyleProp<ViewStyle> | undefined): {
  shell: ViewStyle;
  content: ViewStyle;
} {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const shell: ViewStyle = {};
  const content: ViewStyle = {};

  (Object.keys(flat) as (keyof ViewStyle)[]).forEach(key => {
    const value = flat[key];
    if (value === undefined) {
      return;
    }

    if (SHELL_STYLE_KEYS.has(key)) {
      (shell as Record<string, unknown>)[key] = value;
      return;
    }

    (content as Record<string, unknown>)[key] = value;

    // Keep the shadow shell fill in sync so Android elevation follows the radius.
    if (key === 'backgroundColor') {
      (shell as Record<string, unknown>).backgroundColor = value;
    }
  });

  return { shell, content };
}
