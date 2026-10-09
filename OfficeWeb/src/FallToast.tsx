import { useEffect, useState } from 'react';
import type { DeathInfo } from './avatarFall';
import './fall.css';

/** 「你掉下去了」这张卡在画面里留多久（之后自己消失，状态不必清）。 */
export const FALL_TOAST_MS = 2600;

/**
 * 掉死之后在画面上方**宣布死亡**（用户 2026-10-09：「掉落到最低的部件组合之下就宣布死亡，
 * 然后再掉落前的位置…原地复活」）。
 *
 * 只负责显示：`OfficeScene` 每次掉死换一个 `key` 重新挂一份，计时器自己收自己——不需要父组件
 * 传回调进 effect 依赖（那个坑在 `ChatMonitorContextMenu`/`ChatInbox` 上都踩过）。
 */
export default function FallToast({ info }: { info: DeathInfo }) {
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setAlive(false), FALL_TOAST_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!alive) return null;
  // 落差 = 掉落前那一层减去判死线（掉进深渊时给个"掉了多少米"的读数）。
  const drop = info.deathY === null ? null : Math.max(0, info.from.y - info.deathY);
  return <div className="scene-fall" role="alert">
    <strong>你掉下去了</strong>
    <span>
      已在掉落前的位置复活
      {drop !== null && ` · 落差 ${drop.toFixed(1)} m`}
      {info.deaths > 1 && ` · 第 ${info.deaths} 次`}
    </span>
  </div>;
}
