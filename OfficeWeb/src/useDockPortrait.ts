import { useEffect, useState } from 'react';
import { decodeDockAppearance, decodeDockExpression } from './dockAppearance';
import { appearanceKey, resolveAppearance, type Appearance } from './look';
import { activityExpression, EXPRESSION_ROOT } from './expressionPortrait';

export function useDockPortrait(appearance: Appearance | undefined, color: string,
  activity: Parameters<typeof activityExpression>[0] = {}) {
  const look = resolveAppearance(appearance ?? decodeDockAppearance(color));
  const expression = activityExpression({ autoExpression: decodeDockExpression(color), ...activity });
  const key = `${appearanceKey(look)}:${expression}`;
  const [image, setImage] = useState<{ key: string; url: string }>();
  useEffect(() => {
    let active = true;
    void import('./expressionPortrait').then(module => module.renderExpressionPortrait(look, expression))
      .then(url => { if (active) setImage({ key, url }); }).catch(() => {});
    return () => { active = false; };
  }, [key]);
  return image?.key === key ? image.url
    : `${EXPRESSION_ROOT}/${expression}.png`;
}


