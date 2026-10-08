// 有人打电话过来时把整台电脑叫醒（执行那一半，规则见 `callAttention.ts`）。
//
// 用户 2026-09-20：「当用三个方式打电话过来需要屏幕里面绿起来，且用当前角色大小打招呼」。
//
// 这里只看一件事：**还有没有正在响、我还没处理的邀请**。有就立刻让所有屏幕绿起来，并让
// 头像条把那个人的角色用**现在这么大**拉出来招手；一通电话要响 30 秒，中途不能黑掉，所以
// 每隔几秒补一次；我接听/婉拒/它超时之后邀请从 `requests` 里消失，这里自然就停了。
import { useEffect, useRef } from 'react';
import { callAttention, CALL_ATTENTION_MS, CALL_GLOW_FADE_MS } from './callAttention';
import type { Person, Request } from './types';
import { sendDockGreeting } from './dockGreeting';

export function useCallAttention(input: { requests: Request[]; people: Person[]; sharing: boolean }) {
  // 计时器只该为"邀请列表变了"重建，所以最新的人与共享状态走 ref（不参与依赖）。
  const latest = useRef(input);
  latest.current = input;
  const key = input.requests.map(row => row.id).join(',');

  useEffect(() => {
    if (!key) return;
    const bridge = typeof window === 'undefined' ? undefined : window.officeDesktop;
    // 浏览器里没有绿光层和头像条（那都是桌面客户端的窗户），也不该在这里空转。
    if (!bridge?.previewGlow && !bridge?.dockGreet) return;
    const fire = () => {
      const call = callAttention(latest.current.requests, latest.current.people);
      if (!call) return;
      // 自己正在共享屏幕时 `previewGlow` 会把绿光收掉——那一圈光会被一起共享出去。
      void bridge.previewGlow?.({ sharing: latest.current.sharing, fade: CALL_GLOW_FADE_MS })
        .catch(() => undefined);
      // 带上邀请本身（id 与种类）：头像条要写清"谁、怎么打过来的"，还要能直接接起来。
      sendDockGreeting({ id: call.id, name: call.name, appearance: call.appearance,
        mode: call.mode, requestId: call.requestId, kind: call.kind, offer: call.offer });
    };
    fire();
    const timer = setInterval(fire, CALL_ATTENTION_MS);
    return () => clearInterval(timer);
  }, [key]);
}

export { CALL_ATTENTION_MS, CALL_GLOW_FADE_MS, callAttention };
