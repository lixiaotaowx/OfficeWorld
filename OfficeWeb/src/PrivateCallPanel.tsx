import { useState } from 'react';
import type { useOffice } from './useOffice';
import ScreenStage from './ScreenStage';
import SharingPreview from './SharingPreview';
import CallAlerts from './CallAlerts';
import { colorFor } from './annotations';
import { MicIcon, MicOffIcon, PhoneIcon, HangupIcon, ScreenIcon } from './icons';
import './private-call.css';

export default function PrivateCallPanel({ office }: { office: ReturnType<typeof useOffice> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [mutedPeer, setMutedPeer] = useState<string | null>(null);
  // 折叠：通话窗口可以收起来，只留麦克风/共享/挂断三个按钮（用户 2026-09-15）。
  // 视频元素不卸载，只隐藏——展开时不用重新挂载，也不会碰到共享状态。
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const everySessionFolded = office.outgoing.length === 0 && office.sessions.length > 0
    && office.sessions.every(session => folded[session.id] === true);
  const respond = async (id: string, accept: boolean) => {
    if (busy) return;
    setBusy(id);
    try { await office.respond(id, accept); } finally { setBusy(null); }
  };
  return <>
    <CallAlerts alerts={office.callAlerts} onDismiss={office.dismissCallAlert}
      onRetry={(alert) => { office.dismissCallAlert(alert.id); void office.request(alert.target, alert.callKind); }} />
    <div className="incoming-calls">{office.requests.map(request => <div className="incoming-call" key={request.id}>
      <section className="call-invite" role="dialog" aria-label="来电邀请">
        <div className="call-avatar"><PhoneIcon /></div>
        <h2>{request.name}{request.kind === 'voice' ? ' 邀请你语音通话' :
          request.offer ? ' 邀请你看屏幕并语音通话' : ' 请求看你的屏幕并语音通话'}</h2>
        <p>{request.kind === 'screen' && !request.offer ? '接通后选择共享屏幕。' : '接通后即可语音交流。'}麦克风可随时静音。</p>
        <div className="actions">
          <button disabled={!!busy} onClick={() => void respond(request.id, false)}><HangupIcon />拒绝</button>
          <button className="primary" disabled={!!busy} onClick={() => void respond(request.id, true)}>
            <PhoneIcon />{busy === request.id ? '正在等待授权…' : '同意并接通'}</button>
        </div>
      </section>
    </div>)}</div>
    {(office.sessions.length > 0 || office.outgoing.length > 0) &&
      <div className={"session-panel private-calls" + (everySessionFolded ? " folded" : "")}>
      {office.outgoing.map(request => <div key={request.id}>
        <span>等待{office.people.find(p => p.id === request.target)?.name || '对方'}回应
          {request.kind === 'screen' ? ' · 屏幕与语音' : ' · 语音'}</span>
        <button onClick={() => office.cancelRequest(request.id)}>取消请求</button>
      </div>)}
      {office.sessions.map(session => {
        const state = office.callStates[session.id];
        const voice = state?.voice || '连接中';
        const peer = office.people.find(person => person.id === session.peer);
        // The picture on screen is the PEER's screen, so the peer is the sharer — and
        // only a client that can host the annotation layer can show marks on it. A
        // browser tab cannot, so we stop offering to draw there.
        const canAnnotate = peer?.annotate === true;
        const isFolded = folded[session.id] === true;
        const name = peer?.name || '对方';
        const fold = () => setFolded(old => ({ ...old, [session.id]: !isFolded }));
        const muteLabel = voice === '已开启' ? '静音' : voice === '声音已暂停' ? '切到此通话并开麦' : '开启或重试麦克风';
        const toggleMute = async () => {
          setBusy(session.id); try { await office.mute(session.id); } finally { setBusy(null); }
        };
        const startShare = async () => {
          setBusy(session.id); try { await office.shareInCall(session.id); } finally { setBusy(null); }
        };
        return <div key={session.id} className={isFolded ? 'call-folded' : undefined}>
          <header className="call-heading"><div className="call-avatar"><PhoneIcon /></div><div>
            <small>私人通话</small><strong>{name}</strong>
          </div><i className={state?.connected ? 'call-live' : ''} />
            <button className="call-fold" aria-expanded={!isFolded} onClick={fold}
              title={isFolded ? `${name} · 展开通话窗口` : '收起通话窗口，只留三个按钮'}
              aria-label={isFolded ? `展开与${name}的通话窗口` : '收起通话窗口'}>
              {isFolded ? '展开' : '收起'}
            </button></header>
          {isFolded ? <div className="private-call-actions folded">
            <button disabled={!state?.connected || busy === session.id} onClick={() => void toggleMute()}
              title={muteLabel} aria-label={muteLabel}>
              {voice === '已开启' ? <MicIcon /> : <MicOffIcon />}
            </button>
            {state?.sharing
              ? <button onClick={office.stopShare} title="停止共享" aria-label="停止共享"><ScreenIcon /></button>
              : <button disabled={!state?.connected || !!busy} onClick={() => void startShare()}
                  title="分享屏幕" aria-label="分享屏幕"><ScreenIcon /></button>}
            <button className="call-hangup" onClick={() => office.end(session.id)}
              title="挂断通话" aria-label="挂断通话"><HangupIcon /></button>
          </div> : <>
          <span role="status">{state?.connected ? '已连接' : '正在连接'} · 麦克风：{voice}</span>
          <span>{state?.sharing ? '正在分享你的屏幕' : office.videos[session.id] ? '正在观看对方屏幕' :
            session.kind === 'screen' ? '等待屏幕画面 · 语音通话保留' : '当前仅语音 · 屏幕已停止或尚未共享'}</span>
          {office.videos[session.id] && <ScreenStage
            stream={office.videos[session.id]}
            scope={session.room}
            label="对方共享屏幕"
            selfColor={colorFor(office.accountId)}
            annotatable={canAnnotate}
            onDraw={office.annotation.draw}
            onClear={office.annotation.clear}
            onUndo={office.annotation.undo}
            hint={state?.sharing || !canAnnotate ? undefined : '可点「标注」，笔迹会画在对方的共享屏幕上'}
            actions={<>
              <button disabled={!state?.connected || busy === session.id} onClick={() => void toggleMute()}>
                {voice === '已开启' ? <MicIcon /> : <MicOffIcon />}{voice === '已开启' ? '静音我' : '开麦'}</button>
              <button aria-pressed={mutedPeer === session.id} title="只影响本机听到的声音"
                onClick={() => {
                  const next = mutedPeer === session.id ? null : session.id;
                  setMutedPeer(next);
                  office.setRemoteAudioMuted(session.room, next !== null);
                }}>{mutedPeer === session.id ? '恢复对方声音' : '静音对方'}</button>
              {state?.sharing
                ? <button onClick={office.stopShare}><ScreenIcon />停止我的共享</button>
                : <button disabled={!state?.connected || !!busy} onClick={() => void startShare()}>
                    <ScreenIcon />{busy === session.id ? '正在选择屏幕…' : '抢占共享'}</button>}
              <button className="call-hangup" onClick={() => office.end(session.id)}><HangupIcon />挂断</button>
            </>} />}
          <div className="private-call-actions">
            <button disabled={!state?.connected || busy === session.id} onClick={() => void toggleMute()}>
              {voice === '已开启' ? <MicIcon /> : <MicOffIcon />}{muteLabel}</button>
            {state?.sharing && <button onClick={office.stopShare}><ScreenIcon />停止共享</button>}
            <button className="call-hangup" onClick={() => office.end(session.id)}><HangupIcon />挂断通话</button>
            {!state?.sharing && <button disabled={!state?.connected || !!busy} onClick={() => void startShare()}>
              <ScreenIcon />{busy === session.id ? '正在选择屏幕…' : '分享屏幕'}</button>}
          </div>
          {/* 我正在共享时给自己一块预览，带「清屏」。浮层是鼠标穿透的（别人能画到我的
              屏幕上，我点不到那层），所以分享者想擦掉笔迹只能从自己页面点
              （用户 2026-10-14：「分享者清屏按钮需要」）。 */}
          {state?.sharing && office.videos['local-screen'] && office.boardScope &&
            <SharingPreview stream={office.videos['local-screen']} meeting={false}
              scope={office.boardScope} onClear={office.annotation.clear}
              onStop={office.stopShare} />}
          </>}
        </div>;
      })}
    </div>}
  </>;
}
