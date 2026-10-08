import { useEffect, useRef, useState } from 'react';
import CharacterSetting from './CharacterSetting';
import FileReceiveSetting from './FileReceiveSetting';
import NotificationSetting from './NotificationSetting';
import { WORKSTATIONS, workstationAt } from './seats';
import type { Appearance } from './look';

const PAGES = [
  ['look', '我的角色', '配色与穿搭'],
  ['notifications', '通知提醒', '来电与消息'],
  ['files', '文件接收', '下载与保存位置'],
  ['display', '画面与操作', '三维画面与快捷操作'],
  ['seat', '身份与工位', '座位与登录状态'],
] as const;

export default function SettingsDialog({ appearance, onAppearance, remembered, renderPaused,
  onRenderPaused, isVisitor, mySeat, onRepick, onClose }: {
  appearance: Appearance;
  onAppearance: (next: Appearance) => void;
  remembered: boolean | null;
  renderPaused: boolean;
  onRenderPaused: (paused: boolean) => void;
  isVisitor: boolean;
  mySeat: number | null;
  onRepick: () => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState<string>('look');
  const dialog = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const nodes = [...(dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? [])];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop">
    <section className="modal settings-modal" ref={dialog} tabIndex={-1}
      role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header className="settings-header">
        <div><small>你的 Office World</small><h2 id="settings-title">设置</h2></div>
        <button onClick={onClose} aria-label="关闭设置">×</button>
      </header>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="设置分类">
          {PAGES.map(([id, title, subtitle]) => <button key={id}
            className={page === id ? 'chosen' : ''} aria-current={page === id ? 'page' : undefined}
            onClick={() => setPage(id)}><strong>{title}</strong><small>{subtitle}</small></button>)}
        </nav>
        <div className="settings-content" key={page}>
          <h3>{PAGES.find(item => item[0] === page)?.[1]}</h3>
          {page === 'look' && <><p className="settings-intro">挑一个喜欢的颜色，搭配属于你的风格。修改后自动保存。</p>
            <CharacterSetting value={appearance} onChange={onAppearance} /></>}
          {page === 'notifications' && <section className="settings-card">
            <h4>系统通知</h4><NotificationSetting />
          </section>}
          {page === 'files' && <section className="settings-card">
            <h4>接收与保存</h4><FileReceiveSetting />
          </section>}
          {page === 'display' && <>
            <section className="settings-card"><h4>三维画面</h4>
              <label className="settings-row"><span>暂停三维画面<small>语音、屏幕共享和聊天继续运行</small></span>
                <input type="checkbox" checked={renderPaused} onChange={e => onRenderPaused(e.target.checked)} />
              </label>
            </section>
            <section className="settings-card"><h4>视角与行走</h4>
              <dl className="settings-shortcuts">
                <div><dt>旋转视角</dt><dd>中键拖动</dd></div>
                <div><dt>平移视角</dt><dd>Shift + 中键</dd></div>
                <div><dt>缩放画面</dt><dd>鼠标滚轮</dd></div>
                <div><dt>自由行走</dt><dd>点击地面 / WASD</dd></div>
                <div><dt>回到座位</dt><dd>点击自己的椅子或屏幕</dd></div>
              </dl>
            </section>
          </>}
          {page === 'seat' && <>
            <section className="settings-card"><h4>{isVisitor ? '访问人（客户）' : 'iruler 成员'}</h4>
              <div className="settings-row"><span>{isVisitor ? '我的座位：' : '我的工位：'}
                <strong>{isVisitor ? '公共区沙发' : mySeat === null ? '还没选' : workstationAt(mySeat)?.label}</strong>
              </span>
                {!isVisitor && <button onClick={() => { onClose(); onRepick(); }}>
                  {mySeat === null ? '去选工位' : '重新选座'}</button>}
              </div>
              <p>{isVisitor ? '访客在公共区沙发就坐。会议、私聊、语音和共享屏幕都可使用。'
                : '工位选定后会为你保留，共享预览显示在你的桌面屏幕上。'}</p>
            </section>
            {window.officeDesktop && <section className="settings-card"><h4>登录记忆</h4>
              <p>{remembered === null ? '检查中…' : remembered ? '已保存，下次启动自动登录' : '未保存'}</p>
            </section>}
          </>}
        </div>
      </div>
      <footer className="settings-footer"><span>让工作空间更合你的习惯</span><button onClick={onClose}>完成</button></footer>
    </section>
  </div>;
}
