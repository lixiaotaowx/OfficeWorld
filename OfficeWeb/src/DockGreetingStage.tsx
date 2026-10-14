import { useEffect, useRef, useState } from 'react';
import { appearanceKey, resolveAppearance, type Appearance } from './look';
import { GREET_CANVAS, type GreetMode } from './dockRules';
export default function DockGreetingStage({ id, appearance, size: mode, name }: {
  appearance?: Appearance; size: GreetMode; name: string; id: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const size = GREET_CANVAS[mode];
  // 外观对象每次推送都是新对象，用指纹当依赖，别让 effect 空转。
  const look = appearanceKey(resolveAppearance(appearance));
  useEffect(() => {
    let stage: { dispose: () => void } | undefined;
    let cancelled = false;
    if (!canvas.current) return;
    const target = canvas.current;
    setFailed(false);
    void import('./dockStage')
      .then(module => cancelled ? undefined : module.mountDockStage(target, { appearance: resolveAppearance(appearance), size: mode }))
      .then(mounted => { if (cancelled) mounted?.dispose(); else stage = mounted; })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; stage?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look, mode]);
  return <div className={`dock-stage ${mode}`} role="img"
    aria-label={`${name || '同事'} 来看你了`} data-greeting={id} data-mode={mode}>
    <canvas ref={canvas} width={size.width} height={size.height} />
    {failed && <span className="dock-stage-name">{name || '同事'} 来看你了</span>}
  </div>;
}

