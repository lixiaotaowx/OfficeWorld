import { useState } from 'react';
import type { useOffice } from './useOffice';
import ScreenStage from './ScreenStage';
import { colorFor } from './annotations';
import { MicIcon, MicOffIcon, PhoneIcon, HangupIcon, ScreenIcon } from './icons';
import './private-call.css';

export default function PrivateCallPanel({ office }: { office: ReturnType<typeof useOffice> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [mutedPeer, setMutedPeer] = useState<string | null>(null);
  const respond = async (id: string, accept: boolean) => {
    if (busy) return;
    setBusy(id);
    try { await office.respond(id, accept); } finally { setBusy(null); }
  };
  return <>
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
    {(office.sessions.length > 0 || office.outgoing.length > 0) && <div className="session-panel private-calls">
      {office.outgoing.map(request => <div key={request.id}>
        <span>等待{office.people.find(p => p.id === request.target)?.name || '对方'}回应
          {request.kind === 'screen' ? ' · 屏幕与语音' : ' · 语音'}</span>
        <button onClick={() => office.cancelRequest(request.id)}>取消请求</button>
      </div>)}
      {office.sessions.map(session => {
        const state = office.callStates[session.id];
        const voice = state?.voice || '连接中';
        return <div key={session.id}>
          <header className="call-heading"><div className="call-avatar"><PhoneIcon /></div><div>
            <small>私人通话</small><strong>{office.people.find(person => person.id === session.peer)?.name || '对方'}</strong>
          </div><i className={state?.connected ? 'call-live' : ''} /></header>
          <span role="status">{state?.connected ? '已连接' : '正在连接'} · 麦克风：{voice}</span>
          <span>{state?.sharing ? '正在分享你的屏幕' : office.videos[session.id] ? '正在观看对方屏幕' :
            session.kind === 'screen' ? '等待屏幕画面 · 语音通话保留' : '当前仅语音 · 屏幕已停止或尚未共享'}</span>
          {office.videos[session.id] && <ScreenStage
            stream={office.videos[session.id]}
            scope={session.room}
            label="对方共享屏幕"
            selfColor={colorFor(office.accountId)}
            onDraw={office.annotation.draw}
            onClear={office.annotation.clear}
            onUndo={office.annotation.undo}
            hint={state?.sharing ? undefined : '可点「标注」，笔迹会画在对方的共享屏幕上'}
            actions={<>
              <button disabled={!state?.connected || busy === session.id} onClick={async () => {
                setBusy(session.id); try { await office.mute(session.id); } finally { setBusy(null); }
              }}>{voice === '已开启' ? <MicIcon /> : <MicOffIcon />}{voice === '已开启' ? '静音我' : '开麦'}</button>
              <button aria-pressed={mutedPeer === session.id} title="只影响本机听到的声音"
                onClick={() => {
                  const next = mutedPeer === session.id ? null : session.id;
                  setMutedPeer(next);
                  office.setRemoteAudioMuted(session.room, next !== null);
                }}>{mutedPeer === session.id ? '恢复对方声音' : '静音对方'}</button>
              {state?.sharing
                ? <button onClick={office.stopShare}><ScreenIcon />停止我的共享</button>
                : <button disabled={!state?.connected || !!busy} onClick={async () => {
                    setBusy(session.id); try { await office.shareInCall(session.id); } finally { setBusy(null); }
                  }}><ScreenIcon />{busy === session.id ? '正在选择屏幕…' : '抢占共享'}</button>}
              <button className="call-hangup" onClick={() => office.end(session.id)}><HangupIcon />挂断</button>
            </>} />}
          <div className="private-call-actions">
            <button disabled={!state?.connected || busy === session.id} onClick={async () => {
              setBusy(session.id); try { await office.mute(session.id); } finally { setBusy(null); }
            }}>{voice === '已开启' ? <MicIcon /> : <MicOffIcon />}{voice === '已开启' ? '静音' : voice === '声音已暂停' ? '切到此通话并开麦' : '开启或重试麦克风'}</button>
            {state?.sharing && <button onClick={office.stopShare}><ScreenIcon />停止共享</button>}
            <button className="call-hangup" onClick={() => office.end(session.id)}><HangupIcon />挂断通话</button>
            {!state?.sharing && <button disabled={!state?.connected || !!busy} onClick={async () => {
              setBusy(session.id); try { await office.shareInCall(session.id); } finally { setBusy(null); }
            }}><ScreenIcon />{busy === session.id ? '正在选择屏幕…' : '分享屏幕'}</button>}
          </div>
        </div>;
      })}
    </div>}
  </>;
}
