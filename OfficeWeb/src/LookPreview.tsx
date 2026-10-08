import LiveLookPreview from './LiveLookPreview';
import type { Appearance } from './look';

export const THUMB_VERSION = '20260928-fit';
export function thumbUrl(name: string) {
  return `/assets/characters/thumbnails/${name}.png?v=${THUMB_VERSION}`;
}

/** Colour cards show the body; the main view shows the complete outfit. */
export default function LookPreview({ value, size = 'large', face = false }: {
  value: Appearance; size?: 'large' | 'small'; face?: boolean;
}) {
  if (size === 'large') return <LiveLookPreview value={value} face={face} />;
  return <span className="look-preview small" data-color={value.color}>
    <img src={thumbUrl(`full-${value.color}`)} alt="" draggable={false} />
  </span>;
}


