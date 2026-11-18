import { useEffect, useRef, useState } from 'react';\
import { useEffect, useId, useRef, useState } from 'react';\
import './hall-settings.css';\
const PAGES: [SettingsPage, string][] = [['look', '我的形象'], ['notify', '通知'], ['files', '文件'], ['screen', '屏幕与预览'], ['view', '显示与操作'], ['account', '工位与账号']];\
const PAGE_DETAIL: Record<SettingsPage, { description: string; icon: string }> = {\
  look: { description: '选一个喜欢的颜色，搭配你的日常形象。', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2' },\
  notify: { description: '安排消息和来电提醒，保持联系。', icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6' },\
  files: { description: '管理同事发来的文件和本机保存位置。', icon: 'M3 7V4h7l2 3h9v13H3V7Z' },\
  screen: { description: '选择共享屏幕，调整工位画面的预览方式。', icon: 'M3 3h18v13H3V3ZM12 16v5M8 21h8' },\
  view: { description: '调整大厅画面、窗口和操作习惯。', icon: 'M4 7h16M4 17h16M8 4v6M16 14v6' },\
  account: { description: '管理你的工位、登录状态和客户端。', icon: 'M3 10 12 3l9 7v11H3V10ZM9 21v-7h6v7' },\
};\
}) {\
  const sheet = useRef<HTMLElement>(null);\
  const pane = useRef<HTMLDivElement>(null);\
  const tabId = useId();\
  useEffect(() => { pane.current?.scrollTo?.(0, 0); }, [p.page]);\
    <header><strong>设置</strong><button type="button" aria-label="关闭设置" onClick={p.onClose}>\
    <header className="settings-header"><div><strong>设置</strong><small>个人偏好与工作空间</small></div><button type="button" aria-label="关闭设置" onClick={p.onClose}>\
    <nav className="tabs" role="tablist">{PAGES.map(([id, name]) =>\
      <button type="button" role="tab" key={id} aria-selected={p.page === id} onClick={() => p.onPage(id)}>{name}</button>)}</nav>\
    <div className="pane">\
    <nav className="tabs" role="tablist" aria-label="设置分类">{PAGES.map(([id, name], index) =>\
      <button type="button" role="tab" key={id} id={`${tabId}-${id}`} aria-controls={`${tabId}-panel`} tabIndex={p.page === id ? 0 : -1}\
        aria-selected={p.page === id} onClick={() => p.onPage(id)} onKeyDown={e => {\
          const direction = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;\
          if (!direction && e.key !== 'Home' && e.key !== 'End') return;\
          e.preventDefault();\
          const next = e.key === 'Home' ? 0 : e.key === 'End' ? PAGES.length - 1 : (index + direction + PAGES.length) % PAGES.length;\
          p.onPage(PAGES[next][0]); document.getElementById(`${tabId}-${PAGES[next][0]}`)?.focus();\
        }}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={PAGE_DETAIL[id].icon} /></svg>{name}</button>)}</nav>\
    <div ref={pane} className="pane" role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${p.page}`} tabIndex={0}>\
      <div className="settings-page-heading"><h3>{PAGES.find(([id]) => id === p.page)?.[1]}</h3><p>{PAGE_DETAIL[p.page].description}</p></div>\
          <p>离开窗口立即暂停绘制，30 秒后释放办公室 3D 显存；返回时从内存恢复。聊天和通话继续运行。</p>\
          <p className="settings-note">隐藏或最小化窗口后暂停绘制，30 秒后释放 3D 显存；返回时恢复画面。聊天和通话继续运行。</p>\
