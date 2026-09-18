// 任务栏头像条（小窗里的页面）。
//
// 它只做两件事：把主窗口推来的状态画成一排头像；把鼠标悬停/点击变成"要一帧""发起邀请"
// 的请求发回去。不连 socket、不认识业务（用户 2026-09-17 定的方案 B）。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CHARACTERS } from './characters';
import { previewPlaceholder, dockInteractive, type DockPerson, type DockState } from './dockRules';
import { PersonIcon, PhoneIcon, PreviewIcon, ScreenIcon } from './icons';
import './dock.css';

const EMPTY: DockState = { people: [], sharing: false, missed: 0, hidden: false };
/** 悬停多久还没等到画面就显示占位说明。 */
const PLACEHOLDER_MS = 900;

const avatarFor = (character: string) =>
  CHARACTERS.find(item => item.id === character)?.thumb || '';

function initials(name: string) {
  return (name || '?').trim().slice(0, 1);
}

function Dock() {
  const [state, setState] = useState<DockState>(EMPTY);
  const [hovered, setHovered] = useState('');
  const [frames, setFrames] = useState<Record<string, string>>({});
  const [waiting, setWaiting] = useState(false);
  const hoveredRef = useRef('');
  hoveredRef.current = hovered;

  useEffect(() => {
    const dock = window.officeDock;
    if (!dock) return;
    let live = true;
    void dock.state?.().then(next => { if (live && next) setState(next as DockState); }).catch(() => undefined);
    const offState = dock.onState?.(next => setState((next as DockState) || EMPTY));
    const offPreview = dock.onPreview?.(({ id, image }) => {
      if (!id) return;
      setFrames(old => ({ ...old, [id]: image || '' }));
    });
    return () => { live = false; offState?.(); offPreview?.(); };
  }, []);

  // 悬停：先要一帧；等不到就给一句解释。
  useEffect(() => {
    if (!hovered) { setWaiting(false); return; }
    window.officeDock?.requestPreview?.(hovered);
    setWaiting(true);
    const timer = setTimeout(() => setWaiting(false), PLACEHOLDER_MS);
    return () => clearTimeout(timer);
  }, [hovered]);

  const person = useMemo(
    () => state.people.find(row => row.id === hovered) || null, [state.people, hovered]);
  const image = hovered ? frames[hovered] : '';

  const act = useCallback((kind: 'watch' | 'share' | 'call') => {
    if (!hoveredRef.current) return;
    void window.officeDock?.action?.(kind, hoveredRef.current);
    setHovered('');
  }, []);

  // 透明的地方不该抢任务栏的点击：指针在头像条/卡片上才让窗口接管鼠标事件。
  // 窗口开着 forward，穿透状态下我们照样能收到 mousemove，所以进/出都能算准。
  const interactive = useRef(false);
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const rect = (node: Element | null) => {
        if (!node) return null;
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      };
      const next = dockInteractive(rect(document.querySelector('.dock')),
        rect(document.querySelector('.dock-card')), event.clientX, event.clientY);
      if (next === interactive.current) return;
      interactive.current = next;
      void window.officeDock?.setInteractive?.(next);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', () => onMove({ clientX: -1, clientY: -1 } as MouseEvent));
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  if (state.hidden) return null;
  return <div className={`dock ${state.edge === 'top' ? 'edge-top' : ''}`} role="toolbar"
    aria-label="同事头像条">
    <span className="dock-grip" title="拖动可以调整位置" aria-hidden="true">⠿</span>
    {state.people.length === 0 && <span className="dock-empty">现在没有其他人在线</span>}
    {state.people.map(row => <DockAvatar key={row.id} person={row}
      onEnter={() => setHovered(row.id)} onLeave={() => setHovered(current => current === row.id ? '' : current)} />)}
    {person && <div className={`dock-card ${image ? 'has-image' : ''}`} role="dialog"
      aria-label={`${person.name} 的屏幕预览`}>
      <div className="dock-shot">
        {image
          ? <img src={image} alt={`${person.name} 的屏幕小图`} />
          : <span className="dock-shot-empty">{previewPlaceholder(person, !waiting)}</span>}
      </div>
      <div className="dock-card-actions">
        <button type="button" title="请求观看对方屏幕" onClick={() => act('watch')}><PreviewIcon /></button>
        <button type="button" title="把我的屏幕分享给对方" onClick={() => act('share')}><ScreenIcon /></button>
        <button type="button" title="邀请语音通话" onClick={() => act('call')}><PhoneIcon /></button>
      </div>
      <div className="dock-card-name">{person.name}</div>
    </div>}
  </div>;
}

function DockAvatar({ person, onEnter, onLeave }: {
  person: DockPerson; onEnter: () => void; onLeave: () => void;
}) {
  const thumb = avatarFor(person.character);
  const badges = [person.missed ? '未接来电' : '', person.unread ? `${person.unread} 条未读` : '',
    person.sharing ? '正在共享屏幕' : '', person.atDesk ? '在座' : '离座'].filter(Boolean);
  return <button type="button" className={`dock-avatar ${person.atDesk ? 'here' : 'away'}`}
    onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}
    title={`${person.name} · ${badges.join(' · ')}`} aria-label={person.name}>
    {thumb ? <img src={thumb} alt="" /> : <span className="dock-initial">{initials(person.name)}</span>}
    <i className={`dock-dot ${person.atDesk ? 'here' : 'away'}`} aria-hidden="true" />
    {person.sharing && <i className="dock-sharing" aria-hidden="true"><ScreenIcon /></i>}
    {(person.missed || person.unread > 0) && <b className="dock-unread">{person.missed ? '!' : (person.unread > 99 ? '99+' : person.unread)}</b>}
  </button>;
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<Dock />);
