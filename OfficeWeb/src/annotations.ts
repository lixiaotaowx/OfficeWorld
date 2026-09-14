// Shared annotation model for drawing over somebody's shared screen.
//
// Everything here is pure so both consumers can use it: the web player draws on a
// canvas above the video, and the desktop app maps the same strokes onto a
// transparent overlay covering the display that is being shared. Points are
// always normalised to the shared image (0..1), never pixels, so a stroke lands in
// the same place for a small window, a fullscreen viewer and the sharer's desktop.
export interface Stroke {
  /** `${senderSocketId}:${strokeId}` — stable while one person keeps drawing. */
  key: string;
  /** Which shared screen this stroke belongs to (`call-…` / `meeting-…`). */
  scope: string;
  clientId: string;
  name: string;
  color: string;
  points: [number, number][];
  done: boolean;
}

export interface AnnotateMessage {
  id: string;
  clientId?: string;
  name?: string;
  scope?: string;
  stroke: string;
  points: [number, number][];
  done?: boolean;
}

export interface ClearMessage {
  id: string;
}

/** A stable, well-spread colour per person, so the same colleague keeps one colour. */
export function colorFor(clientId: string): string {
  let hash = 7;
  for (let index = 0; index < clientId.length; index += 1)
    hash = (hash * 31 + clientId.charCodeAt(index)) % 360;
  return `hsl(${hash} 74% 46%)`;
}

export const strokeKey = (id: string, stroke: string) => `${id}:${stroke}`;

/** Append one relayed message to the board. Pure: returns the same array when nothing changed. */
export function applyAnnotate(strokes: Stroke[], message: AnnotateMessage): Stroke[] {
  if (!message?.id || !message.stroke || !Array.isArray(message.points) || !message.points.length)
    return strokes;
  const key = strokeKey(message.id, message.stroke);
  const clientId = message.clientId || message.id;
  const scope = message.scope || "";
  const index = strokes.findIndex((stroke) => stroke.key === key);
  if (index === -1) {
    if (message.done) return strokes;
    return [...strokes, {
      key, scope, clientId,
      name: message.name || "同事",
      color: colorFor(clientId),
      points: message.points.map((point) => [point[0], point[1]] as [number, number]),
      done: false,
    }];
  }
  const next = strokes.slice();
  next[index] = {
    ...next[index],
    points: [...next[index].points, ...message.points.map((point) => [point[0], point[1]] as [number, number])],
    done: message.done === true,
  };
  return next;
}

/** Only the strokes drawn on one shared screen, so several boards never mix. */
export function strokesFor(strokes: Stroke[], scope: string): Stroke[] {
  return strokes.filter((stroke) => stroke.scope === scope);
}

/** "清空" clears one screen's board for everybody. */
export function applyClear(strokes: Stroke[], scope?: string): Stroke[] {
  const next = scope === undefined ? [] : strokes.filter((stroke) => stroke.scope !== scope);
  return next.length === strokes.length ? strokes : next;
}

export function applyUndo(strokes: Stroke[], clientId: string, scope?: string): Stroke[] {
  for (let index = strokes.length - 1; index >= 0; index -= 1) {
    if (strokes[index].clientId !== clientId) continue;
    if (scope !== undefined && strokes[index].scope !== scope) continue;
    return [...strokes.slice(0, index), ...strokes.slice(index + 1)];
  }
  return strokes;
}

export interface ContentBox { x: number; y: number; width: number; height: number }

/**
 * Where the picture actually sits inside the element. `<video>` is letterboxed by
 * `object-fit: contain`, so drawing on the element box would offset every stroke
 * whenever the window is not exactly the shared aspect ratio.
 */
export function contentBox(element: { clientWidth: number; clientHeight: number },
  mediaWidth: number, mediaHeight: number): ContentBox | null {
  const { clientWidth, clientHeight } = element;
  if (!clientWidth || !clientHeight || !mediaWidth || !mediaHeight) return null;
  const scale = Math.min(clientWidth / mediaWidth, clientHeight / mediaHeight);
  const width = mediaWidth * scale;
  const height = mediaHeight * scale;
  return { x: (clientWidth - width) / 2, y: (clientHeight - height) / 2, width, height };
}

/** Element-relative pixels -> 0..1 of the shared image, or null when outside it. */
export function normalizePoint(
  box: ContentBox, offsetX: number, offsetY: number, slack = 0.02,
): [number, number] | null {
  const x = (offsetX - box.x) / box.width;
  const y = (offsetY - box.y) / box.height;
  if (x < -slack || x > 1 + slack || y < -slack || y > 1 + slack) return null;
  return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
}

/** 0..1 of the shared image -> pixels inside a box (used by the canvas and the overlay). */
export function denormalize(box: ContentBox, x: number, y: number): [number, number] {
  return [box.x + x * box.width, box.y + y * box.height];
}
