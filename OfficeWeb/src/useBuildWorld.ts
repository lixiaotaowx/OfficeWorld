import { updateBuildWorkstations } from './buildWorkstations';
import { useEffect, useRef, useState } from 'react';
import type { BuildSnapshot } from './buildTypes';
import { BuildHistory, type HistoryMode } from './buildHistory';
import {buildRequest} from './buildRequest';
export {buildRequest} from './buildRequest';

export function useBuildWorld() {
  const [world, setWorld] = useState<BuildSnapshot>({ revision: -1, parts: [] });
  const revision = useRef(-1);
  const [message, setMessage] = useState('正在连接共享空间…');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const history = useRef(new BuildHistory());
  const [counts, setCounts] = useState(history.current.counts);
  const lastSent = useRef(0);
  function apply(next: BuildSnapshot) {
    if (next.revision > revision.current) {
      revision.current = next.revision;
      updateBuildWorkstations(next.parts);
      setWorld({ revision: next.revision, parts: next.parts });
    }
  }
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const next = await buildRequest(`?revision=${revision.current}`);
        if (!stopped) {
          if (!next.unchanged) apply(next);
          setReady(true);
          setMessage(old => /连接|离线/.test(old) ? '共享空间已连接 · 自动保存' : old);
        }
      } catch {
        if (!stopped) { setReady(false); setMessage('连接中断，重连后继续建造'); }
      }
      if (!stopped) timer = setTimeout(refresh, document.hidden ? 10000 : 2000);
    }
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, []);
  async function mutate(command: Record<string, unknown>, mode: HistoryMode = 'normal') {
    if (pending.current || !ready) {
      setMessage(pending.current ? '上一件正在保存，请稍候' : '连接恢复后可继续建造');
      return false;
    }
    pending.current = true;
    setBusy(true);
    try {
      const delay=Math.max(0,150-(Date.now()-lastSent.current));
      if(delay) await new Promise(resolve=>setTimeout(resolve,delay));
      lastSent.current=Date.now();
      const next = await buildRequest('', command);
      apply(next);
      history.current.accept(command,next,mode);
      setCounts(history.current.counts);
      setMessage('已保存 · 所有人可见');
      return next;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '未保存，请重试');
      return false;
    } finally { pending.current = false; setBusy(false); }
  }
  async function undo() {
    const command = history.current.peek('undo');
    if(command) await mutate(command,'undo');
  }
  async function redo() {
    const command=history.current.peek('redo');
    if(command) await mutate(command,'redo');
  }
  return { world, message, setMessage, ready, busy, mutate, undo, redo, ...counts };
}
