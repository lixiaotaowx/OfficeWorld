import { resolveAppearance, type Appearance } from './look';
import type { DockPerson } from './dockRules';
import { EXPRESSION_IDS, type AvatarExpression } from './look';

/** Carry server activity through installed bridges that only retain character. */
export function decodeDockExpression(value: string): AvatarExpression | undefined {
  if (!value.startsWith('look:')) return;
  try {
    const expression = JSON.parse(value.slice(5)).autoExpression;
    return EXPRESSION_IDS.includes(expression) ? expression : undefined;
  } catch { return; }
}

/** The roster survives older desktop bridges that omit greeting appearance. */
export function greetingAppearance(appearance: Appearance | undefined, person?: DockPerson): Appearance {
  if (appearance) return resolveAppearance(appearance);
  if (person?.appearance) return resolveAppearance(person.appearance);
  if (person?.character.startsWith('look:')) return decodeDockAppearance(person.character);
  return resolveAppearance(appearance ?? decodeDockAppearance(person?.character ?? ''));
}

/** Installed desktop bridges preserve character strings but strip new object fields. */
export function decodeDockAppearance(value: string): Appearance {
  if (!value.startsWith('look:')) return resolveAppearance({ color: value });
  try { return resolveAppearance(JSON.parse(value.slice(5))); }
  catch { return resolveAppearance(undefined); }
}

