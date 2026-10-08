import { useEffect, useState } from 'react';
import type { ChestEntry } from './buildTypes';
import { chestVideo } from './chestVideo';
import { buildRequest } from './useBuildWorld';
import './chestVideo.css';
import { ChestVideoFrame } from './ChestVideoFrame';

export function ChestVideoPlayer({ entry, onClose }: { entry: ChestEntry; onClose: () => void }) {
  const [value, setValue] = useState(entry.value);
  const [maximized, setMaximized] = useState(false);
  const [resolving, setResolving] = useState(false);
  const info = chestVideo(value);
  useEffect(() => {
    const host = new URL(entry.value).hostname;
    if (!['b23.tv', 'v.douyin.com'].includes(host)) return;
    let stopped = false;
    setResolving(true);
    buildRequest('?resolveLink=' + encodeURIComponent(entry.value))
      .then(data => { if (!stopped && typeof data.url === 'string') setValue(data.url); })
      .catch(() => {})
      .finally(() => { if (!stopped) setResolving(false); });
    return () => { stopped = true; };
  }, [entry.value]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (maximized) setMaximized(false); else onClose();
    };
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, [maximized, onClose]);
  return <div className={'chest-video-backdrop' + (maximized ? ' maximized' : '')} onClick={event => { event.stopPropagation(); onClose(); }}>
    <section className={'chest-video-window' + (info?.portrait ? ' portrait' : '')}
      role="dialog" aria-modal="true" aria-label="宝箱视频" onClick={event => event.stopPropagation()}>
      <header><strong>{info?.platform} · {entry.title}</strong>
        <button onClick={() => setMaximized(!maximized)}>{maximized ? '还原窗口' : '最大化'}</button>
        <button aria-label="关闭视频" onClick={onClose}>×</button></header>
      {resolving ? <p className="chest-video-message">正在解析视频链接…</p> : info?.embed ?
        <ChestVideoFrame title={entry.title + '播放器'} src={info.embed} portrait={info.portrait} /> :
        <p className="chest-video-message">{info?.message || '暂时无法内嵌此链接。'}</p>}
      <footer><span>{info?.embed ? '点击播放器内的播放 / 暂停按钮；无法播放时可打开原页。' : '原链接始终保留。'}</span>
        <a href={entry.value} target="_blank" rel="noopener noreferrer">打开原页 ↗</a></footer>
    </section>
  </div>;
}
