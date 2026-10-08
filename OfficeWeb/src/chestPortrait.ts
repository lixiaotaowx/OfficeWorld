import { renderExpressionPortrait } from './expressionPortrait';
import { resolveAppearance } from './look';
import type { ChestPerson } from './buildTypes';
export function chestPortrait(person: ChestPerson) {
  return renderExpressionPortrait(resolveAppearance(person.appearance), 'happy');
}
