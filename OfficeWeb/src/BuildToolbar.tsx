import { useEffect, useRef, useState } from 'react';
import { catalog, palette, anchorLabels, nextAnchor, type BuildSettings, type BuildMode } from './buildTypes';
import { buildThumbnails } from './buildThumbnails';
import { BuildHeight } from './BuildHeight';
import { buildColor } from './buildColors';

type Props = {
  settings: BuildSettings; onChange: (settings: BuildSettings) => void;
  ready: boolean; busy: boolean; message: string; hint: string;
  sound: boolean; onSound: () => void; onUndo: () => void; undoCount: number;
  onRedo?: () => void; redoCount?: number;
};
export function BuildToolbar(props: Props) {
  const [category, setCategory] = useState('建筑');
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const parts = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = parts.current;
    if (!row) return;
    const scroll = (event: WheelEvent) => {
      if (event.ctrlKey || row.scrollWidth <= row.clientWidth) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? row.clientWidth : 1;
      event.preventDefault();
      event.stopPropagation();
      row.scrollLeft += delta * unit;
    };
    row.addEventListener('wheel', scroll, { passive: false });
    return () => row.removeEventListener('wheel', scroll);
  }, [expanded]);
  const { settings } = props;
  const [thumbnails,setThumbnails] = useState<Record<string,string>>({});
  useEffect(() => {
    if (!expanded) return;
    try { setThumbnails(buildThumbnails(settings.color, search.trim() ? undefined : category)); }
    catch { /* Labels remain usable without a second WebGL context. */ }
  }, [expanded, settings.color, category, Boolean(search.trim())]);
  const change = (value: Partial<BuildSettings>) => props.onChange({ ...settings, ...value });
  const colors = <div className="build-palette" aria-label="部件颜色">{palette.map((color, i) => <button key={color}
        style={{ background: buildColor(color) }} aria-label={`颜色 ${['奶油','陶粉','雾蓝','鼠尾草','淡紫','原木','岩灰'][i]}`}
        aria-pressed={settings.color===color} onClick={() => change({ color })} />)}</div>;
  const modes: [BuildMode, string, string][] = [['explore','↗','漫游'],['place','＋','安装'],['move','↔','移动'],['remove','−','拆除']];
  return <div className="build-ui" aria-label="方块建造工具">
    {expanded && <div className="build-library">
      <div className="build-library-options">
      <div className="build-categories" role="tablist" aria-label="部件分类">
        {[...new Set(catalog.map(item => item.category))].map(name => <button key={name} role="tab" aria-selected={!search && category===name}
          onClick={() => { setCategory(name); setSearch(''); }}>{name}</button>)}</div>
      <input className="build-search" aria-label="搜索部件" placeholder="搜索物品" value={search}
        onChange={event => setSearch(event.target.value)} />
      {settings.mode!=='move' && colors}

      </div>
      <div className="build-parts" ref={parts}>
        {catalog.filter(item => search.trim() ? item.label.includes(search.trim()) : item.category === category).map(item => <button key={item.id}
          className={'build-part' + (settings.kind === item.id ? ' selected' : '')}
          aria-pressed={settings.kind === item.id} title={`宽 × 高 × 深：${item.dimensions.join(' × ')} 米`}
          onClick={() => change({ kind: item.id, mode: 'place' })}>
          {thumbnails[item.id] ? <img className="build-part-image" src={thumbnails[item.id]} alt="" /> :
            <span className={`part-icon part-${item.id}`} style={{ '--part-color': settings.color } as React.CSSProperties}><i /><b /><em /></span>}
          <span>{item.label}</span></button>)}
      </div>
    </div>}
    <div className="build-tools">
      <button className="build-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? '收起部件' : '打开部件库'} {expanded ? '⌄' : '⌃'}</button>
      <div className="build-modes">{modes.map(([mode,icon,label]) => <button key={mode} aria-pressed={settings.mode === mode}
        disabled={mode !== 'explore' && !props.ready} onClick={() => { change({ mode }); if (mode === 'place') setExpanded(true); }}>
        <b>{icon}</b>{label}</button>)}</div>
      {settings.mode==='move' && colors}
      <span className="build-divider" />
      <span className="build-rotation" title="Q/R 左右转 · X 前后翻 · Z 侧翻 · Shift 反向">↻ {settings.rotation*90}° / {(settings.pitch || 0)*90}° / {(settings.roll || 0)*90}°</span>
      <BuildHeight value={settings.height} onChange={height => change({ height })} />
      <button title="C：切换鼠标连接点" onClick={() => change({anchor:nextAnchor(settings.anchor)})}>
        接点 {anchorLabels[settings.anchor || 'auto']}</button>
      <button title="Ctrl+Z：撤销自己的上一步" disabled={!props.undoCount || props.busy || !props.ready} onClick={props.onUndo}>↶ 撤销</button>
      <button title="Ctrl+Shift+Z：重做" disabled={!props.redoCount || props.busy || !props.ready} onClick={props.onRedo}>↷ 重做</button>
      <button aria-label="建造音效" aria-pressed={props.sound} onClick={props.onSound}>{props.sound ? '♪' : '♩'}</button>
      <span className="build-live" title={props.message}><i className={props.ready ? '' : 'offline'} />{props.busy ? '正在保存…' : props.message}</span>
    </div>
  </div>;
}
