/**
 * Blends a hex color onto white and returns an opaque `rgb()` value.
 *
 * Opacity matters for stacked surfaces: a translucent button face would let the
 * raised bottom edge bleed through it instead of covering it.
 *
 * @param strength share of the source color kept — `1` returns it unchanged,
 * `0` returns white.
 */
export function softenColor(hex: string, strength: number): string {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map(char => char + char)
          .join('')
      : raw;

  const channel = (offset: number) => {
    const value = parseInt(full.slice(offset, offset + 2), 16);
    if (Number.isNaN(value)) {
      return 255;
    }
    return Math.max(0, Math.min(255, Math.round(255 + (value - 255) * strength)));
  };

  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
}
