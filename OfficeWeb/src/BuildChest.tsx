import { useEffect, useState } from 'react';
import { buildRequest } from './useBuildWorld';
import type { ChestEntry } from './buildTypes';
import { createPortal } from 'react-dom';
import { chestVideo } from './chestVideo';
import { ChestCover } from './ChestCover';
import { ChestVideoPlayer } from './ChestVideoPlayer';
import { ChestPeople } from './ChestPeople';
import type { ChestPeople as People } from './buildTypes';
import { useChestScroll } from './useChestScroll';
import './chest.css';

async function imageData(file: File) {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 20*1024*1024)
    throw Error('请选择 20 MB 以内的 PNG、JPEG 或 WebP 图片');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1000/Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(bitmap.width*scale));
    canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let data = canvas.toDataURL('image/webp',0.8);
    for (let attempt = 0; data.length > 220000 && attempt < 5; attempt++) {
      canvas.width = Math.max(1,Math.round(canvas.width*0.8));
      canvas.height = Math.max(1,Math.round(canvas.height*0.8));
      canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
      data = canvas.toDataURL('image/webp',0.7);
    }
    if (data.length > 220000) throw Error('图片内容较复杂，请选择更小的图片');
    return data;
  } finally { bitmap.close(); }
}
/** 链接条目只显示站点，避免整条 URL 把标题挤走。 */
function linkHost(value: string) {
  try { return new URL(value).host.replace(/^www\./, ''); } catch { return value; }
}
export function BuildChest({ id, accountId, onClose }: { id: string; accountId: string; onClose: () => void }) {
  const [entries, setEntries] = useState<ChestEntry[]>([]);
  const [type, setType] = useState<ChestEntry['type']>('link');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [watching, setWatching] = useState<ChestEntry | null>(null);
  const [people, setPeople] = useState<People>({ readers: [] });
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const scroll = useChestScroll(entries.length);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let marked = false;
    async function refresh() {
      try {
        const data = await buildRequest(`?chest=${encodeURIComponent(id)}`);
        if (!stopped) {
          setEntries(data.entries);
          setPeople(data.people || { readers: [] });
          if (!marked) {
            const result = await buildRequest('', { action: 'read', id }); marked = true;
            const updated = result.parts?.find((p: { id: string }) => p.id === id)?.chestPeople;
            if (!stopped && updated) setPeople(updated);
          }
        }
      } catch (e) { if (!stopped) setError((e as Error).message); }
      if (!stopped) timer = setTimeout(refresh,5000);
    }
    void refresh();
    return () => { stopped = true; clearTimeout(timer); };
  }, [id]);
  async function submit(command: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await buildRequest('', { ...command, id });
      setEntries((await buildRequest(`?chest=${encodeURIComponent(id)}`)).entries);
      if (command.action === 'put') { setTitle(''); setValue(''); }
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="build-chest-backdrop" onClick={onClose}>
    {watching && createPortal(<ChestVideoPlayer key={watching.id} entry={watching} onClose={() => setWatching(null)} />, document.body)}
    <section className="build-chest" role="dialog" aria-modal="true" aria-label="共享宝箱" onClick={event => event.stopPropagation()}>
      <div className="build-chest-heading">
        <div><small>SHARED TREASURES</small><h2>共享宝箱</h2><p>把值得留住的东西，放在这里。</p></div>
        <div className="chest-heading-side">
          <span className="chest-total">{entries.length} / 30 项</span>
          <button aria-label="关闭宝箱" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="build-chest-body">
        <div className="chest-main">
          <ChestPeople people={people} />
          {scroll.overflow && <p className="chest-scroll-hint" role="status">↓ 还有更多内容，向下滚动查看 · 共 {entries.length} 项</p>}
          <div className="build-chest-items" ref={scroll.ref} tabIndex={0} aria-label="宝箱内容">
            {!entries.length && <div className="chest-empty"><span>◇</span><strong>第一件宝物，会是什么？</strong><p>链接、灵感图片，或者给同事的一张便签。</p></div>}
            {entries.map(entry => {
              const video = entry.type === 'link' ? chestVideo(entry.value) : undefined;
              const open = Boolean(opened[entry.id]);
              return <article key={entry.id}>
                {entry.type === 'image'
                  ? <a className="chest-thumb" href={entry.value} download={`${entry.title}.webp`}><img src={entry.value} alt={entry.title} /></a>
                  : video
                    ? <ChestCover value={entry.value} title={entry.title} platform={video.platform} onOpen={() => setWatching(entry)} />
                    : <span className="chest-glyph" aria-hidden="true">{entry.type === 'link' ? '↗' : '≡'}</span>}
                <div className="chest-entry">
                  <strong>{entry.type === 'link'
                    ? <a href={entry.value} target="_blank" rel="noopener noreferrer">{entry.title}</a>
                    : entry.title}</strong>
                  {entry.type === 'note' && <>
                    <p className={'chest-note' + (open ? ' open' : '')}>{entry.value}</p>
                    {entry.value.length > 120 && <button className="chest-more" onClick={() => setOpened(list => ({ ...list, [entry.id]: !list[entry.id] }))}>{open ? '收起' : '展开全文'}</button>}
                  </>}
                  {entry.type === 'link' && <span className="chest-url">{linkHost(entry.value)}</span>}
                  <div className="chest-foot">
                    <small className="chest-meta">{entry.author} · {new Date(entry.at).toLocaleDateString()}</small>
                    <div className="chest-actions">
                      {video && <button className="chest-watch" onClick={() => setWatching(entry)}>▶ {video.platform}观看</button>}
                      {entry.owner === accountId && <button disabled={busy} onClick={() => void submit({ action: 'take', entryId: entry.id })}>移除</button>}
                    </div>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </div>
        <aside className="chest-rail">
        <form className="build-chest-form" onSubmit={event => { event.preventDefault(); void submit({ action: 'put', entry: { type, title, value } }); }}>
          <h3>放进宝箱</h3>
          <div className="build-entry-types">{(['link','image','note'] as const).map(kind => <button disabled={busy} type="button" key={kind} aria-pressed={type===kind}
            onClick={() => { setType(kind); setValue(''); setError(''); }}>{({ link:'↗ 链接',image:'▧ 图片',note:'≡ 便签' })[kind]}</button>)}</div>
          <input disabled={busy} aria-label="宝物标题" placeholder="给它起个名字" value={title} maxLength={100} required onChange={event => setTitle(event.target.value)} />
          {type === 'image' ? <label className="build-upload">{value ? '✓ 图片已准备好 · 点击重选' : '选择图片 · 自动压缩至轻量尺寸'}<input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" onChange={async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try { setValue(await imageData(file)); if (!title) setTitle(file.name.slice(0,100)); setError(''); }
            catch (e) { setError((e as Error).message); }
            finally { setBusy(false); }
          }} /></label> : <textarea disabled={busy} aria-label="宝物内容" placeholder={type==='link' ? 'https://…' : '写点什么，留给一起搭建的人…'} value={value} required maxLength={type==='link' ? 2048 : 4000} onChange={event => setValue(event.target.value)} />}
          {error && <p role="alert" className="build-error">{error}</p>}
          <button className="build-submit" disabled={busy || !value || !title}>{busy ? '正在保存…' : '＋ 放进宝箱'}</button>
          <small>空间内所有人可查看；你可以移除自己放入的内容。</small>
        </form>
        </aside>
      </div>
    </section>
  </div>;
}
